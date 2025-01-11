import * as process from 'node:process';
import log from 'loglevel';

// 设置全局日志级别
log.setLevel(process.env.NODE_ENV === 'production' ? 'debug' : 'debug');

// 创建带前缀的 logger
const logger = log.getLogger('TKCrawler');

export { logger };
