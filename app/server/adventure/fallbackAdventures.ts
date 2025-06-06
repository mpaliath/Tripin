import { tryGetItem } from "./cosmosCache";

export type FallbackAdventures = any[]; // Replace 'any' with Adventure if possible

export async function getFallbackAdventures() {
  // Query fallback adventures from Cosmos DB using the internal container
  const querySpec = {
    query: "SELECT * FROM c WHERE c.type = @type",
    parameters: [{ name: "@type", value: "fallback" }]
  };
  // Use the internal container from cosmosCache
  const items = await tryGetItem<FallbackAdventures>("fallbackAdventures", "fallbackQuery");
  if (items) return items;
  // fallback: if not cached, query and cache (optional, or implement as needed)
  // ...implement direct Cosmos query here if needed...
  return [];
}
