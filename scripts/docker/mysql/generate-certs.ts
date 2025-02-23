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
  days: 3650, // 10 years
  serial: 1000,
  subject: {
    country: 'SG',
    state: 'Singapore',
    locality: 'Singapore',
    organization: 'TK-Crawler',
    organizationalUnit: 'TK-Crawler',
  },
};

function getSubjectString(cn: string): string {
  const { country, state, locality, organization, organizationalUnit } =
    CERT_CONFIG.subject;
  return `/C=${country}/ST=${state}/L=${locality}/O=${organization}/OU=${organizationalUnit}/CN=${cn}`;
}

function generateCertificates(certDir: string): void {
  checkOpenSSL();

  try {
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
    const CLIENT_IDENTITY = join(certDir, 'client-identity.p12');

    // Generate CA key and certificate
    execCommand(`openssl genrsa -out "${CA_KEY}" 2048`);
    execCommand(
      `openssl req -new -x509 -nodes ` +
        `-key "${CA_KEY}" -out "${CA_CERT}" ` +
        `-subj "${getSubjectString('TK-Crawler-MySQL-CA')}" ` +
        `-set_serial ${CERT_CONFIG.serial} ` +
        `-days ${CERT_CONFIG.days}`,
    );

    // Generate server certificate
    execCommand(`openssl genrsa -out "${SERVER_KEY}" 2048`);
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
        `-days ${CERT_CONFIG.days}`,
    );

    // Generate client certificate
    execCommand(`openssl genrsa -out "${CLIENT_KEY}" 2048`);
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
        `-days ${CERT_CONFIG.days}`,
    );

    execCommand(
      `openssl pkcs12 -export -out "${CLIENT_IDENTITY}" -inkey "${CLIENT_KEY}" -in "${CLIENT_CERT}"  -passout pass:your_password`,
    );

    // Set file permissions (non-Windows systems)
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
