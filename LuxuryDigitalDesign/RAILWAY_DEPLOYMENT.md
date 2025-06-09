# Railway Deployment Guide

## Quick Setup Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Railway deployment setup"
   git push origin main
   ```

2. **Railway Configuration**
   - Connect your GitHub repo to Railway
   - Railway will auto-detect the Node.js project
   - Set the following environment variables in Railway dashboard:

## Required Environment Variables

Set these in your Railway project dashboard:

```
NODE_ENV=production
DATABASE_URL=<your-postgresql-connection-string>
PORT=${{ PORT }}
```

## Build Configuration

Railway will automatically:
- Run `npm install`
- Run `npm run build` 
- Start with `npm start`

The build process includes:
- Frontend build (Vite) → `dist/public/`
- Server bundle (esbuild) → `dist/index.js`
- Static file preparation for deployment

## Database Setup

1. **Add PostgreSQL service** in Railway dashboard
2. **Copy the DATABASE_URL** from the PostgreSQL service
3. **Run database migration**:
   ```bash
   npm run db:push
   ```

## Domain & SSL

Railway automatically provides:
- HTTPS domain (`.railway.app`)
- SSL certificates
- Custom domain support (optional)

## Files Added for Railway

- `railway.json` - Railway deployment configuration
- `Procfile` - Process definition for Railway
- `build-railway.js` - Railway-specific build script

## Deployment Status

After pushing to GitHub, Railway will:
1. Detect changes automatically
2. Build the application
3. Deploy to production
4. Provide the live URL

Your EMF hoodie e-commerce platform will be live at: `https://your-project-name.railway.app`

## Updated Configuration (June 2025)
✅ Added explicit buildCommand in railway.json
✅ STRIPE_SECRET_KEY environment variable configured
✅ Build process tested and working locally