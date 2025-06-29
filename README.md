# Tripin

This project contains a simple Express server and Vite React client for generating day-trip recommendations.

## Environment Variables
The server expects the following variables to be set via a `.env` file or the environment:

- `OPENAI_API_KEY`
- `SERP_KEY`
- `GOOGLE_API_KEY`
- `GOOGLE_CX`
- `UNSPLASH_ACCESS_KEY`
- `COSMOS_ENDPOINT`
- `COSMOS_KEY`
- `COSMOS_DB_NAME`
- `COSMOS_CONTAINER_NAME`
- `PORT` (optional, defaults to 3000)

## Setup
1. Install dependencies for the server and client:
   ```bash
   npm install --prefix app/server
   npm install --prefix app/client
   ```
2. Run the provided setup script to generate `.env` from your environment variables:
   ```bash
   ./setup.sh
   ```
3. Build the server and client:
   ```bash
   npm run build --prefix app/server
   npm run build --prefix app/client
   ```
4. Start the server:
   ```bash
   node app/dist/server/index.js
   ```

## Development
During development you can run the client and server separately using their respective `dev` or `start` scripts.

This project requires **Node.js 20** or later.

## Deployment
Two helper scripts automate deployment to Azure:

```bash
./scripts/deploy-client.sh # Deploys the client to Azure Static Web Apps
./scripts/deploy-server.sh # Deploys the server to Azure App Service
```

The scripts expect the following environment variables:

- `AZURE_RESOURCE_GROUP` – resource group containing your Azure resources
- `AZURE_STATIC_WEB_APP_NAME` – name of the Static Web App for the client
- `AZURE_APP_SERVICE_NAME` – name of the App Service for the server

Ensure the Azure CLI is installed and you are logged in before running them.
