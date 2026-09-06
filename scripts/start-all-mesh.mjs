import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const LOG_DIR = path.resolve(ROOT_DIR, 'scratch', 'logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const SERVICES = [
  { name: 'crm', dir: 'apps/crm', port: 3001, category: 'Core CRM' },
  { name: 'sales', dir: 'apps/sales', port: 3005, category: 'Commercial Deals' },
  { name: 'platform', dir: 'apps/platform', port: 3008, category: 'Platform Foundation' },
  { name: 'automation', dir: 'apps/automation', port: 3009, category: 'Orchestration & BullMQ' },
  { name: 'ai-engine', dir: 'apps/ai-engine', port: 3010, category: 'Intelligence & Copilots' },
  { name: 'auth', dir: 'apps/auth', port: 3011, category: 'Security & Access' },
  { name: 'marketplace', dir: 'apps/marketplace', port: 3012, category: 'Integrations' },
  { name: 'bi-engine', dir: 'apps/bi-engine', port: 3013, category: 'Reporting & OLAP' },
  { name: 'chat', dir: 'apps/chat', port: 3014, category: 'Collaboration & WS' },
  { name: 'finance', dir: 'apps/finance', port: 3015, category: 'Ledger & Invoices' },
  { name: 'helpdesk', dir: 'apps/helpdesk', port: 3016, category: 'Support Operations' },
  { name: 'projects', dir: 'apps/projects', port: 3017, category: 'Project Tasks' },
  { name: 'hr', dir: 'apps/hr', port: 3018, category: 'People Operations' },
  { name: 'search', dir: 'apps/search', port: 3019, category: 'Multi-Entity Query' },
  { name: 'documents', dir: 'apps/documents', port: 3020, category: 'Document Management' },
  { name: 'admin', dir: 'apps/admin', port: 3021, category: 'Superadmin Console' },
  { name: 'developer', dir: 'apps/developer', port: 3022, category: 'APIs & Webhooks' },
  { name: 'audit', dir: 'apps/audit', port: 3023, category: 'Governance Logs' },
  { name: 'cms', dir: 'apps/cms', port: 3024, category: 'Content Management' },
  { name: 'settings', dir: 'apps/settings', port: 3025, category: 'Configuration' },
  { name: 'inventory', dir: 'apps/inventory', port: 3026, category: 'Supply Chain' },
  { name: 'python-ai', dir: 'services/python-ai', port: 3030, category: 'AI & Machine Learning', isPython: true },
  { name: 'web-core', dir: 'apps/web-core', port: 4000, category: 'Next.js App Router', isFrontend: true },
];

function checkPort(port, host = '127.0.0.1', timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isResolved = false;
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(true);
      }
    });
    socket.on('timeout', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(false);
      }
    });
    socket.on('error', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(false);
      }
    });
    socket.connect(port, host);
  });
}

async function startAll() {
  console.log('\n========================================================================');
  console.log('🚀 Business OS — Launching All Microservice Segments');
  console.log('========================================================================\n');

  for (const s of SERVICES) {
    const isRunning = await checkPort(s.port);
    if (isRunning) {
      console.log(`⚡ [${s.name}:${s.port}] Already ONLINE (skipping spawn)`);
      continue;
    }

    const serviceDir = path.resolve(ROOT_DIR, s.dir);
    let cmd = process.execPath;
    let args = [];

    if (s.isPython) {
      const venvPy = path.resolve(serviceDir, '.venv', 'Scripts', 'python.exe');
      cmd = fs.existsSync(venvPy) ? venvPy : 'python';
      args = ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', String(s.port)];
    } else if (s.isFrontend) {
      const nextBin = path.resolve(serviceDir, 'node_modules', 'next', 'dist', 'bin', 'next');
      cmd = process.execPath;
      args = [nextBin, 'start', '-p', '4000'];
    } else {
      const distMain = path.resolve(serviceDir, 'dist', 'main.js');
      if (!fs.existsSync(distMain)) {
        console.log(`⚠️ [${s.name}:${s.port}] dist/main.js not found in ${serviceDir}`);
        continue;
      }
      cmd = process.execPath;
      args = ['dist/main.js'];
    }

    const logFile = path.join(LOG_DIR, `${s.name}.log`);
    const outLog = fs.openSync(logFile, 'w');

    try {
      const child = spawn(cmd, args, {
        cwd: serviceDir,
        detached: true,
        stdio: ['ignore', outLog, outLog],
        windowsHide: true,
        env: {
          ...process.env,
          PORT: String(s.port),
          [`${s.name.toUpperCase().replace(/-/g, '_')}_PORT`]: String(s.port),
        },
      });
      child.unref();
      console.log(`▶️ [${s.name}:${s.port}] Spawned background process (PID: ${child.pid}) -> logs in scratch/logs/${s.name}.log`);
    } catch (err) {
      console.error(`❌ [${s.name}:${s.port}] Error launching: ${err.message}`);
    }
  }

  console.log('\n⏳ Waiting 12 seconds for microservices to initialize and bind ports...');
  await new Promise((res) => setTimeout(res, 12000));

  console.log('\n========================================================================');
  console.log('📊 Verification: Checking Status Across All Segments');
  console.log('========================================================================\n');

  let onlineCount = 0;
  for (const s of SERVICES) {
    const isOnline = await checkPort(s.port);
    if (isOnline) onlineCount++;
    console.log(
      `${s.name.padEnd(16)} :${String(s.port).padEnd(6)} ${s.category.padEnd(26)} [${isOnline ? 'ONLINE' : 'OFFLINE'}]`
    );
  }

  console.log(`\nResult: ${onlineCount}/${SERVICES.length} segments online.`);
}

startAll().catch(console.error);
