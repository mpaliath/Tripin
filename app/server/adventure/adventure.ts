import { CosmosClient } from "@azure/cosmos";
import { Router } from "express";
import { getFallbackAdventures } from "./fallbackAdventures";
import { replaceHeroImagesTextWithUrl } from "./imageCache";
import { getOpenAiAdventures } from "./openAiApi";
import { getSerpResults } from "./serpApi";

const router = Router();
const MAX_RESULTS = 5;

const cosmosEndpoint = process.env.COSMOS_ENDPOINT!;
const cosmosKey = process.env.COSMOS_KEY!;
const cosmosDbName = process.env.COSMOS_DB_NAME!;
const cosmosContainerName = process.env.COSMOS_CONTAINER_NAME!;
const cosmosClient = new CosmosClient({ endpoint: cosmosEndpoint, key: cosmosKey });
const container = cosmosClient.database(cosmosDbName).container(cosmosContainerName);

router.get("/api/adventures", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const hrs = Number(req.query.hours || 8);
  const city = req.query.city ? String(req.query.city) : '';

  // Fallback to Cosmos DB if no lat/lng/city
  if ((!lat || !lng) && !city) {
    const fallback = await getFallbackAdventures(container);
    return res.json(fallback);
  }

  try {
    // 1. craft query
    const radiusMi = Math.max(10, Math.floor((hrs / 2) * 60 / 50)); // crude 50 mph
    const locationQ = city ? city : (lat && lng ? `${lat},${lng}` : '');
    const cityQ = `family day trip within ${radiusMi} miles of ${locationQ}`;

    // 2. call search API (with Cosmos DB cache)
    const { serp, serpId } = await getSerpResults({ cityQ, container });
    const snippets = serp.organic_results?.map((o: any) => ({
      title: o.title, url: o.link, snippet: o.snippet
    })).slice(0, 10) || [];

    if (snippets.length === 0) {
      const fallback = await getFallbackAdventures(container);
      return res.json(fallback);
    }

    // 3. Check OpenAI response cache or call OpenAI
    let adventures;
    try {
      adventures = await getOpenAiAdventures({ serpId, hrs, maxResults: MAX_RESULTS, snippets, container });
      await replaceHeroImagesTextWithUrl(adventures, container);
    } catch {
      adventures = await getFallbackAdventures(container);
    }
    res.json(adventures);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate adventures", details: (err as any)?.message || err });
  }
});

export default router;
