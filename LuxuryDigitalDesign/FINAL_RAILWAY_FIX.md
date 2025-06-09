# Complete Railway Deployment Fix

Your Railway deployment needs these exact files in your armorrf repository:

## 1. Create start-railway.js with this content:

```javascript
#!/usr/bin/env node

// Use CommonJS to avoid ESM import issues
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

console.log('=== Railway Deployment Server ===');
console.log('Port:', PORT);
console.log('Environment:', process.env.NODE_ENV || 'production');
console.log('Working Directory:', process.cwd());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    uptime: process.uptime()
  });
});

// Static file serving
const staticDirectories = [
  path.join(process.cwd(), 'dist', 'public'),
  path.join(process.cwd(), 'client', 'dist'),
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), 'build')
];

let staticDir = null;
for (const dir of staticDirectories) {
  if (fs.existsSync(dir)) {
    staticDir = dir;
    console.log('Found static directory:', staticDir);
    app.use(express.static(staticDir));
    break;
  }
}

if (!staticDir) {
  console.log('No static directory found');
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

// Catch-all for SPA routing
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
      <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .status { background: #f0f8ff; padding: 20px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>ArmorRF</h1>
        <h2>EMF Protection Technology</h2>
        <div class="status">
          <p>Server running on port ${PORT}</p>
          <p><a href="/health">Health Check</a> | <a href="/api/products">Products</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('Railway server running on port', PORT);
  console.log('URL: https://v6jlhzzd.up.railway.app');
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
```

## 2. Update nixpacks.toml:

```toml
[variables]
NODE_ENV = "production"

[phases.setup]
nixPkgs = ['nodejs-18_x']

[phases.install]
cmds = ['npm ci --production=false --no-audit --no-fund']

[phases.build]
cmds = [
  'npm run build',
  'node post-build.js'
]

[start]
cmd = 'node start-railway.js'
```

## 3. Update railway.json:

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

## Critical Deployment Steps:

**Your Railway deployment is failing because the armorrf repository lacks the correct server files.**

### Step 1: Add Files to armorrf Repository
Copy these files from your Replit project to your armorrf GitHub repository:
- `start-railway.js` (the server file above)
- `nixpacks.toml` (updated build configuration)
- `railway.json` (updated deployment settings)
- `build-server.js` (build process handler)
- `post-build.js` (post-build operations)

### Step 2: Force Railway Redeploy
1. Commit all files to your armorrf repository
2. In Railway dashboard, go to Settings → Triggers
3. Click "Deploy Now" for a fresh deployment

### Step 3: Verify Deployment
Check these endpoints after deployment:
- https://v6jlhzzd.up.railway.app/health (server status)
- https://v6jlhzzd.up.railway.app/api/products (product data)
- https://armorrf.com (custom domain)

The server uses CommonJS and handles static file serving properly to resolve the current 404 errors.