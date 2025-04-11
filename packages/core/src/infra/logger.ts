import type { Logger } from '@tk-crawler/shared';
import { setLogger as setTkRequestsLogger } from '@tk-crawler/tk-requests';

let logger: Logger | undefined;

export function setLogger(_logger: Logger) {
  if (logger && logger !== _logger) {
    throw new Error('Logger is already set');
  }
  logger = _logger;
  setTkRequestsLogger(_logger);
}

export function getLogger() {
  if (!logger) {
    throw new Error('Logger is not set');
  }
  return logger;
}
