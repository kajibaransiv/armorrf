# Copy These Files to Your armorrf Repository

Since the Git panel isn't connecting properly, manually copy these files to your armorrf repository on GitHub:

## 1. Create: build-server.js
```javascript
#!/usr/bin/env node

import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outdir: 'dist',
    define: {
      'import.meta.dirname': '__dirname'
    },
    banner: {
      js: `import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);`
    }
  });
  
  console.log('✓ Server build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
```

## 2. Update: nixpacks.toml
```toml
[variables]
NODE_ENV = "production"

[phases.setup]
nixPkgs = ['nodejs-18_x']

[phases.install]
cmds = ['npm ci --production=false --no-audit --no-fund --legacy-peer-deps']

[phases.build]
cmds = [
  'npm run build',
  'node build-server.js',
  'node post-build.js'
]

[start]
cmd = 'node dist/index.js'
```

## 3. Update: railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3,
    "healthcheckPath": "/",
    "healthcheckTimeout": 300
  }
}
```

## 4. Create: .dockerignore
```
node_modules
.git
.gitignore
README.md
.env
.env.local
attached_assets/*.mp4
attached_assets/*.png
```

## Steps:
1. Go to your armorrf repository on GitHub
2. Create/edit these files with the exact content above
3. Commit with message: "Fix Railway ESM deployment crash"
4. Railway will automatically redeploy

This fixes the `import.meta.dirname` error causing 404s on Railway.