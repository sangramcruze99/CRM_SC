import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('packages/database/prisma/dev.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%'").all();

console.log('--- NON-EMPTY TABLES IN SQLITE dev.db ---');
let totalRows = 0;
for (const t of tables) {
  try {
    const res = db.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get();
    if (res.c > 0) {
      console.log(`${t.name}: ${res.c} rows`);
      totalRows += Number(res.c);
    }
  } catch (err) {
    console.error(`Error querying ${t.name}:`, err.message);
  }
}
console.log(`Total non-empty rows across all tables: ${totalRows}`);
db.close();
