import * as fs from 'node:fs';

const files = [
  'apps/admin/src/app.module.ts',
  'apps/ai-engine/src/app.module.ts',
  'apps/audit/src/app.module.ts',
  'apps/automation/src/app.module.ts',
  'apps/bi-engine/src/app.module.ts',
  'apps/developer/src/app.module.ts',
  'apps/documents/src/app.module.ts',
  'apps/marketplace/src/app.module.ts',
  'apps/platform/src/app.module.ts',
  'apps/search/src/app.module.ts',
  'apps/settings/src/app.module.ts',
];

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes("from '@repo/auth'")) {
    c = c.replace(/import\s*\{([^}]+)\}\s*from\s*'@repo\/auth';/, (m, g) => {
      const parts = g.split(',').map(s => s.trim()).filter(Boolean);
      if (!parts.includes('getJwtSecret')) {
        parts.push('getJwtSecret');
      }
      return `import { ${parts.join(', ')} } from '@repo/auth';`;
    });
  } else {
    c = `import { getJwtSecret } from '@repo/auth';\n` + c;
  }
  fs.writeFileSync(f, c, 'utf8');
  console.log('Fixed import in:', f);
}
