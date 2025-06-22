# TripIn Azure Deployment Guide

## Overview
This guide covers deploying the TripIn application (React client + Express server) to Azure App Service.

## Prerequisites
- Azure CLI installed (`brew install azure-cli`)
- Node.js 20.x
- Azure subscription with App Service created
- Off corporate network for npm operations

## Azure App Service Details
- **App Service name**: TripIn
- **Resource Group**: trippin_group
- **Region**: Central US

## Deployment Architecture
The application deploys as a single unit where:
1. React client builds to static files
2. Express server serves the React build as static files
3. Server handles API routes under `/api/*`
4. All other routes serve the React SPA

## Quick Deployment

### Option 1: Using the deployment script
```bash
# Make script executable
chmod +x scripts/deploy-azure.sh

# Run deployment
./scripts/deploy-azure.sh
```

### Option 2: Manual deployment
```bash
# 1. Build the application (off corpnet for npm)
npm run build

# 2. Deploy to Azure
cd app/server
zip -r deploy.zip dist/ node_modules/ package.json

az webapp deployment source config-zip \
  --resource-group "trippin_group" \
  --name "TripIn" \
  --src deploy.zip
```

## Environment Configuration

### Required Environment Variables (set in Azure portal)
Navigate to Azure portal → App Service → Configuration → Application settings:

```
NODE_ENV=production
PORT=80
WEBSITE_NODE_DEFAULT_VERSION=20.18.1
SCM_DO_BUILD_DURING_DEPLOYMENT=true

# Optional API keys (for full functionality)
OPENAI_API_KEY=your_openai_api_key_here
SERP_API_KEY=your_serp_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_key_here
COSMOS_DB_CONNECTION_STRING=your_cosmos_connection_string_here
```

### Startup Command
In Azure portal → Configuration → General settings → Startup Command:
```
node app/server/dist/index.js
```

## Build Process
1. **Client build**: `cd app/client && npm run build` → creates `dist/` folder
2. **Server build**: `cd app/server && npm run build` → compiles TypeScript to `dist/`
3. **Copy client**: Client `dist/` copied to server's `dist/client/` directory
4. **Server serves**: Express serves client files from `dist/client/`

## File Structure After Build
```
app/server/dist/
├── index.js (compiled server)
├── routes/
├── client/ (copied from app/client/dist)
│   ├── index.html
│   ├── assets/
│   └── ...
```

## Development vs Production Paths
The server automatically detects environment:
- **Development**: Serves from `../client/dist`
- **Production**: Serves from `./client` (relative to compiled server)

## Troubleshooting

### Common Issues
1. **Build fails with axios error**: Install axios in client dependencies
2. **404 on routes**: Ensure SPA fallback is working
3. **Static files not found**: Check client build copied correctly

### Debugging in Azure
1. Enable detailed error messages in app settings
2. Check application logs in Azure portal
3. Use Kudu console for file system inspection

### Local Testing
```bash
# Test the built application locally
npm run build
cd app/server
node dist/index.js
```

## Security Notes
- Remove `WEBSITE_DETAILED_ERROR_MESSAGES=true` in production
- Ensure API keys are stored securely in Azure Key Vault (future enhancement)
- Enable HTTPS only in Azure App Service settings

## Next Steps
1. Set up custom domain
2. Configure SSL certificate
3. Set up monitoring and logging
4. Implement CI/CD pipeline
5. Add Azure Key Vault for secrets management
