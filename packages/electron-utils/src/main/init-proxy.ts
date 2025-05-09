import type { Logger } from '@tk-crawler/shared';

import process from 'node:process';

import { session } from 'electron';
import { get as getSystemProxy } from 'get-system-proxy';
import { bootstrap } from 'global-agent';

let isInitializing = false;

export async function initProxy(logger?: Logger) {
  if (isInitializing) {
    return;
  }
  isInitializing = true;
  try {
    await updateNodeProxy(logger);
    await updateBrowserProxySettings(logger);
  } finally {
    isInitializing = false;
  }
}

async function updateNodeProxy(logger?: Logger) {
  logger?.info('updateNodeProxy');
  try {
    const proxy = await getSystemProxy();
    if (proxy) {
      const proxyUrl = `${proxy.type}://${proxy.host}:${proxy.port}`;
      process.env.GLOBAL_AGENT_HTTP_PROXY = proxyUrl;
      process.env.GLOBAL_AGENT_HTTPS_PROXY = proxyUrl;
      process.env.GLOBAL_AGENT_NO_PROXY = 'localhost,127.0.0.1,::1,.local';
      bootstrap();
    }
  } catch (error) {
    logger?.error('Failed to initNodeProxy:', error);
  }
}

export async function updateBrowserProxySettings(logger?: Logger) {
  try {
    // 重新设置系统代理
    await session.defaultSession.setProxy({
      mode: 'system',
    });
    logger?.info('Proxy settings updated');
  } catch (error) {
    logger?.error('Failed to update browser proxy settings:', error);
  }
}
