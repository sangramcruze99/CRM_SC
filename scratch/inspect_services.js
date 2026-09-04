const fs = require('fs');
const path = require('path');

console.log('=== BUSINESS OS MICROSERVICES & APIS ===\n');

const apps = fs.readdirSync('apps');
const services = [];

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
  const controllerInfo = [];
  if (fs.existsSync(srcPath)) {
    const files = fs.readdirSync(srcPath, { recursive: true }).filter(f => f.endsWith('.controller.ts'));
    for (const f of files) {
      const fullPath = path.join(srcPath, f);
      const content = fs.readFileSync(fullPath, 'utf8');
      const routeMatch = content.match(/@Controller\(['"](.*?)['"]\)/);
      const route = routeMatch ? routeMatch[1] : '';
      
      // Extract methods
      const endpoints = [];
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const methodMatch = line.match(/@(Get|Post|Put|Patch|Delete)\((?:['"](.*?)['"])?\)/i);
        if (methodMatch) {
          const httpMethod = methodMatch[1].toUpperCase();
          const subPath = methodMatch[2] || '';
          // look at next line for method name
          const nextLine = lines[i + 1] || '';
          const fnMatch = nextLine.match(/(?:async\s+)?([a-zA-Z0-9_]+)\s*\(/);
          const fnName = fnMatch ? fnMatch[1] : '';
          endpoints.push(`${httpMethod} /${route}${subPath ? '/' + subPath : ''} (${fnName})`);
        }
      }

      controllerInfo.push({
        file: f,
        route: `/${route}`,
        endpointCount: endpoints.length,
        endpoints
      });
    }
  }

  services.push({
    name: a,
    port,
    controllers: controllerInfo
  });
}

for (const s of services) {
  console.log(`\n==================================================`);
  console.log(`🔷 SERVICE: apps/${s.name} (Port :${s.port})`);
  console.log(`   Controllers: ${s.controllers.length}`);
  for (const c of s.controllers) {
    console.log(`   📍 Controller: ${c.route} [${c.file}]`);
    for (const ep of c.endpoints.slice(0, 5)) {
      console.log(`      • ${ep}`);
    }
    if (c.endpoints.length > 5) {
      console.log(`      • ... and ${c.endpoints.length - 5} more endpoints`);
    }
  }
}

console.log('\n=== FRONTEND ROUTES (apps/web-core/src/app) ===');
const webAppPath = path.join('apps', 'web-core', 'src', 'app');
if (fs.existsSync(webAppPath)) {
  const allFiles = fs.readdirSync(webAppPath, { recursive: true });
  const pageFiles = allFiles.filter(f => f.endsWith('page.tsx') || f.endsWith('page.jsx'));
  const routes = pageFiles.map(f => '/' + f.replace(/\\/g, '/').replace(/\/page\.(tsx|jsx)$/, '').replace(/^page\.(tsx|jsx)$/, ''));
  console.log(`Total Pages / Routes: ${routes.length}`);
  console.log(routes.sort().join('\n'));
}

console.log('\n=== PRISMA DATABASE MODELS (packages/database) ===');
const prismaSchema = path.join('packages', 'database', 'prisma', 'schema.prisma');
if (fs.existsSync(prismaSchema)) {
  const schemaContent = fs.readFileSync(prismaSchema, 'utf8');
  const models = [...schemaContent.matchAll(/model\s+([A-Za-z0-9_]+)\s+\{/g)].map(m => m[1]);
  console.log(`Total Models: ${models.length}`);
  console.log(models.join(', '));
}
