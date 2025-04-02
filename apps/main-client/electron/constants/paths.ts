import path from 'node:path';
import process from 'node:process';
import { app } from 'electron';
import { isProduction } from '../env';

export function getTokenPath() {
  if (isProduction) {
    return path.join(app.getPath('userData'), 'client-token');
  }
  return path.join(process.cwd(), 'client-token');
}
