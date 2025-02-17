export interface TKCCoreConfig {
  ownServerUrl: string;
}

let config: TKCCoreConfig | undefined;

export function setConfig(_config: TKCCoreConfig) {
  config = _config;
}

export function getConfig() {
  if (!config) {
    throw new Error('Config is not set');
  }
  return config;
}
