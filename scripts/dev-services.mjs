#!/usr/bin/env node
/**
 * Unified Microservices Development Runner & Status Monitor
 * Business OS / Enterprise CRM
 *
 * Usage:
 *   node scripts/dev-services.mjs --status        # Ping all 21 microservice ports & show matrix
 *   node scripts/dev-services.mjs --mode=core     # Launch core business services (fast node dist)
 *   node scripts/dev-services.mjs --mode=fast     # Launch all 21 services via dist/main.js
 *   node scripts/dev-services.mjs --mode=watch    # Launch services via nest watch mode
 *   node scripts/dev-services.mjs --filter=crm,sales,chat
 */

import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Color helpers
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

const SERVICE_COLORS = [
  c.cyan,
  c.green,
  c.yellow,
  c.blue,
  c.magenta,
  c.bold + c.cyan,
  c.bold + c.green,
  c.bold + c.yellow,
  c.bold + c.blue,
  c.bold + c.magenta,
];

export const MICROSERVICES = [
  { name: 'crm', dir: 'apps/crm', port: 3001, category: 'Core CRM', isCore: true },
  { name: 'sales', dir: 'apps/sales', port: 3005, category: 'Commercial Deals', isCore: true },
  { name: 'platform', dir: 'apps/platform', port: 3008, category: 'Platform Foundation', isCore: true },
  { name: 'automation', dir: 'apps/automation', port: 3009, category: 'Orchestration & BullMQ', isCore: true },
  { name: 'ai-engine', dir: 'apps/ai-engine', port: 3010, category: 'Intelligence & Copilots', isCore: true },
  { name: 'auth', dir: 'apps/auth', port: 3011, category: 'Security & Access', isCore: true },
  { name: 'marketplace', dir: 'apps/marketplace', port: 3012, category: 'Integrations' },
  { name: 'bi-engine', dir: 'apps/bi-engine', port: 3013, category: 'Reporting & OLAP' },
  { name: 'chat', dir: 'apps/chat', port: 3014, category: 'Collaboration & WS', isCore: true },
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
  { name: 'billing', dir: 'apps/billing', port: 3027, category: 'SaaS Monetization', isCore: true },
  { name: 'python-ai', dir: 'services/python-ai', port: 3030, category: 'AI & Machine Learning', isCore: true, isPython: true },
  { name: 'web-core', dir: 'apps/web-core', port: 4000, category: 'Next.js App Router', isCore: true, isFrontend: true },
];

/** Check if a TCP port is open and accepting connections */
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

/** Check health status across all microservices and print formatted table */
async function printStatusMatrix() {
  console.log(`\n${c.bold}${c.cyan}========================================================================${c.reset}`);
  console.log(`${c.bold}  Business OS / CRM Microservices Mesh Status Check${c.reset}`);
  console.log(`${c.bold}${c.cyan}========================================================================${c.reset}\n`);

  console.log(
    `${c.dim}${'SERVICE'.padEnd(16)} ${'PORT'.padEnd(8)} ${'CATEGORY'.padEnd(26)} ${'TYPE'.padEnd(8)} ${'STATUS'}${c.reset}`
  );
  console.log(`${c.dim}${'-'.repeat(72)}${c.reset}`);

  let onlineCount = 0;

  for (const s of MICROSERVICES) {
    const isOnline = await checkPort(s.port);
    if (isOnline) onlineCount++;

    const statusBadge = isOnline
      ? `${c.green}${c.bold}ONLINE${c.reset}`
      : `${c.gray}OFFLINE${c.reset}`;

    const typeBadge = s.isFrontend
      ? `${c.magenta}UI${c.reset}`
      : s.isCore
      ? `${c.yellow}CORE${c.reset}`
      : `${c.dim}MESH${c.reset}`;

    console.log(
      `${c.bold}${s.name.padEnd(16)}${c.reset} ${(`:${s.port}`).padEnd(8)} ${s.category.padEnd(26)} ${typeBadge.padEnd(17)} ${statusBadge}`
    );
  }

  console.log(`${c.dim}${'-'.repeat(72)}${c.reset}`);
  console.log(
    `\nTotal Nodes: ${MICROSERVICES.length} | Online: ${c.bold}${c.green}${onlineCount}${c.reset} | Offline: ${c.gray}${MICROSERVICES.length - onlineCount}${c.reset}\n`
  );
}

/** Kill process tree cleanly across Windows & POSIX */
function killProcessTree(pid) {
  if (process.platform === 'win32') {
    try {
      spawn('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore' });
    } catch {
      // Ignore
    }
  } else {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      try {
        process.kill(pid, 'SIGKILL');
      } catch {
        // Ignore
      }
    }
  }
}

/** Main Runner */
async function main() {
  const args = process.argv.slice(2);

  // Status check mode
  if (args.includes('--status')) {
    await printStatusMatrix();
    process.exit(0);
  }

  // Parse options
  let mode = 'core'; // default to core for developer speed & safety
  let filter = null;

  for (const arg of args) {
    if (arg.startsWith('--mode=')) {
      mode = arg.split('=')[1].toLowerCase();
    } else if (arg.startsWith('--filter=')) {
      filter = arg.split('=')[1].split(',').map((s) => s.trim().toLowerCase());
    }
  }

  // Filter services
  let selected = MICROSERVICES.filter((s) => !s.isFrontend);

  if (filter) {
    selected = selected.filter((s) => filter.includes(s.name.toLowerCase()));
  } else if (mode === 'core') {
    selected = selected.filter((s) => s.isCore);
  }

  if (selected.length === 0) {
    console.error(`${c.red}No microservices matched filter criteria.${c.reset}`);
    process.exit(1);
  }

  console.log(`\n${c.bold}${c.green}========================================================================${c.reset}`);
  console.log(`${c.bold}  Launching Business OS Microservices Runner${c.reset}`);
  console.log(`  Mode: ${c.cyan}${mode.toUpperCase()}${c.reset} | Targets: ${c.yellow}${selected.length}${c.reset} backend services`);
  console.log(`${c.bold}${c.green}========================================================================${c.reset}\n`);

  const activeProcesses = [];

  // Register clean exit hooks
  const cleanup = () => {
    console.log(`\n${c.yellow}Stopping all ${activeProcesses.length} microservice processes...${c.reset}`);
    for (const proc of activeProcesses) {
      killProcessTree(proc.pid);
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

  // Spawn each service
  for (const [index, service] of selected.entries()) {
    const color = SERVICE_COLORS[index % SERVICE_COLORS.length];
    const prefix = `${color}[${service.name}:${service.port}]${c.reset}`;
    const serviceDir = path.resolve(ROOT_DIR, service.dir);

    const isOnline = await checkPort(service.port);
    if (isOnline) {
      console.log(`${prefix} ${c.green}Already running and active on port ${service.port}${c.reset}`);
      continue;
    }

    let cmd = 'node';
    let cmdArgs = [];

    if (service.isPython) {
      const venvPy = process.platform === 'win32'
        ? path.resolve(serviceDir, '.venv', 'Scripts', 'python.exe')
        : path.resolve(serviceDir, '.venv', 'bin', 'python');
      cmd = fs.existsSync(venvPy) ? venvPy : (process.platform === 'win32' ? 'python' : 'python3');
      cmdArgs = ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', String(service.port)];
    } else if (mode === 'watch') {
      cmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
      cmdArgs = ['--filter', `@repo/${service.name}`, 'dev'];
    } else {
      // Fast mode: execute dist/main.js
      const distPath = path.resolve(serviceDir, 'dist', 'main.js');
      if (!fs.existsSync(distPath)) {
        console.warn(`${prefix} ${c.yellow}Warning: dist/main.js not found. Running nest build first...${c.reset}`);
        cmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
        cmdArgs = ['--filter', `@repo/${service.name}`, 'start'];
      } else {
        cmd = 'node';
        cmdArgs = [distPath];
      }
    }

    const child = spawn(cmd, cmdArgs, {
      cwd: serviceDir,
      env: {
        ...process.env,
        PORT: String(service.port),
        [`${service.name.toUpperCase().replace(/-/g, '_')}_PORT`]: String(service.port),
        AI_PORT: '3010',
        BI_PORT: '3013',
        ENABLE_BULLMQ: 'false',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    activeProcesses.push(child);

    child.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          console.log(`${prefix} ${line}`);
        }
      }
    });

    child.stderr.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          console.error(`${prefix} ${c.red}${line}${c.reset}`);
        }
      }
    });

    child.on('error', (err) => {
      console.error(`${prefix} ${c.red}Failed to start: ${err.message}${c.reset}`);
    });

    child.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.log(`${prefix} ${c.yellow}Exited with code ${code}${c.reset}`);
      }
    });
  }

  console.log(`${c.dim}Press Ctrl+C at any time to gracefully terminate all running services.${c.reset}\n`);
}

main().catch((err) => {
  console.error(`${c.red}Fatal Runner Error: ${err.message}${c.reset}`);
  process.exit(1);
});
