const fs = require('fs');
const path = require('path');

const webCoreSrc = path.resolve(__dirname, '../apps/web-core/src');
const appsDir = path.resolve(__dirname, '../apps');

const results = [];

function scanDir(dir, filterFn) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!['node_modules', '.next', 'dist', '.turbo'].includes(f.name)) {
        scanDir(full, filterFn);
      }
    } else if (f.isFile() && (f.name.endsWith('.tsx') || f.name.endsWith('.ts'))) {
      filterFn(full);
    }
  }
}

// Check for mock patterns in web-core
scanDir(webCoreSrc, (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const rel = path.relative(path.resolve(__dirname, '..'), filePath).replace(/\\/g, '/');
  
  const mockMatches = [];
  
  // Pattern 1: Variable names starting with mock, initial, sample, fake, dummy
  const varMatches = content.match(/(?:const|let|var)\s+((?:mock|initial|fake|dummy|sample)[A-Za-z0-9_]*)\s*[:=]/gi);
  if (varMatches) {
    mockMatches.push(...varMatches.map(m => m.trim()));
  }

  // Pattern 2: Hardcoded demo entities
  const entityMatches = content.match(/\b(Acme Corp|Sarah Connor|Elena Rostova|John Doe|Cyberdyne|Wayne Enterprises|Stark Industries|Pied Piper|Dunder Mifflin)\b/gi);
  if (entityMatches) {
    mockMatches.push(...new Set(entityMatches.map(m => `Demo Entity: "${m}"`)));
  }

  // Pattern 3: INITIAL_ arrays / objects with demo data
  const initialMatches = content.match(/(?:const|let)\s+(INITIAL_[A-Z0-9_]+)\s*[:=]\s*(\[|\{)/g);
  if (initialMatches) {
    mockMatches.push(...initialMatches.map(m => m.trim()));
  }

  // Pattern 4: Fallback to mock data on fetch error or empty state
  const fallbackMatches = content.match(/(?:set[A-Z][a-zA-Z0-9]*\s*\(\s*(?:mock[A-Za-z0-9_]*|DEFAULT_[A-Z0-9_]+)\s*\)|\|\|\s*mock[A-Za-z0-9_]*)/g);
  if (fallbackMatches) {
    mockMatches.push(...fallbackMatches.map(m => `Fallback to mock: "${m.trim()}"`));
  }

  if (mockMatches.length > 0) {
    results.push({
      file: rel,
      patterns: [...new Set(mockMatches)],
    });
  }
});

// Also scan backend apps for auto-seed logic (e.g. if (!items || items.length === 0) seed...)
const backendSeedResults = [];
scanDir(appsDir, (filePath) => {
  if (filePath.includes('web-core')) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  const rel = path.relative(path.resolve(__dirname, '..'), filePath).replace(/\\/g, '/');

  const seedMatches = [];
  if (/auto-?seed|seedData|seed\s*\(|if\s*\([^)]*length\s*===\s*0[^)]*\)\s*\{[^}]*create/i.test(content)) {
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (/auto-?seed|seedData|length\s*===\s*0.*create/i.test(line)) {
        seedMatches.push(`L${idx + 1}: ${line.trim()}`);
      }
    });
  }

  if (seedMatches.length > 0) {
    backendSeedResults.push({
      file: rel,
      matches: seedMatches,
    });
  }
});

console.log('=== FRONTEND MOCK/DEMO DATA DETECTED ===');
console.log(`Found ${results.length} files with mock/demo patterns in web-core:`);
results.forEach(r => {
  console.log(`\n📄 ${r.file}`);
  r.patterns.slice(0, 5).forEach(p => console.log(`   - ${p}`));
  if (r.patterns.length > 5) {
    console.log(`   ... and ${r.patterns.length - 5} more`);
  }
});

console.log('\n\n=== BACKEND AUTO-SEED LOGIC DETECTED ===');
console.log(`Found ${backendSeedResults.length} files in backend:`);
backendSeedResults.forEach(r => {
  console.log(`\n⚙️ ${r.file}`);
  r.matches.forEach(m => console.log(`   - ${m}`));
});
