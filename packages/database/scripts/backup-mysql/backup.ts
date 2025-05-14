import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';
import { PrismaClient } from '@prisma/client';
import { getBackupSSLCommand } from './utils';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

interface BackupOptions {
  strategy: 'full' | 'incremental';
  tables?: string[] | 'all';
  outputDir?: string;
  compress?: boolean;
  onlyScript?: boolean;
}

interface BackupMetadata {
  type: 'full' | 'incremental';
  timestamp: string;
  tables?: string[] | 'all';
  path: string;
  size: number;
  logFile?: string;
  position?: string;
}

export async function backupDatabase(options?: BackupOptions) {
  const {
    strategy = 'full',
    tables = 'all',
    outputDir = path.join(__dirname, 'backups-mysql-files'),
    compress = true,
    onlyScript = false,
  } = options || {};

  // Create backup directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup-${strategy}-${timestamp}.sql`;
  const backupPath = path.join(outputDir, backupFileName);
  const metadataPath = path.join(outputDir, 'backup-metadata.json');

  try {
    // Get database connection info from environment variables
    const dbUser = process.env.MYSQL_USER;
    const dbPassword = process.env.MYSQL_PASSWORD;
    const dbHost = process.env.MYSQL_HOST;
    const dbPort = process.env.MYSQL_PORT;
    const dbName = process.env.MYSQL_DATABASE;

    if (!dbUser || !dbPassword || !dbHost || !dbPort || !dbName) {
      throw new Error('Required MySQL environment variables are not set');
    }

    let backupCommand = '';
    let logFile: string | undefined;
    let position: string | undefined;

    if (strategy === 'full') {
      // Full backup - can be of all tables or specific tables
      backupCommand = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} ${dbName}`;
      if (tables !== 'all' && tables.length > 0) {
        backupCommand += ` ${tables.join(' ')}`;
      }
      // Add SSL options if present
      backupCommand += getBackupSSLCommand();
    } else {
      // Incremental backup using binary logs
      // First, get the last backup log file and position
      let lastLogFile: string | undefined;
      let lastPosition: string | undefined;

      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(
          fs.readFileSync(metadataPath, 'utf-8'),
        ) as BackupMetadata[];
        const lastBackup = metadata
          .reverse()
          .find(m => m.type === 'incremental' && m.logFile && m.position);
        if (lastBackup?.logFile && lastBackup?.position) {
          lastLogFile = lastBackup.logFile;
          lastPosition = lastBackup.position;
        }
      }

      try {
        // Get all binlog files
        const { stdout: logFilesOutput } = await execAsync(
          `mysql -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} -e "SHOW BINARY LOGS\\G"`,
        );

        // Parse the output correctly
        const logFiles = logFilesOutput
          .split('***************************')
          .filter(entry => entry.trim() && entry.includes('Log_name:'))
          .map(entry => {
            const nameMatch = entry.match(/Log_name:\s*([^\n]+)/);
            const sizeMatch = entry.match(/File_size:\s*(\d+)/);
            if (!nameMatch || !sizeMatch) {
              return null;
            }
            return {
              name: nameMatch[1].trim(),
              size: sizeMatch[1],
            };
          })
          .filter((log): log is { name: string; size: string } => log !== null);

        if (logFiles.length === 0) {
          throw new Error('No binary logs found');
        }

        // Find start file and index
        let startIndex = 0;
        let startPos = '4';
        if (lastLogFile && lastPosition) {
          const idx = logFiles.findIndex(log => log.name === lastLogFile);
          if (idx !== -1) {
            startIndex = idx;
            startPos = lastPosition;
          }
        }

        // The latest log file and its size
        const endLog = logFiles[logFiles.length - 1];
        logFile = endLog.name;
        position = endLog.size;

        // Build mysqlbinlog command
        backupCommand = `mysqlbinlog --host=${dbHost} --port=${dbPort} --user=${dbUser} --password=${dbPassword} --read-from-remote-server`;
        backupCommand += getBackupSSLCommand();

        // Process each file with appropriate parameters
        for (let i = startIndex; i < logFiles.length; i++) {
          const currentLog = logFiles[i];
          let fileCommand = '';

          if (i === startIndex) {
            // First file: start from startPosition
            fileCommand = ` --start-position=${startPos} ${currentLog.name}`;
          } else if (i === logFiles.length - 1) {
            // Last file: end at endPosition
            fileCommand = ` --stop-position=${position} ${currentLog.name}`;
          } else {
            // Middle files: include entire file
            fileCommand = ` ${currentLog.name}`;
          }

          backupCommand += fileCommand;
        }
      } catch {
        throw new Error(
          'Could not get binary log information. Please ensure you have proper permissions and binary logging is enabled.',
        );
      }
    }

    // Add compression if requested
    if (compress) {
      backupCommand += ' | gzip';
      backupCommand += ` > ${backupPath}.gz`;
    } else {
      backupCommand += ` > ${backupPath}`;
    }

    console.log(backupCommand);

    // Execute backup command
    if (onlyScript) {
      // Generate shell script
      const scriptPath = path.join(
        outputDir,
        `backup-${strategy}-${timestamp}.sh`,
      );
      const scriptContent = `#!/bin/bash
set -e

# Create output directory if it doesn't exist
mkdir -p "${outputDir}"

# Backup command with MySQL 8.0+ authentication
${backupCommand.replace('mysqldump', 'mysqldump --protocol=TCP --ssl-mode=PREFERRED --connect-timeout=60')}

# Create backup info JSON
cat > ${path.join(outputDir, `backup-info-${timestamp}.json`)} << EOF
${JSON.stringify(
  {
    type: strategy,
    timestamp,
    tables,
    path: `${backupPath}${compress ? '.gz' : ''}`,
    size: 0, // Will be updated after backup
    logFile: strategy === 'incremental' ? logFile : undefined,
    position: strategy === 'incremental' ? position : undefined,
  },
  null,
  2,
)}
EOF

# Update metadata file
if [ -f "${metadataPath}" ]; then
  # If metadata file exists, append new backup info
  jq -s '.[0] + [.[1]]' "${metadataPath}" "${path.join(outputDir, `backup-info-${timestamp}.json`)}" > "${metadataPath}.tmp"
  mv "${metadataPath}.tmp" "${metadataPath}"
else
  # If metadata file doesn't exist, create it with first backup info
  cp "${path.join(outputDir, `backup-info-${timestamp}.json`)}" "${metadataPath}"
fi

# Update backup size in metadata
if [ -f "${backupPath}${compress ? '.gz' : ''}" ]; then
  size=\$(stat -f%z "${backupPath}${compress ? '.gz' : ''}")
  jq --arg size "\$size" '.[-1].size = ($size | tonumber)' "${metadataPath}" > "${metadataPath}.tmp"
  mv "${metadataPath}.tmp" "${metadataPath}"
fi

# Clean up temporary files
rm "${path.join(outputDir, `backup-info-${timestamp}.json`)}"
`;

      fs.writeFileSync(scriptPath, scriptContent);
      fs.chmodSync(scriptPath, '755'); // Make script executable
      console.log(`Backup script generated at: ${scriptPath}`);
    } else {
      await execAsync(backupCommand);
      // Log backup metadata
      const backupInfo: BackupMetadata = {
        type: strategy,
        timestamp,
        tables,
        path: `${backupPath}${compress ? '.gz' : ''}`,
        size: fs.statSync(`${backupPath}${compress ? '.gz' : ''}`).size,
        logFile: strategy === 'incremental' ? logFile : undefined,
        position: strategy === 'incremental' ? position : undefined,
      };

      // Save backup metadata
      let metadata: BackupMetadata[] = [];
      if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      }
      metadata.push(backupInfo);
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    }
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Example usage:
// Full backup of all tables
// await backupDatabase({ strategy: 'full' });  // tables defaults to 'all'

// Full backup of specific tables
// await backupDatabase({
//   strategy: 'full',
//   tables: ['users', 'posts'],
// });

// Incremental backup (tracks changes since last backup)
// await backupDatabase({
//   strategy: 'incremental',
//   outputDir: './custom-backups',
//   compress: true,
// });  // tables defaults to 'all'
