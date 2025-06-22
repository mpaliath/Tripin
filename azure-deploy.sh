#!/bin/bash

# Azure Deployment Script for TripIn
# This script deploys the TripIn app to Azure App Service

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuration
RESOURCE_GROUP=""
APP_NAME=""
LOCATION="East US"
SKU="B1"  # Basic tier, change to F1 for free tier

# Function to show usage
show_usage() {
    echo "Usage: $0 -g <resource-group> -n <app-name> [OPTIONS]"
    echo ""
    echo "Required:"
    echo "  -g, --resource-group    Azure resource group name"
    echo "  -n, --name             Azure App Service name"
    echo ""
    echo "Optional:"
    echo "  -l, --location         Azure region (default: East US)"
    echo "  -s, --sku             App Service plan SKU (default: B1)"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 -g myResourceGroup -n tripin-app"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -g|--resource-group)
            RESOURCE_GROUP="$2"
            shift 2
            ;;
        -n|--name)
            APP_NAME="$2"
            shift 2
            ;;
        -l|--location)
            LOCATION="$2"
            shift 2
            ;;
        -s|--sku)
            SKU="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate required parameters
if [ -z "$RESOURCE_GROUP" ] || [ -z "$APP_NAME" ]; then
    print_error "Resource group and app name are required!"
    show_usage
    exit 1
fi

echo "🚀 Deploying TripIn to Azure App Service"
echo "========================================="
echo "Resource Group: $RESOURCE_GROUP"
echo "App Name: $APP_NAME"
echo "Location: $LOCATION"
echo "SKU: $SKU"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    print_error "Azure CLI is not installed. Please install it first:"
    echo "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    print_warning "You are not logged in to Azure CLI"
    print_status "Please log in..."
    az login
fi

print_status "Current Azure subscription:"
az account show --query "{Name:name, Id:id}" --output table

# Build the application
print_status "Building application..."
if [ ! -f "./deploy.sh" ]; then
    print_error "Build script not found. Please run this from the project root."
    exit 1
fi

chmod +x ./deploy.sh
./deploy.sh

# Create resource group if it doesn't exist
print_status "Ensuring resource group exists..."
if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    print_status "Creating resource group: $RESOURCE_GROUP"
    az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
    print_success "Resource group created!"
else
    print_success "Resource group already exists"
fi

# Create App Service plan if it doesn't exist
APP_SERVICE_PLAN="${APP_NAME}-plan"
print_status "Ensuring App Service plan exists..."
if ! az appservice plan show --name "$APP_SERVICE_PLAN" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
    print_status "Creating App Service plan: $APP_SERVICE_PLAN"
    az appservice plan create \
        --name "$APP_SERVICE_PLAN" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --sku "$SKU" \
        --is-linux
    print_success "App Service plan created!"
else
    print_success "App Service plan already exists"
fi

# Create Web App if it doesn't exist
print_status "Ensuring Web App exists..."
if ! az webapp show --name "$APP_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
    print_status "Creating Web App: $APP_NAME"
    az webapp create \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --plan "$APP_SERVICE_PLAN" \
        --runtime "NODE:20-lts"
    print_success "Web App created!"
else
    print_success "Web App already exists"
fi

# Configure Web App settings
print_status "Configuring Web App settings..."
az webapp config appsettings set \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --settings \
        NODE_ENV=production \
        WEBSITE_NODE_DEFAULT_VERSION=~20 \
        SCM_DO_BUILD_DURING_DEPLOYMENT=false

# Deploy the application
print_status "Deploying application..."
cd deploy
zip -r ../tripin-deploy.zip .
cd ..

az webapp deploy \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --src-path "tripin-deploy.zip"

# Clean up
rm tripin-deploy.zip

print_success "Deployment completed! 🎉"
echo ""
echo "Your app is available at: https://${APP_NAME}.azurewebsites.net"
echo ""
print_warning "Don't forget to set your environment variables in the Azure portal:"
echo "- OPENAI_API_KEY"
echo "- AZURE_COSMOS_CONNECTION_STRING"
echo "- SERP_API_KEY"
echo "- UNSPLASH_ACCESS_KEY"
echo ""
echo "You can set them using:"
echo "az webapp config appsettings set --name $APP_NAME --resource-group $RESOURCE_GROUP --settings KEY=value"
