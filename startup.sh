#!/bin/bash

# Azure App Service startup script
# This file tells Azure how to start your Node.js application

echo "Starting TripIn application on Azure App Service..."

# Set the port from Azure's environment variable
export PORT=${PORT:-8080}

# Start the application
cd /home/site/wwwroot
node app/server/dist/index.js
