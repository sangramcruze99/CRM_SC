#!/usr/bin/env node
/**
 * Automated TLS Certificate Generator for Business OS Ingress
 * Generates high-security private key and self-signed X.509 certificate with SANs
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CERTS_DIR = path.resolve(ROOT_DIR, 'certs');

if (!fs.existsSync(CERTS_DIR)) {
  fs.mkdirSync(CERTS_DIR, { recursive: true });
}

const KEY_PATH = path.resolve(CERTS_DIR, 'tls.key');
const CERT_PATH = path.resolve(CERTS_DIR, 'tls.crt');
const CSR_PATH = path.resolve(CERTS_DIR, 'tls.csr');
const EXT_PATH = path.resolve(CERTS_DIR, 'tls.ext');

console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m');
console.log('\x1b[1m  Business OS — Generating Production-Grade TLS Ingress Certificates   \x1b[0m');
console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

try {
  // 1. Create OpenSSL extension configuration with SANs
  const extConfig = `
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = businessos.local
DNS.4 = *.businessos.local
IP.1 = 127.0.0.1
IP.2 = ::1
`;
  fs.writeFileSync(EXT_PATH, extConfig.trim(), 'utf-8');

  // Find openssl
  let opensslBin = 'openssl';
  const gitOpenssl = 'C:\\Users\\wotk\\AppData\\Local\\Programs\\Git\\usr\\bin\\openssl.exe';
  if (fs.existsSync(gitOpenssl)) {
    opensslBin = `"${gitOpenssl}"`;
  }

  console.log(`[OPENSSL] Using binary: ${opensslBin}`);

  // 2. Generate 2048-bit RSA Private Key
  console.log('[CRYPTO] Generating 2048-bit RSA private key...');
  execSync(`${opensslBin} genrsa -out "${KEY_PATH}" 2048`, { stdio: 'inherit' });

  // 3. Generate CSR
  console.log('[CRYPTO] Generating Certificate Signing Request (CSR)...');
  execSync(
    `${opensslBin} req -new -key "${KEY_PATH}" -out "${CSR_PATH}" -subj "/C=US/ST=California/L=SanFrancisco/O=BusinessOS/OU=Infrastructure/CN=localhost"`,
    { stdio: 'inherit' }
  );

  // 4. Sign Certificate (valid for 365 days) with extensions
  console.log('[CRYPTO] Signing self-signed X.509 certificate with SAN extension...');
  execSync(
    `${opensslBin} x509 -req -in "${CSR_PATH}" -signkey "${KEY_PATH}" -out "${CERT_PATH}" -days 365 -extfile "${EXT_PATH}"`,
    { stdio: 'inherit' }
  );

  // Clean up CSR and EXT temp files
  if (fs.existsSync(CSR_PATH)) fs.unlinkSync(CSR_PATH);
  if (fs.existsSync(EXT_PATH)) fs.unlinkSync(EXT_PATH);

  console.log(`\n\x1b[32m[SUCCESS]\x1b[0m TLS Key generated:  ${KEY_PATH}`);
  console.log(`\x1b[32m[SUCCESS]\x1b[0m TLS Cert generated: ${CERT_PATH}`);
} catch (err) {
  console.error(`\x1b[31m[ERROR]\x1b[0m Failed generating TLS certificates: ${err.message}`);
  process.exit(1);
}
