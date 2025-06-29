import { CosmosClient, Container } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
// Use COSMOS_DATABASE_ID, but fall back to COSMOS_DB_NAME for compatibility with cosmosCache.
const databaseId = process.env.COSMOS_DATABASE_ID || process.env.COSMOS_DB_NAME;

if (!endpoint || !key || !databaseId) {
  console.error(
    "Cosmos DB environment variables (COSMOS_ENDPOINT, COSMOS_KEY, COSMOS_DATABASE_ID/COSMOS_DB_NAME) are not fully set."
  );
  // In a production app, you might want to throw an error to prevent startup
  // For now, we'll log and allow the app to run, though DB operations will fail.
}

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId!);

// Define and export containers for different parts of the application
const usersContainerId = "users";
const cacheContainerId = process.env.COSMOS_CONTAINER_NAME || "cache";

export const usersContainer: Container = database.container(usersContainerId);
export const cacheContainer: Container = database.container(cacheContainerId);

console.log(
  `Connected to Cosmos DB: '${databaseId}'. Containers: '${usersContainerId}', '${cacheContainerId}'`
);