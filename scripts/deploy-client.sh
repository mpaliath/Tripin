#!/usr/bin/env bash
set -euo pipefail

# Build the client application
npm run build --prefix app/client

# Deploy to Azure Static Web App
: "${AZURE_STATIC_WEB_APP_NAME?}"  # Name of the Static Web App
: "${AZURE_RESOURCE_GROUP?}"       # Resource group containing the Static Web App

az staticwebapp upload \
  --name "$AZURE_STATIC_WEB_APP_NAME" \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --source app/client/dist/client
