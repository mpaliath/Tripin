#!/bin/bash

# TripIn Deployment Script for Azure App Service
# This script builds both client and server for production deployment

set -e

echo "🚀 Starting TripIn deployment build..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "app" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Install dependencies and build client
print_status "Building client (React app)..."
cd app/client
npm install
npm run build
print_success "Client build completed!"

# Install dependencies and build server
print_status "Building server (Express app)..."
cd ../server
npm install
npm run build
print_success "Server build completed!"

# Create deployment package
print_status "Creating deployment package..."
cd ../..

# Create a deploy directory
rm -rf deploy
mkdir -p deploy

# Copy server build and dependencies
cp -r app/server/dist deploy/
cp app/server/package.json deploy/

# Copy client build to server structure  
mkdir -p deploy/dist/client
cp -r app/client/dist/* deploy/dist/client/

# Create a production package.json for Azure
cat > deploy/package.json << EOF
{
  "name": "tripin-production",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js"
  },
  "engines": {
    "node": ">=20.0.0 <21.0.0"
  },
  "dependencies": {
    "@azure/cosmos": "^4.4.1",
    "axios": "^1.9.0",
    "dotenv": "^16.5.0",
    "express": "^4.19.0",
    "node-fetch": "^2.7.0",
    "openai": "^5.1.0"
  }
}
EOF

print_success "Deployment package created in ./deploy directory"

print_status "Deployment build complete! 🎉"
echo ""
echo "Next steps:"
echo "1. Deploy the ./deploy directory to Azure App Service"
echo "2. Set environment variables in Azure:"
echo "   - NODE_ENV=production"
echo "   - Any API keys and database connection strings"
echo ""
echo "Azure CLI deployment command:"
echo "az webapp deploy --resource-group trippin_group --name TripIn --src-path ./deploy --type zip"
echo ""
echo "Or using Azure CLI with zip:"
echo "cd deploy && zip -r ../tripin-app.zip . && cd .."
echo "az webapp deployment source config-zip --resource-group trippin_group --name TripIn --src tripin-app.zip"
