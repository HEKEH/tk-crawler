interface Logger {
  info: (message: any, ...args: any[]) => void;
  error: (message: any, ...args: any[]) => void;
  debug: (message: any, ...args: any[]) => void;
  trace: (message: any, ...args: any[]) => void;
  warn: (message: any, ...args: any[]) => void;
}

let logger: Logger | undefined;

export function setLogger(_logger: Logger) {
  logger = _logger;
}

export function getLogger() {
  if (!logger) {
    throw new Error('Logger is not set');
  }
  return logger;
}
