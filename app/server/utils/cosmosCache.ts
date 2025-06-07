import { Container, CosmosClient } from "@azure/cosmos";

let container: Container | null = null;
function getContainer(): Container {
  if (!container) {
    const endpoint = process.env.COSMOS_ENDPOINT!;
    const key = process.env.COSMOS_KEY!;
    const dbName = process.env.COSMOS_DB_NAME!;
    const containerName = process.env.COSMOS_CONTAINER_NAME!;
    const client = new CosmosClient({ endpoint, key });
    container = client.database(dbName).container(containerName);
  }
  return container;
}

export async function tryGetItem<T>(id: string, type: string): Promise<T | null> {
  const container = getContainer();
  try {
    const { resource } = await container.item(id, type).read();
    if (resource && resource.data) {
      return typeof resource.data === "string" ? JSON.parse(resource.data) : resource.data;
    }
    debugger;
    return null;
  } catch (err: any) {
    // Only ignore 'not found' errors (404), throw others
    if (err?.code === 404 || err?.statusCode === 404) {
      return null;
    }
    throw err;
  }
}

export async function storeItem(id: string, type: string, data: any, params?: any) {
  const container = getContainer();
  try {
    await container.items.create({
      id,
      type,
      params,
      data: typeof data === "string" ? data : JSON.stringify(data),
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error storing item in Cosmos DB:", err);
    throw err;
  }
}
