import type { Logger } from '@tk-crawler/shared';

import process from 'node:process';

import { get as getSystemProxy } from 'get-system-proxy';
import { bootstrap } from 'global-agent';

export async function initProxy(logger?: Logger) {
  logger?.info('initProxy');
  const proxy = await getSystemProxy();
  if (proxy) {
    const proxyUrl = `${proxy.type}://${proxy.host}:${proxy.port}`;
    process.env.GLOBAL_AGENT_HTTP_PROXY = proxyUrl;
    process.env.GLOBAL_AGENT_HTTPS_PROXY = proxyUrl;
    process.env.GLOBAL_AGENT_NO_PROXY = 'localhost,127.0.0.1,::1,.local';
    bootstrap();
  }
}
