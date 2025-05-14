import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export function getCertPaths() {
  const projectRootPath = path.resolve(__dirname, '../../../../');

  let MYSQL_SSL_CA = process.env.MYSQL_SSL_CA;
  let MYSQL_CLIENT_KEY = process.env.MYSQL_CLIENT_KEY;
  let MYSQL_CLIENT_CERT = process.env.MYSQL_CLIENT_CERT;

  if (MYSQL_SSL_CA) {
    MYSQL_SSL_CA = path.join(projectRootPath, MYSQL_SSL_CA);
  }
  if (MYSQL_CLIENT_KEY) {
    MYSQL_CLIENT_KEY = path.join(projectRootPath, MYSQL_CLIENT_KEY);
  }
  if (MYSQL_CLIENT_CERT) {
    MYSQL_CLIENT_CERT = path.join(projectRootPath, MYSQL_CLIENT_CERT);
  }

  if (
    (MYSQL_SSL_CA && !existsSync(MYSQL_SSL_CA)) ||
    (MYSQL_CLIENT_KEY && !existsSync(MYSQL_CLIENT_KEY)) ||
    (MYSQL_CLIENT_CERT && !existsSync(MYSQL_CLIENT_CERT))
  ) {
    throw new Error(
      'MYSQL_SSL_CA or MYSQL_CLIENT_KEY or MYSQL_CLIENT_CERT is not exists',
    );
  }

  return {
    MYSQL_SSL_CA,
    MYSQL_CLIENT_KEY,
    MYSQL_CLIENT_CERT,
  };
}

export function getBackupSSLCommand() {
  const { MYSQL_SSL_CA, MYSQL_CLIENT_KEY, MYSQL_CLIENT_CERT } = getCertPaths();

  if (MYSQL_SSL_CA && MYSQL_CLIENT_KEY && MYSQL_CLIENT_CERT) {
    return ` --ssl-ca=${MYSQL_SSL_CA} --ssl-cert=${MYSQL_CLIENT_CERT} --ssl-key=${MYSQL_CLIENT_KEY}`;
  }

  return '';
}
