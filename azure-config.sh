# Azure App Service Deployment Configuration
# This file configures the deployment settings for Azure App Service

# Build configuration
BUILD_FLAGS=""

# Node.js version
NODE_VERSION="20"

# Startup command
STARTUP_COMMAND="node index.js"

# Environment variables that should be set in Azure
# (These are just documentation - set these in the Azure portal or CLI)
REQUIRED_ENV_VARS=(
    "NODE_ENV=production"
    "PORT=8080"
    # Add your API keys and other environment variables here
    # "OPENAI_API_KEY=your_openai_key"
    # "AZURE_COSMOS_CONNECTION_STRING=your_cosmos_connection"
    # "SERP_API_KEY=your_serp_key"
    # "UNSPLASH_ACCESS_KEY=your_unsplash_key"
)
