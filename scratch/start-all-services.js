const { spawn } = require('child_process');
const path = require('path');

const services = [
  { name: 'crm', dir: 'apps/crm', cmd: 'node', args: ['dist/main.js'] },
  { name: 'sales', dir: 'apps/sales', cmd: 'node', args: ['dist/main.js'] },
  { name: 'platform', dir: 'apps/platform', cmd: 'node', args: ['dist/main.js'] },
  { name: 'automation', dir: 'apps/automation', cmd: 'node', args: ['dist/main.js'] },
  { name: 'ai-engine', dir: 'apps/ai-engine', cmd: 'node', args: ['dist/main.js'] },
  { name: 'auth', dir: 'apps/auth', cmd: 'node', args: ['dist/main.js'] },
  { name: 'marketplace', dir: 'apps/marketplace', cmd: 'node', args: ['dist/main.js'] },
  { name: 'bi-engine', dir: 'apps/bi-engine', cmd: 'node', args: ['dist/main.js'] },
  { name: 'chat', dir: 'apps/chat', cmd: 'node', args: ['dist/main.js'] },
  { name: 'finance', dir: 'apps/finance', cmd: 'node', args: ['dist/main.js'] },
  { name: 'helpdesk', dir: 'apps/helpdesk', cmd: 'node', args: ['dist/main.js'] },
  { name: 'projects', dir: 'apps/projects', cmd: 'node', args: ['dist/main.js'] },
  { name: 'hr', dir: 'apps/hr', cmd: 'node', args: ['dist/main.js'] },
  { name: 'search', dir: 'apps/search', cmd: 'node', args: ['dist/main.js'] },
  { name: 'documents', dir: 'apps/documents', cmd: 'node', args: ['dist/main.js'] },
  { name: 'admin', dir: 'apps/admin', cmd: 'node', args: ['dist/main.js'] },
  { name: 'developer', dir: 'apps/developer', cmd: 'node', args: ['dist/main.js'] },
  { name: 'audit', dir: 'apps/audit', cmd: 'node', args: ['dist/main.js'] },
  { name: 'cms', dir: 'apps/cms', cmd: 'node', args: ['dist/main.js'] },
  { name: 'settings', dir: 'apps/settings', cmd: 'node', args: ['dist/main.js'] },
  { name: 'inventory', dir: 'apps/inventory', cmd: 'node', args: ['dist/main.js'] },
];

console.log(`Starting ${services.length} services in persistent detached mode...`);

services.forEach((s) => {
  const cwd = path.resolve(__dirname, '..', s.dir);
  try {
    const child = spawn(s.cmd, s.args, {
      cwd,
      shell: true,
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
    console.log(`Started [${s.name}]`);
  } catch (err) {
    console.error(`Error launching ${s.name}:`, err);
  }
});

console.log('All 21 backend services detached successfully.');
