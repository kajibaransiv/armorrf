# Railway Deployment Fix Guide

Your Railway deployment is returning 404 errors. Here are the exact steps to resolve this:

## Problem
The server crashes due to ESM path resolution issues with `import.meta.dirname` being undefined in production builds.

## Solution Files Required

### 1. build-server.js (CREATE NEW FILE)
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

### 2. Update nixpacks.toml
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

### 3. Update railway.json
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
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

### 4. Add .dockerignore (CREATE NEW FILE)
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

## Deployment Steps
1. Create/update these files in your GitHub repository
2. Commit and push changes
3. Railway will automatically redeploy
4. Check deployment logs for any remaining errors

## Environment Variables Required
- DATABASE_URL (your Neon connection string)
- STRIPE_SECRET_KEY (already configured)

This fixes the ESM compilation issue causing server crashes on Railway.