import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { platform } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';

const isWindows = platform() === 'win32';

function checkOpenSSL(): void {
  try {
    execSync('openssl version', { stdio: 'ignore' });
  } catch {
    console.error('OpenSSL is not installed or not available in PATH');
    console.error(
      `Please install OpenSSL and make sure it's available in your PATH`,
    );
    console.error(
      'Windows users can download OpenSSL from: https://slproweb.com/products/Win32OpenSSL.html',
    );
    process.exit(1);
  }
}

function execCommand(command: string): void {
  try {
    execSync(command, {
      stdio: 'inherit',
    });
  } catch (error) {
    console.error(`Failed to execute command: ${command}`);
    throw error;
  }
}

// 证书配置
const CERT_CONFIG = {
  validity: {
    notBefore: '20250201000000Z', // Feb 1, 2025
    notAfter: '20350201000000Z', // Feb 1, 2035
  },
  serial: 1000,
  subject: {
    country: 'SG',
    state: 'Singapore',
    locality: 'Singapore',
    organization: 'TK-Crawler',
    organizationalUnit: 'TK-Crawler',
  },
};

// 使用种子生成确定性的私钥
function generateDeterministicKey(seed: string, outputFile: string): void {
  // 使用平台无关的临时文件路径
  const randFile = join(process.cwd(), '.tmp-rand.bin');

  try {
    // 使用单个确定性命令生成随机数据
    execCommand(
      `echo "${seed}" | openssl dgst -sha512 -binary > "${randFile}"`,
    );

    // 使用固定参数生成私钥
    execCommand(
      `openssl genrsa -out "${outputFile}" ` +
        `-rand "${randFile}" ` +
        `-f4 ` + // 使用固定的公钥指数
        `2048`,
    );
  } finally {
    // 清理临时文件
    if (existsSync(randFile)) {
      rmSync(randFile);
    }
  }
}

function getSubjectString(cn: string): string {
  const { country, state, locality, organization, organizationalUnit } =
    CERT_CONFIG.subject;
  return `/C=${country}/ST=${state}/L=${locality}/O=${organization}/OU=${organizationalUnit}/CN=${cn}`;
}

/** 生成确定性证书，seeds保证唯一性 */
function generateCertificates(
  certDir: string,
  seeds: {
    ca?: string;
    server?: string;
    client?: string;
  },
): void {
  checkOpenSSL();

  try {
    if (!seeds.ca || !seeds.server || !seeds.client) {
      throw new Error('Missing seeds for CA, server, or client');
    }

    if (!existsSync(certDir)) {
      mkdirSync(certDir, { recursive: true });
    }
    const CA_KEY = join(certDir, 'ca-key.pem');
    const CA_CERT = join(certDir, 'ca-cert.pem');
    const SERVER_KEY = join(certDir, 'server-key.pem');
    const SERVER_CSR = join(certDir, 'server-req.pem');
    const SERVER_CERT = join(certDir, 'server-cert.pem');
    const CLIENT_KEY = join(certDir, 'client-key.pem');
    const CLIENT_CSR = join(certDir, 'client-req.pem');
    const CLIENT_CERT = join(certDir, 'client-cert.pem');

    // 生成 CA 证书
    generateDeterministicKey(seeds.ca, CA_KEY);
    execCommand(
      `openssl req -new -x509 -nodes ` +
        `-key "${CA_KEY}" -out "${CA_CERT}" ` +
        `-subj "${getSubjectString('TK-Crawler-MySQL-CA')}" ` +
        `-set_serial ${CERT_CONFIG.serial} ` +
        `-not_before "${CERT_CONFIG.validity.notBefore}" ` +
        `-not_after "${CERT_CONFIG.validity.notAfter}"`,
    );

    // 生成服务器证书
    generateDeterministicKey(seeds.server, SERVER_KEY);
    execCommand(
      `openssl req -new -nodes ` +
        `-key "${SERVER_KEY}" -out "${SERVER_CSR}" ` +
        `-subj "${getSubjectString('TK-Crawler-MySQL-Server')}"`,
    );
    execCommand(
      `openssl x509 -req -in "${SERVER_CSR}" ` +
        `-CA "${CA_CERT}" -CAkey "${CA_KEY}" ` +
        `-out "${SERVER_CERT}" ` +
        `-set_serial ${CERT_CONFIG.serial + 1} ` +
        `-not_before "${CERT_CONFIG.validity.notBefore}" ` +
        `-not_after "${CERT_CONFIG.validity.notAfter}"`,
    );

    // 生成客户端证书
    generateDeterministicKey(seeds.client, CLIENT_KEY);
    execCommand(
      `openssl req -new -nodes ` +
        `-key "${CLIENT_KEY}" -out "${CLIENT_CSR}" ` +
        `-subj "${getSubjectString('TK-Crawler-MySQL-Client')}"`,
    );
    execCommand(
      `openssl x509 -req -in "${CLIENT_CSR}" ` +
        `-CA "${CA_CERT}" -CAkey "${CA_KEY}" ` +
        `-out "${CLIENT_CERT}" ` +
        `-set_serial ${CERT_CONFIG.serial + 2} ` +
        `-not_before "${CERT_CONFIG.validity.notBefore}" ` +
        `-not_after "${CERT_CONFIG.validity.notAfter}"`,
    );

    // 设置文件权限（非 Windows 系统）
    if (!isWindows) {
      execCommand(`chmod 644 "${CA_CERT}" "${SERVER_CERT}" "${CLIENT_CERT}"`);
      execCommand(`chmod 600 "${CA_KEY}" "${SERVER_KEY}" "${CLIENT_KEY}"`);
    }
  } catch (error) {
    console.error('Failed to generate SSL certificates');
    rmSync(certDir, { recursive: true, force: true });
    throw error;
  }
}

export { generateCertificates };
