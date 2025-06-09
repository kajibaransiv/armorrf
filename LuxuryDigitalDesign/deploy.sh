#!/bin/bash
set -e

echo "Starting Railway deployment build..."

# Install dependencies
npm install

# Build the application
echo "Building frontend and backend..."
npm run build

# Run post-build script
echo "Running post-build configuration..."
node post-build.js

# Verify build outputs
echo "Verifying build outputs..."
if [ ! -f "dist/index.js" ]; then
    echo "ERROR: Server bundle not found at dist/index.js"
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    echo "ERROR: Frontend build not found at dist/public/index.html"
    exit 1
fi

echo "Build completed successfully!"
echo "Starting server..."

# Start the server
NODE_ENV=production node dist/index.js