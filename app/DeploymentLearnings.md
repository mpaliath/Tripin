# Deployment Learnings - TripIn Azure App Service

## Summary
Successfully deployed TripIn (React + Express TypeScript app) to Azure App Service on Linux using a **pre-build deployment strategy**.

## Final Working Configuration

### Azure App Service Settings
- **App Service Name**: `TripIn`
- **Resource Group**: `trippin_group` 
- **Region**: `Central US`
- **Platform**: `NODE|20-lts` (Linux)
- **Live URL**: https://tripin-h4cderdrdsatgke4.centralus-01.azurewebsites.net

### Critical App Settings
```bash
# Essential settings that made it work
SCM_DO_BUILD_DURING_DEPLOYMENT=false  # Key: Disable Azure build
NODE_ENV=production
PORT=80
WEBSITES_NODE_DEFAULT_VERSION=20-lts
```

### Startup Command
```bash
node dist/server/index.js
```

## Deployment Strategy (Option 3 - Hybrid)

### What We Deploy
- ✅ Pre-built `dist/` folder (TypeScript compiled locally)
- ✅ `package.json` (dependencies only, no devDependencies) 
- ✅ `package-lock.json` (exact versions)
- ❌ **NO** `node_modules` (Azure installs these)
- ❌ **NO** TypeScript source files

### Build Process
1. **Local**: Build client and server, copy client to server dist
2. **Azure**: Only runs `npm install --production`
3. **Result**: Fast, reliable deployments

## Project Structure

### Final File Structure
```
app/
├── package.json          # App-level scripts
├── scripts/
│   └── deploy-azure.sh   # Deployment script
├── client/               # React/Vite app
│   ├── package.json
│   └── dist/            # Built by Vite
└── server/              # Express/TypeScript app  
    ├── package.json     # Runtime deps only
    ├── dist/            # Built by TypeScript
    │   ├── server/      # Compiled TS -> JS
    │   └── client/      # Copied from client/dist
    └── tsconfig.json
```

### Key Package.json Changes

#### Server package.json
```json
{
  "dependencies": {
    "@azure/cosmos": "^4.4.1",
    "axios": "^1.9.0", 
    "dotenv": "^16.5.0",
    "express": "^4.19.0",
    "node-fetch": "^2.7.0",
    "openai": "^5.1.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/*": "..."
  }
}
```

**Critical**: TypeScript is in `devDependencies` since we build locally.

## What Didn't Work

### ❌ Option 1: Full Azure Build
- **Problem**: `tsc: not found` - TypeScript not available during Azure build
- **Attempted Fix**: Move TypeScript to dependencies
- **Still Failed**: Complex build process, tsconfig.json path issues

### ❌ Option 2: Deploy Everything (including node_modules)
- **Problem**: Large deployment size, platform compatibility issues
- **Not Attempted**: Clearly suboptimal approach

## What Worked ✅

### ✅ Option 3: Pre-build Code, Azure Installs Dependencies
- **Build locally**: No TypeScript compilation issues
- **Small deployment**: No node_modules in package 
- **Fast deployment**: ~3 seconds for file transfer
- **Platform optimized**: Azure installs Linux-compatible dependencies

## Deployment Commands

### Full Deployment Process
```bash
# From /app directory
npm run build                    # Build client + server + copy client
npm run deploy                   # Run deployment script

# What the script does:
cd server
zip -r deploy.zip dist/ package.json package-lock.json
az webapp deployment source config-zip \
    --resource-group trippin_group \
    --name TripIn \
    --src deploy.zip
```

### Build Script Details
```bash
# app/package.json scripts
"build": "npm run build:client && npm run build:server && npm run copy-client"
"build:client": "cd client && npm run build"  # Vite build
"build:server": "cd server && npm run build"  # TypeScript compile
"copy-client": "rm -rf server/dist/client && cp -r client/dist/client server/dist/client"
```

## Troubleshooting Guide

### Static File Serving Issues
- **Problem**: Express couldn't find client files
- **Solution**: Correct path in server code
```javascript
// WRONG (when running from dist/server/index.js)
const clientPath = path.join(__dirname, "client");

// CORRECT 
const clientPath = path.join(__dirname, "../client");
```

### Build Process Issues
- **Symptom**: `tsc: not found` in Azure logs
- **Root Cause**: Azure trying to build TypeScript without TypeScript installed
- **Solution**: Disable Azure build (`SCM_DO_BUILD_DURING_DEPLOYMENT=false`)

### Startup Command Issues  
- **Symptom**: `Cannot find module` errors
- **Root Cause**: Wrong startup command path
- **Solution**: Use correct path relative to deployment root

## Replication Instructions

To deploy this setup to a **new Azure App Service**:

### 1. Create Azure Resources
```bash
# Create resource group
az group create --name <your-resource-group> --location "Central US"

# Create App Service plan
az appservice plan create \
    --name <your-plan-name> \
    --resource-group <your-resource-group> \
    --sku B1 --is-linux

# Create App Service
az webapp create \
    --name <your-app-name> \
    --resource-group <your-resource-group> \
    --plan <your-plan-name> \
    --runtime "NODE|20-lts"
```

### 2. Configure App Settings
```bash
az webapp config appsettings set \
    --resource-group <your-resource-group> \
    --name <your-app-name> \
    --settings \
    SCM_DO_BUILD_DURING_DEPLOYMENT=false \
    NODE_ENV=production \
    WEBSITES_NODE_DEFAULT_VERSION=20-lts
```

### 3. Set Startup Command
```bash
az webapp config set \
    --resource-group <your-resource-group> \
    --name <your-app-name> \
    --startup-file "node dist/server/index.js"
```

### 4. Update Deployment Script
Update `app/scripts/deploy-azure.sh`:
```bash
APP_NAME="<your-app-name>"
RESOURCE_GROUP="<your-resource-group>"
```

### 5. Deploy
```bash
cd app
npm run build
npm run deploy
```

## Lessons Learned

1. **Pre-building is often better than cloud builds** for complex TypeScript projects
2. **Azure Linux App Service** works great with Node.js when configured properly
3. **Small deployment packages** (without node_modules) are faster and more reliable
4. **Testing locally first** saves significant debugging time
5. **Disable unnecessary Azure features** (like SCM builds) when not needed

## Performance Notes

- **Deployment time**: ~3 seconds for file transfer
- **Startup time**: ~10 seconds (dependency installation + app start)
- **Cold start**: ~15 seconds total
- **Package size**: ~350KB (without node_modules)

---

*Document created: June 22, 2025*  
*Last successful deployment: Option 3 strategy*
