import { exec } from 'node:child_process';
import { access, readFile, stat, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { promisify } from 'node:util';
import { log, logError } from '@tk-crawler/script-tools';

const execAsync = promisify(exec);

interface Config {
  env: string;
  envFile: string;
  imageName: string;
  lastBuildFile: string;
  imageVersion: string;
}

const IMAGE_VERSION = '0.0.1';

const PROJECT_NAME = 'tk-crawler-redis';

async function fileExists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function needRebuild(config: Config): Promise<boolean> {
  const { lastBuildFile } = config;

  // 检查构建记录文件是否存在
  if (!(await fileExists(lastBuildFile))) {
    log({
      projectName: PROJECT_NAME,
      message: 'No build record found, rebuild needed',
    });
    return true;
  }

  try {
    const lastBuildTime = Number.parseInt(
      await readFile(lastBuildFile, 'utf-8'),
    );

    // 需要检查的关键文件
    const filesToCheck = [
      'Dockerfile',
      'docker-entrypoint.sh',
      'redis.template.conf',
      'docker-compose.yml',
      'start.ts',
      `docker-compose.${config.env}.yml`,
      config.envFile,
    ];

    for (const file of filesToCheck) {
      if (await fileExists(file)) {
        const stats = await stat(file);
        if (stats.mtimeMs / 1000 > lastBuildTime) {
          log({
            projectName: PROJECT_NAME,
            message: `File ${file} has been modified, rebuild needed`,
          });
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    logError({
      projectName: PROJECT_NAME,
      message: `Error checking build status:`,
    });
    logError({
      projectName: PROJECT_NAME,
      message: error,
    });
    return true;
  }
}

async function createVolumeIfNotExists(volumeName: string): Promise<void> {
  try {
    await execAsync(`docker volume inspect ${volumeName}`);
    log({
      projectName: PROJECT_NAME,
      message: `Volume ${volumeName} already exists`,
    });
  } catch {
    log({
      projectName: PROJECT_NAME,
      message: `Creating volume: ${volumeName}`,
    });
    await execAsync(`docker volume create ${volumeName}`);
  }
}

async function main() {
  try {
    // 切换到脚本所在目录
    process.chdir(__dirname);

    const env = process.argv[2] || 'development';

    const config: Config = {
      env,
      envFile: `.env.${env}`,
      imageName: 'tk-crawler/custom-redis',
      lastBuildFile: `.last_build_${env}`,
      imageVersion: IMAGE_VERSION,
    };
    process.env.IMAGE_VERSION = IMAGE_VERSION;

    // 检查环境文件是否存在
    if (!(await fileExists(config.envFile))) {
      throw new Error(`Error: ${config.envFile} file not found`);
    }

    // 创建 volume
    const volumeName = `tk-crawler-redis-${config.env}`;
    await createVolumeIfNotExists(volumeName);

    // 检查是否需要重新构建
    if (await needRebuild(config)) {
      log({
        projectName: PROJECT_NAME,
        message: 'Building new image...',
      });
      await execAsync(
        `docker-compose -p tk-crawler-redis-${config.env} -f docker-compose.yml -f docker-compose.${config.env}.yml --env-file ${config.envFile} build`,
      );
      // 记录构建时间
      await writeFile(
        config.lastBuildFile,
        Math.floor(Date.now() / 1000).toString(),
      );
    } else {
      log({
        projectName: PROJECT_NAME,
        message: 'No rebuild needed, using existing image',
      });
    }

    // 启动服务
    log({
      projectName: PROJECT_NAME,
      message: 'Starting services...',
    });
    await execAsync(
      `docker-compose -p tk-crawler-redis-${config.env} -f docker-compose.yml -f docker-compose.${config.env}.yml --env-file ${config.envFile} up -d`,
    );

    log({
      projectName: PROJECT_NAME,
      message: 'Services started successfully',
    });
  } catch (error) {
    logError({
      projectName: PROJECT_NAME,
      message: error,
    });
    process.exit(1);
  }
}

main();
