import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const PG_DUMP = process.env.PG_DUMP_PATH || 'E:\\tools\\postgres\\pgsql\\bin\\pg_dump.exe';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_NAME = process.env.DB_NAME || 'business_os';

const backupDir = path.resolve('backups/postgres');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `backup_${DB_NAME}_${timestamp}.sql`);
const metaFile = path.join(backupDir, `backup_${DB_NAME}_${timestamp}.json`);

console.log(`=== BUSINESS OS: POSTGRESQL BACKUP INITIATION ===`);
console.log(`Database: ${DB_NAME} on ${DB_HOST}:${DB_PORT}`);
console.log(`Target:   ${backupFile}`);

try {
  execSync(
    `"${PG_DUMP}" -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} --clean --if-exists --no-owner --no-privileges -f "${backupFile}"`,
    { stdio: 'inherit' }
  );

  const stats = fs.statSync(backupFile);
  if (stats.size === 0) {
    throw new Error('Backup failed: Generated file is 0 bytes.');
  }

  const fileBuffer = fs.readFileSync(backupFile);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  const sha256 = hashSum.digest('hex');

  const metadata = {
    timestamp: new Date().toISOString(),
    database: DB_NAME,
    host: DB_HOST,
    sizeBytes: stats.size,
    sha256,
    file: backupFile,
  };

  fs.writeFileSync(metaFile, JSON.stringify(metadata, null, 2), 'utf8');

  console.log(`\n✓ Backup completed successfully!`);
  console.log(`  File Size: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`  SHA256:    ${sha256}`);
  console.log(`  Metadata:  ${metaFile}\n`);
} catch (err) {
  console.error('Backup error:', err.message);
  process.exit(1);
}
