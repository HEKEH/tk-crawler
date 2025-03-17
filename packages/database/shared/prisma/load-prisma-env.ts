import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export function loadPrismaEnv(projectRootPath: string) {
  try {
    let MYSQL_SSL_CA = process.env.MYSQL_SSL_CA;
    let MYSQL_CLIENT_IDENTITY = process.env.MYSQL_CLIENT_IDENTITY;

    if (MYSQL_SSL_CA) {
      MYSQL_SSL_CA = path.join(projectRootPath, MYSQL_SSL_CA);
    }
    if (MYSQL_CLIENT_IDENTITY) {
      MYSQL_CLIENT_IDENTITY = path.join(projectRootPath, MYSQL_CLIENT_IDENTITY);
    }
    if (
      (MYSQL_SSL_CA && !existsSync(MYSQL_SSL_CA)) ||
      (MYSQL_CLIENT_IDENTITY && !existsSync(MYSQL_CLIENT_IDENTITY))
    ) {
      throw new Error('MYSQL_SSL_CA or MYSQL_CLIENT_IDENTITY is not exists');
    }

    const MYSQL_USER = process.env.MYSQL_USER;
    const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
    const MYSQL_HOST = process.env.MYSQL_HOST;
    const MYSQL_PORT = process.env.MYSQL_PORT;
    const MYSQL_DATABASE = process.env.MYSQL_DATABASE;
    const MYSQL_DATABASE_SHADOW = process.env.MYSQL_DATABASE_SHADOW;
    const PKCS12_IDENTITY_PASSWORD = process.env.PKCS12_IDENTITY_PASSWORD;
    if (
      !MYSQL_USER ||
      !MYSQL_PASSWORD ||
      !MYSQL_HOST ||
      !MYSQL_PORT ||
      !MYSQL_DATABASE ||
      !MYSQL_DATABASE_SHADOW ||
      !PKCS12_IDENTITY_PASSWORD
    ) {
      throw new Error(
        'MYSQL_USER or MYSQL_PASSWORD or MYSQL_HOST or MYSQL_PORT or MYSQL_DATABASE or MYSQL_DATABASE_SHADOW or PKCS12_IDENTITY_PASSWORD is not set',
      );
    }
    if (MYSQL_SSL_CA) {
      process.env.MYSQL_DATABASE_URL = `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}?sslidentity=${MYSQL_CLIENT_IDENTITY}&sslpassword=${PKCS12_IDENTITY_PASSWORD}&sslcert=${MYSQL_SSL_CA}`;
      process.env.MYSQL_DATABASE_SHADOW_URL = `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE_SHADOW}?sslidentity=${MYSQL_CLIENT_IDENTITY}&sslpassword=${PKCS12_IDENTITY_PASSWORD}&sslcert=${MYSQL_SSL_CA}`;
    } else {
      process.env.MYSQL_DATABASE_URL = `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`;
      process.env.MYSQL_DATABASE_SHADOW_URL = `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE_SHADOW}`;
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
