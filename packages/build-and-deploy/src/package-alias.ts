import { resolve } from 'node:path';

export const CommonPackageAlias = {
  '@tk-crawler/shared': resolve(__dirname, '../../shared/src'),
  '@tk-crawler/biz-shared': resolve(__dirname, '../../biz-shared/src'),
  '@tk-crawler/view-shared': resolve(__dirname, '../../view-shared/src'),
  '@tk-crawler/electron-utils': resolve(__dirname, '../../electron-utils/src'),
  '@tk-crawler/tk-requests': resolve(__dirname, '../../tk-requests/src'),
  '@tk-crawler/core': resolve(__dirname, '../../core/src'),
  '@tk-crawler/styles': resolve(__dirname, '../../styles'),
  '@tk-crawler/assets': resolve(__dirname, '../../assets'),
  '@tk-crawler/main-client-shared': resolve(
    __dirname,
    '../../main-client-shared/src',
  ),
};
