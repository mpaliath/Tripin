import { CosmosClient, Container } from "@azure/cosmos";
import config from "../config";

const client = new CosmosClient({
  endpoint: config.cosmos.endpoint,
  key: config.cosmos.key,
});
const database = client.database(config.cosmos.databaseId);

// Define and export containers for different parts of the application
export const usersContainer: Container = database.container(config.cosmos.usersContainerId);
export const cacheContainer: Container = database.container(config.cosmos.cacheContainerId);

console.log(
  `Connected to Cosmos DB: '${config.cosmos.databaseId}'. Containers: '${config.cosmos.usersContainerId}', '${config.cosmos.cacheContainerId}'`
);