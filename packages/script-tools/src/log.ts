export enum LogColor {
  reset = '\x1B[0m',

  red = '\x1B[91m',
  yellow = '\x1B[33m',
  blue = '\x1B[34m',

  lavender = '\x1B[95m',
  rose = '\x1B[35m', // Soft pink
  deepBlue = '\x1B[94m', // Muted deep blue
  seafoam = '\x1B[96m', // Light turquoise
  mint = '\x1B[92m', // Soft mint green
}

function formatMessage(message: unknown | unknown[]): string {
  return typeof message === 'object'
    ? JSON.stringify(message, null, 2)
    : String(message);
}

export function log({
  projectName,
  color,
  message,
}: {
  projectName?: string;
  color?: LogColor;
  message: unknown;
}) {
  const formattedMessage = formatMessage(message);
  if (projectName) {
    console.log(
      // color is only applied to the project name
      `${color || LogColor.reset}[${projectName}] ${
        LogColor.reset
      }${formattedMessage}`,
    );
  } else {
    console.log(
      `${color || LogColor.reset}${formattedMessage}${LogColor.reset}`,
    );
  }
}

export function logError({
  projectName,
  color,
  message,
}: {
  projectName?: string;
  /** color is only applied to the project name  */
  color?: LogColor;
  message: unknown;
}): void {
  const formattedMessage = formatMessage(message);

  if (formattedMessage.toLowerCase().includes('warning')) {
    let logMessage = `${LogColor.yellow}${formattedMessage}${LogColor.reset}`;
    if (projectName) {
      logMessage = `${color || LogColor.yellow}[${projectName}] ${logMessage}`;
    }
    console.warn(logMessage);
  } else {
    let logMessage = `${LogColor.red}${formattedMessage}${LogColor.reset}`;
    if (projectName) {
      logMessage = `${color || LogColor.red}[${projectName}] ${logMessage}`;
    }
    console.error(logMessage);
  }
}
