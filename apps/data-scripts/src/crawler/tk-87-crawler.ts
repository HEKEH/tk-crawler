import type { Crawler } from './types';
import { logger } from '../infra/logger';

export class TK87Crawler implements Crawler {
  async run(): Promise<boolean> {
    logger.info('TK87Crawler is running');
    return true;
  }
}
