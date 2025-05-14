import process from 'node:process';
import { backupDatabase } from './backup';

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  const strategy =
    args.find(arg => arg.startsWith('--strategy='))?.split('=')[1] || 'full';
  const onlyScript =
    args.find(arg => arg.startsWith('--only-script='))?.split('=')[1] ===
      'true' || true;

  if (strategy !== 'full' && strategy !== 'incremental') {
    console.error('Invalid strategy. Must be either "full" or "incremental"');
    process.exit(1);
  }

  try {
    await backupDatabase({ strategy, onlyScript });
    // console.log(`Backup completed successfully with ${strategy} strategy`);
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

main();
