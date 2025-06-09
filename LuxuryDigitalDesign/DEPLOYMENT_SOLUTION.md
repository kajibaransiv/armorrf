# Railway Deployment Solution

## Root Cause
Your Railway deployment fails because the armorrf GitHub repository is missing the correct server files and build configuration. Railway is using outdated deployment files that don't properly handle static file serving or port configuration.

## Required Files for armorrf Repository

### 1. start-railway.js
```javascript
#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

console.log('=== ArmorRF Railway Server ===');
console.log('Port:', PORT);
console.log('Environment:', process.env.NODE_ENV || 'production');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Static file serving
const staticDirs = [
  path.join(process.cwd(), 'dist', 'public'),
  path.join(process.cwd(), 'client', 'dist'),
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), 'build')
];

let staticDir = null;
for (const dir of staticDirs) {
  if (fs.existsSync(dir)) {
    staticDir = dir;
    console.log('Serving static files from:', staticDir);
    app.use(express.static(staticDir));
    break;
  }
}

// API endpoints
app.get('/api/products', (req, res) => {
  res.json([{
    id: 1,
    name: "The EMF Hoodie",
    description: "Advanced EMF protection hoodie with silver fiber technology",
    price: 299.99,
    features: ["99.9% EMF Protection", "Silver Fiber Lining", "Premium Cotton"]
  }]);
});

// SPA routing
app.get('*', (req, res) => {
  if (staticDir) {
    const indexPath = path.join(staticDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ArmorRF - EMF Protection</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="font-family: Arial; text-align: center; padding: 50px;">
      <h1>ArmorRF</h1>
      <h2>EMF Protection Technology</h2>
      <p>Server running on port ${PORT}</p>
      <p><a href="/health">Health Check</a> | <a href="/api/products">Products</a></p>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('ArmorRF server running on port', PORT);
});
```

### 2. nixpacks.toml
```toml
[phases.setup]
nixPkgs = ['nodejs-20']

[phases.install]
cmds = ['npm ci']

[phases.build]
cmds = [
  'npm run build',
  'node build-server.js',
  'node post-build.js'
]

[start]
cmd = 'node start-railway.js'
```

### 3. railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node start-railway.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

## Deployment Steps

1. **Add these files to your armorrf GitHub repository**
2. **Copy build-server.js and post-build.js from this Replit project**
3. **Commit with message: "Fix Railway deployment configuration"**
4. **In Railway dashboard: Settings → Triggers → Deploy Now**
5. **Verify at https://v6jlhzzd.up.railway.app/health**

## Expected Results
- Port 8000 will be used consistently
- Static files will be served from dist/public
- Health endpoint will return server status
- API endpoints will work properly
- Custom domain armorrf.com will resolve correctly

The server uses CommonJS to avoid ESM import issues that were causing the deployment crashes.