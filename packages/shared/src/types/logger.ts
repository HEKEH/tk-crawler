export interface Logger {
  info: (message: any, ...args: any[]) => void;
  error: (message: any, ...args: any[]) => void;
  debug: (message: any, ...args: any[]) => void;
  trace: (message: any, ...args: any[]) => void;
  warn: (message: any, ...args: any[]) => void;
}
