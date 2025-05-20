import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { app } from 'electron';
import log4js from 'log4js';
import { isDevelopment, isProduction } from '../env';

class Logger {
  private static _instance: Logger | undefined;
  private logger: log4js.Logger;

  private constructor() {
    // 获取适合的日志目录
    const logDir = this._getLogDirectory();

    // 确保目录存在
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    log4js.configure({
      // appenders: {
      //   file: {
      //     type: 'dateFile',
      //     filename: path.join(logDir, 'app.log'),
      //     pattern: '.yyyy-MM-dd',
      //     compress: true,
      //     // 保留30天的日志
      //     daysToKeep: 30,
      //     // 保持文件名为 app.log
      //     keepFileExt: true,
      //   },
      //   console: {
      //     type: 'console',
      //   },
      // },
      appenders: {
        // 控制台输出所有日志
        console: {
          type: 'console',
        },
        // 文件存储所有日志
        daily: {
          type: 'dateFile',
          filename: path.join(logDir, 'daily/app.log'),
          pattern: '.yyyy-MM-dd',
          // compress: true,
          keepFileExt: true,
          daysToKeep: 7,
        },
        // 错误日志文件配置
        error: {
          type: 'file',
          filename: path.join(logDir, 'error/error.log'),
          maxLogSize: '10M',
          backups: 5,
          keepFileExt: true,
        },
        // 错误日志过滤器
        errorFilter: {
          type: 'logLevelFilter',
          appender: 'error',
          level: 'error', // 只允许error级别通过
        },
      },
      categories: {
        default: {
          appenders: [
            'console', // 控制台显示所有日志
            'daily', // daily文件记录所有日志
            'errorFilter', // error文件只记录错误日志
          ],
          level: isDevelopment ? 'info' : 'info',
        },
      },
    });

    this.logger = log4js.getLogger();
  }

  private _getLogDirectory(): string {
    let basePath: string;

    if (isProduction) {
      // 生产环境使用系统标准日志目录
      if (process.platform === 'darwin') {
        // macOS: ~/Library/Logs/YourAppName
        basePath = app.getPath('logs');
      } else if (process.platform === 'win32') {
        // Windows: %USERPROFILE%\AppData\Roaming\YourAppName\logs
        basePath = path.join(app.getPath('userData'), 'logs');
      } else {
        // Linux: ~/.config/YourAppName/logs
        basePath = path.join(app.getPath('userData'), 'logs');
      }
    } else {
      // 开发环境使用项目目录
      basePath = path.join(process.cwd(), 'logs');
    }

    return basePath;
  }

  public static getInstance(): Logger {
    if (!Logger._instance) {
      Logger._instance = new Logger();
    }
    return Logger._instance;
  }

  public info(message: any, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  public error(message: any, ...args: any[]): void {
    this.logger.error(message, ...args);
  }

  public debug(message: any, ...args: any[]): void {
    this.logger.debug(message, ...args);
  }

  public warn(message: any, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }

  public trace(message: any, ...args: any[]): void {
    this.logger.trace(message, ...args);
  }
}

export const logger = Logger.getInstance();
