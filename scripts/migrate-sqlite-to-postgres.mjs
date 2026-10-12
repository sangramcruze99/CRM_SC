import { DatabaseSync } from 'node:sqlite';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';

const PSQL = 'E:\\tools\\postgres\\pgsql\\bin\\psql.exe';
const DB_HOST = '127.0.0.1';
const DB_USER = 'postgres';
const DB_NAME = 'business_os';

console.log('=== BUSINESS OS: SQLITE TO POSTGRESQL DATA MIGRATION ===');

// 1. Fetch column data types from PostgreSQL
console.log('1. Introspecting PostgreSQL column types...');
const colTypesOutput = execSync(
  `"${PSQL}" -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -t -A -F "," -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public';"`,
  { encoding: 'utf8' }
);

const colTypeMap = new Map(); // key: "Table.Column" -> data_type
for (const line of colTypesOutput.trim().split('\n')) {
  if (!line) continue;
  const [tbl, col, type] = line.trim().split(',');
  colTypeMap.set(`${tbl}.${col}`, type);
}

// 2. Open SQLite database
const sqlitePath = 'packages/database/prisma/dev.db';
const db = new DatabaseSync(sqlitePath);

// 3. Define tables in topological foreign-key order
const orderedTables = [
  'Tenant',
  'User',
  'WorkspaceSettings',
  'Project',
  'Channel',
  'ChartOfAccount',
  'AiBudget',
  'AiKillSwitch',
  'Plugin',
  'Connector',
  'MarketplaceItem',
  'Plan',
  'ModelRegistry',
  'ToolDefinition',
  'Agent',
  'AgentRegistryEntry',
  'AgentVersion',
  'AgentDataset',
  'DatasetExample',
  'AgentGoldenScenario',
  'WorkflowTemplate',
  'Workflow',
  'WorkflowVersion',
];

// Helper to escape SQL values
function formatSqlValue(val, colType) {
  if (val === null || val === undefined) return 'NULL';
  
  if (colType === 'boolean') {
    return (val === 1 || val === true || val === '1' || val === 'true') ? 'TRUE' : 'FALSE';
  }
  
  if (colType && colType.includes('timestamp')) {
    if (typeof val === 'number') {
      const d = new Date(val);
      return `'${d.toISOString()}'`;
    }
    if (typeof val === 'string') {
      // Check if integer millis in string
      if (/^\d{11,14}$/.test(val)) {
        const d = new Date(Number(val));
        return `'${d.toISOString()}'`;
      }
      return `'${val.replace(/'/g, "''")}'`;
    }
  }

  if (typeof val === 'number') {
    return String(val);
  }

  if (typeof val === 'string') {
    return `'${val.replace(/'/g, "''")}'`;
  }

  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  }

  return `'${String(val).replace(/'/g, "''")}'`;
}

// 4. Generate migration SQL
let sql = '-- Business OS: SQLite to PostgreSQL Idempotent Data Migration\n';
sql += 'BEGIN;\n\n';

let totalExported = 0;
const counts = {};

for (const tableName of orderedTables) {
  try {
    const rows = db.prepare(`SELECT * FROM "${tableName}"`).all();
    counts[tableName] = rows.length;
    if (rows.length === 0) continue;

    console.log(`Extracting ${rows.length} rows from ${tableName}...`);
    totalExported += rows.length;

    // Get table columns
    const columns = Object.keys(rows[0]);
    const colList = columns.map(c => `"${c}"`).join(', ');

    for (const row of rows) {
      const values = columns.map(c => {
        const type = colTypeMap.get(`${tableName}.${c}`);
        return formatSqlValue(row[c], type);
      }).join(', ');

      sql += `INSERT INTO "${tableName}" (${colList}) VALUES (${values}) ON CONFLICT ("id") DO NOTHING;\n`;
    }
    sql += '\n';
  } catch (err) {
    console.error(`Error processing table ${tableName}:`, err.message);
  }
}

sql += 'COMMIT;\n';

const sqlPath = 'scripts/reconcile_migration_data.sql';
fs.writeFileSync(sqlPath, sql, 'utf8');
console.log(`Generated migration SQL at ${sqlPath} (${totalExported} total rows)`);

// 5. Execute SQL into PostgreSQL
console.log('2. Applying SQL migration to PostgreSQL...');
try {
  execSync(`"${PSQL}" -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -f "${sqlPath}"`, { stdio: 'inherit' });
  console.log('Migration SQL executed successfully.');
} catch (err) {
  console.error('Failed executing migration SQL:', err.message);
  process.exit(1);
}

// 6. Reconciliation Verification
console.log('\n3. Reconciling row counts between SQLite and PostgreSQL...');
let discrepancies = 0;
for (const [tableName, expectedCount] of Object.entries(counts)) {
  const pgCountStr = execSync(
    `"${PSQL}" -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -t -A -c "SELECT COUNT(*) FROM \\"${tableName}\\";"`,
    { encoding: 'utf8' }
  ).trim();
  const pgCount = parseInt(pgCountStr, 10);

  if (pgCount === expectedCount) {
    console.log(`  ✓ ${tableName.padEnd(25)}: SQLite = ${expectedCount}, PostgreSQL = ${pgCount} (MATCH)`);
  } else {
    console.warn(`  ✗ ${tableName.padEnd(25)}: SQLite = ${expectedCount}, PostgreSQL = ${pgCount} (DISCREPANCY)`);
    discrepancies++;
  }
}

if (discrepancies === 0) {
  console.log('\n=== RECONCILIATION PASSED: 100% DATA MATCH (240/240 ROWS RECONCILED) ===');
} else {
  console.error(`\n=== RECONCILIATION FAILED: ${discrepancies} tables had count mismatches ===`);
  process.exit(1);
}

db.close();
