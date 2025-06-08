#!/usr/bin/env bash
# Render build script

set -e

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Build completed successfully!"