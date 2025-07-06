import { cacheContainer } from "../lib/cosmos";

export async function tryGetItem<T>(id: string, type: string): Promise<T | null> {
  try {
    // Use the centralized cache container
    const { resource } = await cacheContainer.item(id, type).read();
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
  try {
    // Use the centralized cache container
    await cacheContainer.items.create({
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
