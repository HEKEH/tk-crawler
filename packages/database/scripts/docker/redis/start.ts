import type { ExecOptions } from 'node:child_process';
import { exec } from 'node:child_process';
import { access, readFile, stat, writeFile } from 'node:fs/promises';
import { platform } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';
import { log, logError } from '@tk-crawler/script-tools';

interface Config {
  env: string;
  envFile: string;
  lastBuildFile: string;
}

// --- 换项目时需要修改的部分 ---
const PROJECT_NAME = 'tk-crawler-redis';
const PROJECT_ROOT_PATH = join(__dirname, '../../../../../');
const IMAGE_NAME = 'tk-crawler/custom-redis';
const IMAGE_VERSION = '0.0.1';
// 重新构建需要检查的关键文件
const FilesToCheckForRebuild = [
  'Dockerfile',
  'docker-entrypoint.sh',
  'redis.template.conf',
  'docker-compose.build.yml',
  'start.ts',
];
function getVolumeSettings(
  env: string,
): { envKey: string; volumeName: string }[] {
  return [{ envKey: 'VOLUME_NAME', volumeName: `${PROJECT_NAME}-${env}` }];
}
// --- 换项目时需要修改的部分 ---

const execAsync = promisify(exec);

const isWindows = platform() === 'win32';

// 根据平台配置 exec 选项
function getExecOptions(): ExecOptions {
  return {
    // Windows 上隐藏命令窗口
    windowsHide: isWindows,
  };
}

async function execCommand(command: string): Promise<string> {
  try {
    const { stdout } = await execAsync(command, getExecOptions());
    return stdout.trim();
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error}`);
  }
}

async function fileExists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function imageExists(): Promise<boolean> {
  try {
    const imageName = `${IMAGE_NAME}:${IMAGE_VERSION}`;
    await execCommand(`docker image inspect ${imageName}`);
    return true;
  } catch {
    // 如果命令执行失败（镜像不存在），返回 false
    return false;
  }
}

async function needRebuild(config: Config): Promise<boolean> {
  if (!(await imageExists())) {
    log({
      projectName: PROJECT_NAME,
      message: 'Image not found, rebuild needed',
    });
    return true;
  }

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

    for (const file of FilesToCheckForRebuild) {
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
    await execCommand(`docker volume inspect ${volumeName}`);
    log({
      projectName: PROJECT_NAME,
      message: `Volume ${volumeName} already exists`,
    });
  } catch {
    log({
      projectName: PROJECT_NAME,
      message: `Creating volume: ${volumeName}`,
    });
    await execCommand(`docker volume create ${volumeName}`);
  }
}

async function main() {
  try {
    // 切换到脚本所在目录
    process.chdir(__dirname);

    const env = process.argv[2] || 'development';

    const config: Config = {
      env,
      envFile: join(PROJECT_ROOT_PATH, `.env.${env}`),
      lastBuildFile: '.last_build',
    };
    process.env.IMAGE_NAME = IMAGE_NAME;
    process.env.IMAGE_VERSION = IMAGE_VERSION;

    // 检查环境文件是否存在
    if (!(await fileExists(config.envFile))) {
      throw new Error(`Error: ${config.envFile} file not found`);
    }

    const CONTAINER_NAME = `${PROJECT_NAME}-${config.env}`;
    process.env.CONTAINER_NAME = CONTAINER_NAME;

    // 创建 volume
    const volumeSettings = getVolumeSettings(config.env);
    for (const { envKey, volumeName } of volumeSettings) {
      await createVolumeIfNotExists(volumeName);
      process.env[envKey] = volumeName;
    }

    // 检查是否需要重新构建
    if (await needRebuild(config)) {
      log({
        projectName: PROJECT_NAME,
        message: 'Building new image...',
      });
      await execCommand(`docker-compose -f docker-compose.build.yml build`);
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
    await execCommand(
      `docker-compose -p ${CONTAINER_NAME} -f docker-compose.run.yml --env-file ${config.envFile} up -d`,
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
