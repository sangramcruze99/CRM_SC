const fs = require('fs');
const path = require('path');

const apps = ['bi-engine', 'chat', 'finance', 'helpdesk', 'hr', 'search', 'documents', 'admin', 'developer', 'audit', 'projects', 'settings', 'inventory', 'cms'];

apps.forEach(app => {
  const modulePath = path.join(__dirname, 'apps', app, 'src', 'app.module.ts');
  if (fs.existsSync(modulePath)) {
    let content = fs.readFileSync(modulePath, 'utf8');
    
    // Add imports
    if (!content.includes('JwtModule')) {
      content = `import { JwtModule } from '@nestjs/jwt';\nimport { APP_GUARD } from '@nestjs/core';\nimport { JwtAuthGuard, getJwtSecret } from '@repo/auth';\n` + content;
    }
    
    // Add JwtModule to imports array
    content = content.replace(/imports:\s*\[/, "imports: [\n    JwtModule.register({ secret: getJwtSecret() }),");
    
    // Add APP_GUARD to providers array
    content = content.replace(/providers:\s*\[/, "providers: [\n    {\n      provide: APP_GUARD,\n      useClass: JwtAuthGuard,\n    },");
    
    fs.writeFileSync(modulePath, content);
    console.log(`Updated ${modulePath}`);
  }
});
