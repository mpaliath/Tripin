#!/usr/bin/env bash
set -euo pipefail

# Build the server application
npm run build --prefix app/server

# Install production dependencies
npm install --prefix app/server --production

# Package build output for deployment
pushd app/server > /dev/null
zip -r ../server.zip dist package.json package-lock.json node_modules >/dev/null
popd > /dev/null

# Deploy to Azure App Service
: "${AZURE_APP_SERVICE_NAME?}"   # Name of the App Service
: "${AZURE_RESOURCE_GROUP?}"     # Resource group containing the App Service

az webapp deployment source config-zip \
  --name "$AZURE_APP_SERVICE_NAME" \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --src server.zip

# Clean up
rm server.zip
