import { tryGetItem } from "../utils/cosmosCache";

export type FallbackAdventures = any[]; // Replace 'any' with Adventure if possible

// Hardcoded fallback adventures when all APIs fail
const HARDCODED_FALLBACKS = [
  {
    title: "Local Park Visit",
    description: "Explore a nearby park with family-friendly activities",
    duration: "2-3 hours",
    heroImage: "/images/forest-hike.jpg"
  },
  {
    title: "Museum Tour", 
    description: "Visit a local museum or cultural center",
    duration: "3-4 hours",
    heroImage: "/images/zoo.jpg"
  },
  {
    title: "Beach Day",
    description: "Relax at a nearby beach or waterfront",
    duration: "4-6 hours", 
    heroImage: "/images/beach.jpg"
  }
];

export async function getFallbackAdventures() {
  // Query fallback adventures from Cosmos DB using the internal container
  const querySpec = {
    query: "SELECT * FROM c WHERE c.type = @type",
    parameters: [{ name: "@type", value: "fallback" }]
  };
  // Use the internal container from cosmosCache
  const items = await tryGetItem<FallbackAdventures>("fallbackAdventures", "fallbackQuery");
  if (items && items.length > 0) return items;
  
  // Return hardcoded fallbacks if nothing in cache
  console.log('Using hardcoded fallback adventures');
  return HARDCODED_FALLBACKS;
}
