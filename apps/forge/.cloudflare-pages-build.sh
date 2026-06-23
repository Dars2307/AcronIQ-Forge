#!/bin/bash
# Cloudflare Pages build script for Forge

# Set environment variables
export PORT=3000
export BASE_PATH=/

# Install dependencies
pnpm install

# Build the application
pnpm run build
