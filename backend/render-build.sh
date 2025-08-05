#!/usr/bin/env bash
# Render build script

set -e

echo "Installing dependencies (including devDependencies for TypeScript build)..."
npm install --production=false

echo "Building TypeScript..."
npm run build

echo "Build completed successfully!"