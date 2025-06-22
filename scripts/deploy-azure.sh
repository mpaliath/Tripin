#!/bin/bash

# Azure deployment script for TripIn app
set -e

# Configuration
APP_NAME="TripIn"
RESOURCE_GROUP="trippin_group"
REGION="Central US"

echo "🚀 Starting deployment to Azure App Service: $APP_NAME"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "brew install azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "🔐 Please log in to Azure CLI first:"
    echo "az login"
    exit 1
fi

echo "✅ Azure CLI is ready"

# Build the client
echo "📦 Building client..."
cd app/client
npm install
npm run build
cd ../..

# Build the server
echo "🔧 Building server..."
cd app/server
npm install
npm run build
cd ../..

# Copy client build to server's public directory
echo "📁 Copying client build to server..."
mkdir -p app/server/dist/public
cp -r app/client/dist/* app/server/dist/public/

# Create deployment package
echo "📦 Creating deployment package..."
cd app/server
rm -f deploy.zip
zip -r deploy.zip dist/ node_modules/ package.json

# Deploy to Azure
echo "🚀 Deploying to Azure App Service..."
az webapp deployment source config-zip \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --src deploy.zip

# Clean up
rm deploy.zip
cd ../..

echo "✅ Deployment completed successfully!"
echo "🌐 Your app should be available at: https://$APP_NAME.azurewebsites.net"
