#!/bin/bash

# Azure deployment script for TripIn app
set -e

# Configuration
APP_NAME="TripIn"
RESOURCE_GROUP="tripin_group-abf4"
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

# Navigate to app directory (we're already in app folder structure)
cd "$(dirname "$0")/.."

# Build the application
echo "📦 Building application..."
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
cd server
rm -f deploy.zip
zip -r deploy.zip dist/ package.json package-lock.json node_modules/

# Deploy to Azure
echo "🚀 Deploying to Azure App Service..."
az webapp deploy \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --src-path deploy.zip \
    --type zip

# Clean up
rm deploy.zip
cd ..

echo "✅ Deployment completed successfully!"
echo "🌐 Your app should be available at: https://tripin-h4cderdrdsatgke4.centralus-01.azurewebsites.net"
