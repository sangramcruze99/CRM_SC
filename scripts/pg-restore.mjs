import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const PSQL = process.env.PSQL_PATH || 'E:\\tools\\postgres\\pgsql\\bin\\psql.exe';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_USER = process.env.DB_USER || 'postgres';
const TARGET_DB = process.argv[2] || process.env.RESTORE_TARGET_DB || 'business_os_restore_verify';
const BACKUP_FILE = process.argv[3];

console.log(`=== BUSINESS OS: POSTGRESQL RESTORE PROCESS ===`);
console.log(`Target DB: ${TARGET_DB} on ${DB_HOST}:${DB_PORT}`);

// Find latest backup if not provided
let targetFile = BACKUP_FILE;
if (!targetFile) {
  const backupDir = path.resolve('backups/postgres');
  if (!fs.existsSync(backupDir)) {
    console.error('Backup directory does not exist.');
    process.exit(1);
  }
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.sql')).sort().reverse();
  if (files.length === 0) {
    console.error('No .sql backup files found.');
    process.exit(1);
  }
  targetFile = path.join(backupDir, files[0]);
}

console.log(`Source Backup: ${targetFile}`);

if (!fs.existsSync(targetFile)) {
  console.error(`Backup file not found: ${targetFile}`);
  process.exit(1);
}

// Check SHA256 checksum against metadata if json exists
const metaFile = targetFile.replace(/\.sql$/, '.json');
if (fs.existsSync(metaFile)) {
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
  const fileBuffer = fs.readFileSync(targetFile);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  const currentSha = hashSum.digest('hex');

  if (currentSha !== meta.sha256) {
    console.error('CHECKSUM MISMATCH! Backup file may be corrupted.');
    process.exit(1);
  }
  console.log(`✓ SHA256 Checksum verified: ${currentSha}`);
}

try {
  // Ensure target DB exists
  try {
    execSync(
      `"${PSQL}" -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d postgres -c "CREATE DATABASE ${TARGET_DB} OWNER ${DB_USER};"`,
      { stdio: 'pipe' }
    );
    console.log(`Created restore database: ${TARGET_DB}`);
  } catch {
    console.log(`Target database ${TARGET_DB} already exists; proceeding with restore.`);
  }

  // Restore SQL script
  execSync(
    `"${PSQL}" -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${TARGET_DB} -f "${targetFile}"`,
    { stdio: 'pipe' }
  );

  // Verify row counts in restored DB
  const userCount = execSync(
    `"${PSQL}" -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${TARGET_DB} -t -A -c "SELECT COUNT(*) FROM \\"User\\";"`,
    { encoding: 'utf8' }
  ).trim();

  const tenantCount = execSync(
    `"${PSQL}" -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${TARGET_DB} -t -A -c "SELECT COUNT(*) FROM \\"Tenant\\";"`,
    { encoding: 'utf8' }
  ).trim();

  console.log(`\n✓ Restore completed and verified!`);
  console.log(`  Restored User rows:   ${userCount}`);
  console.log(`  Restored Tenant rows: ${tenantCount}\n`);
} catch (err) {
  console.error('Restore error:', err.message);
  process.exit(1);
}
