const fs = require('fs');
const path = require('path');

const apps = fs.readdirSync('apps');
const summary = [];

for (const a of apps) {
  const p = path.join('apps', a);
  if (!fs.statSync(p).isDirectory() || a === 'web-core') continue;
  
  let port = 'N/A';
  const mainPath = path.join(p, 'src', 'main.ts');
  if (fs.existsSync(mainPath)) {
    const c = fs.readFileSync(mainPath, 'utf8');
    const m = c.match(/listen\((?:process\.env\.PORT\s*\|\|\s*)?(\d+)/) || c.match(/PORT.*?(\d{4})/);
    if (m) port = m[1];
  }

  const srcPath = path.join(p, 'src');
  const routes = [];
  if (fs.existsSync(srcPath)) {
    const files = fs.readdirSync(srcPath, { recursive: true }).filter(f => f.endsWith('.controller.ts'));
    for (const f of files) {
      const c = fs.readFileSync(path.join(srcPath, f), 'utf8');
      const m = c.match(/@Controller\(['"](.*?)['"]\)/);
      if (m && m[1]) routes.push('/' + m[1]);
      else routes.push('/');
    }
  }

  summary.push({
    microservice: a,
    port: port,
    routes: [...new Set(routes)].join(', ')
  });
}

console.table(summary);
