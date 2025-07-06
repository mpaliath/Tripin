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
2. Create a `.env` with above secrets
   ```bash
   ./scripts/link-env.sh
   ```

## Development
Launch server and client from VSCode using command `Dev: Full Stack (Server + Vite + Chrome)`
