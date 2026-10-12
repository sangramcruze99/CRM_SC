import * as fs from 'node:fs';
import * as path from 'node:path';

console.log('=== BUSINESS OS: HARDENING ALL MICROSERVICE SECRETS ===');

const ROOT_DIR = process.cwd();
const APPS_DIR = path.join(ROOT_DIR, 'apps');

function updateFile(filePath, transformFn) {
  if (!fs.existsSync(filePath)) return false;
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = transformFn(original);
  if (original !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`  ✓ Updated ${path.relative(ROOT_DIR, filePath)}`);
    return true;
  }
  return false;
}

// 1. Process all app.module.ts and jwt-auth.guard.ts files across apps/
function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.next') {
        processDir(fullPath);
      }
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.module.ts') || entry.name.endsWith('guard.ts')) {
        updateFile(fullPath, (content) => {
          let updated = content;
          let needsImport = false;

          if (updated.includes("'super-secret-business-os-key'")) {
            // Replace in JwtModule.register
            updated = updated.replace(
              /secret:\s*process\.env\.JWT_SECRET\s*\|\|\s*'super-secret-business-os-key'/g,
              'secret: getJwtSecret()'
            );

            // Replace in jwt-auth.guard.ts
            updated = updated.replace(
              /const\s+secret\s*=\s*process\.env\.JWT_SECRET\s*\|\|\s*'super-secret-business-os-key';/g,
              'const secret = getJwtSecret();'
            );

            needsImport = true;
          }

          if (needsImport && !updated.includes('getJwtSecret')) {
            // Add import from @repo/auth
            if (updated.includes("from '@repo/auth'")) {
              updated = updated.replace(/import\s*\{([^}]+)\}\s*from\s*'@repo\/auth';/, (m, g1) => {
                return `import { ${g1.trim()}, getJwtSecret } from '@repo/auth';`;
              });
            } else {
              updated = `import { getJwtSecret } from '@repo/auth';\n` + updated;
            }
          } else if (needsImport && updated.includes('getJwtSecret') && !updated.includes("from '@repo/auth'")) {
            updated = `import { getJwtSecret } from '@repo/auth';\n` + updated;
          }

          return updated;
        });
      }
    }
  }
}

console.log('1. Scanning apps for hardcoded secrets...');
processDir(APPS_DIR);

// 2. Harden apps/web-core/src/lib/auth.ts
console.log('2. Hardening web-core auth...');
updateFile(path.join(APPS_DIR, 'web-core/src/lib/auth.ts'), (content) => {
  return content.replace(
    "const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-business-os-key';",
    `function getWebCoreJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'super-secret-business-os-key' || secret.includes('replace-with')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: Insecure or missing JWT_SECRET in production web-core.');
    }
    return 'dev-ephemeral-jwt-secret-do-not-use-in-production-min32chars';
  }
  return secret;
}
const JWT_SECRET = getWebCoreJwtSecret();`
  );
});

// 3. Harden docker-compose.prod.yml
console.log('3. Hardening docker-compose.prod.yml...');
updateFile(path.join(ROOT_DIR, 'docker-compose.prod.yml'), (content) => {
  return content.replace(
    /\$\{JWT_SECRET:-super-secret-business-os-key\}/g,
    '${JWT_SECRET:?FATAL: JWT_SECRET must be explicitly set for production}'
  );
});

// 4. Harden test scripts to use dedicated high-entropy test secret
console.log('4. Hardening test scripts...');
const testScripts = [
  'scripts/test-generic-automation-engine.mjs',
  'scripts/test-universal-automation-platform.mjs',
  'scripts/verify-security-hardening.mjs',
];
for (const ts of testScripts) {
  updateFile(path.join(ROOT_DIR, ts), (content) => {
    return content.replace(
      /'super-secret-business-os-key'/g,
      "'test-secure-256bit-automated-verification-secret-xyz123'"
    );
  });
}

console.log('=== HARDENING SCRIPT COMPLETED ===');
