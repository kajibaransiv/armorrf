# Deployment Guide

## Fixed Issues

The following deployment issues have been resolved:

### 1. Build Output Structure
- **Issue**: Deployment expected files in `dist/` but Vite was building to `dist/public/`
- **Solution**: Created `post-build.js` script to copy static files from `dist/public/` to `dist/`

### 2. Deployment Type Configuration
- **Issue**: Project was configured for static deployment but contains Express server
- **Solution**: Project needs to be configured for autoscale deployment in Replit

### 3. Server Bundle
- **Issue**: Server code needs to be bundled for production
- **Solution**: Build script includes esbuild to bundle server code to `dist/index.js`

## Build Process

The build process now works as follows:

1. `npm run build` runs:
   - `vite build` - builds frontend to `dist/public/`
   - `esbuild server/index.ts` - bundles server to `dist/index.js`

2. `node post-build.js` copies static files to correct deployment structure:
   - `dist/index.html` - main HTML file
   - `dist/assets/` - CSS and JS assets
   - `dist/index.js` - server bundle

## Deployment Structure

```
dist/
├── index.html          # Frontend entry point
├── assets/             # Static assets (CSS, JS)
│   ├── index-*.css
│   └── index-*.js
├── index.js           # Server bundle
└── public/            # Original build output (for reference)
```

## Required Configuration Changes

For successful deployment on Replit, the `.replit` file should be configured as:

```toml
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build", "&&", "node", "post-build.js"]
run = ["npm", "start"]
```

## Environment Variables

The application requires:
- `DATABASE_URL` - PostgreSQL connection string (already configured in Replit)
- `NODE_ENV=production` - for production mode

## Verification

The deployment structure is now ready:
- ✅ Static files available in `dist/`
- ✅ Server bundle built at `dist/index.js`
- ✅ Build process handles file structure requirements
- ✅ Production server starts with `npm start`