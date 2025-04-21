import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { getTokenPath } from '../../constants';
import { logger } from '../../infra/logger';

export function getToken() {
  const tokenPath = getTokenPath();
  if (!existsSync(tokenPath)) {
    return;
  }
  let token = readFileSync(tokenPath, 'utf-8');
  token = token.trim();
  if (token) {
    return token;
  }
}

export function saveToken(token: string) {
  const tokenPath = getTokenPath();
  if (!tokenPath) {
    throw new Error('Token path is not set');
  }
  try {
    const dir = dirname(tokenPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(tokenPath, token);
  } catch (error) {
    logger.error('Failed to save token file:', error);
  }
}

export function removeToken() {
  const tokenPath = getTokenPath();
  if (!tokenPath) {
    return;
  }
  writeFileSync(tokenPath, '');
}
