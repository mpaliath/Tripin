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
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`

## Setup
Optional: npm run clean:nuke 
1. Install dependencies for the server and client:
   ```bash
   npm run install
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
