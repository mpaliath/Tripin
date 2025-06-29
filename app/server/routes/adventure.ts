import { Router } from "express";
import { getFallbackAdventures } from "../services/fallbackAdventures";
import { replaceHeroImagesTextWithUrl } from "../services/imageCache";
import { getOpenAiAdventures } from "../services/openAiApi";
import { getSerpResults } from "../services/serpApi";

const router = Router();
const MAX_RESULTS = 3;

// New endpoint for progressive loading with Server-Sent Events
router.get("/api/adventures/stream", async (req, res) => {
  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const hrs = Number(req.query.hours || 8);
    const city = req.query.city ? String(req.query.city) : '';

    sendEvent('progress', { stage: 'Initializing search...', progress: 10 });

    // Fallback to Cosmos DB if no lat/lng/city
    if ((!lat || !lng) && !city) {
      sendEvent('progress', { stage: 'Loading fallback adventures...', progress: 50 });
      const fallback = await getFallbackAdventures();
      sendEvent('complete', fallback);
      res.end();
      return;
    }

    // 1. craft query
    const radiusMi = Math.max(10, Math.floor((hrs / 2) * 60 / 50));
    const locationQ = city ? city : (lat && lng ? `${lat},${lng}` : '');
    const cityQ = `family day trip within ${radiusMi} miles of ${locationQ}`;

    sendEvent('progress', { stage: 'Searching for local attractions...', progress: 20 });

    // 2. call search API (with Cosmos DB cache)
    const { serp, serpId } = await getSerpResults({ cityQ });
    const snippets = serp.organic_results?.map((o: any) => ({
      title: o.title, url: o.link, snippet: o.snippet
    })).slice(0, 10) || [];

    if (snippets.length === 0) {
      sendEvent('progress', { stage: 'No results found, loading alternatives...', progress: 70 });
      const fallback = await getFallbackAdventures();
      sendEvent('complete', fallback);
      res.end();
      return;
    }

    sendEvent('progress', { stage: 'Creating personalized adventures with AI...', progress: 40 });

    // 3. Check OpenAI response cache or call OpenAI
    let adventures;
    try {
      adventures = await getOpenAiAdventures({ serpId, hrs, maxResults: MAX_RESULTS, snippets });
      
      sendEvent('progress', { stage: 'Finding beautiful images...', progress: 80 });
      await replaceHeroImagesTextWithUrl(adventures);
      
      sendEvent('progress', { stage: 'Complete!', progress: 100 });
      sendEvent('complete', adventures);
    } catch (error) {
      sendEvent('progress', { stage: 'AI unavailable, loading alternatives...', progress: 70 });
      adventures = await getFallbackAdventures();
      sendEvent('complete', adventures);
    }
  } catch (err) {
    sendEvent('error', { error: "Failed to generate adventures", details: (err as any)?.message || err });
  }
  
  res.end();
});

router.get("/api/adventures", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const hrs = Number(req.query.hours || 8);
  const city = req.query.city ? String(req.query.city) : '';

  // Fallback to Cosmos DB if no lat/lng/city
  if ((!lat || !lng) && !city) {
    const fallback = await getFallbackAdventures();
    return res.json(fallback);
  }

  try {
    // 1. craft query
    const radiusMi = Math.max(10, Math.floor((hrs / 2) * 60 / 50)); // crude 50 mph
    const locationQ = city ? city : (lat && lng ? `${lat},${lng}` : '');
    const cityQ = `family day trip within ${radiusMi} miles of ${locationQ}`;

    // 2. call search API (with Cosmos DB cache)
    const { serp, serpId } = await getSerpResults({ cityQ });
    const snippets = serp.organic_results?.map((o: any) => ({
      title: o.title, url: o.link, snippet: o.snippet
    })).slice(0, 10) || [];

    if (snippets.length === 0) {
      const fallback = await getFallbackAdventures();
      return res.json(fallback);
    }

    // 3. Check OpenAI response cache or call OpenAI
    let adventures;
    try {
      adventures = await getOpenAiAdventures({ serpId, hrs, maxResults: MAX_RESULTS, snippets });
      await replaceHeroImagesTextWithUrl(adventures);
    } catch {
      adventures = await getFallbackAdventures();
    }
    res.json(adventures);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate adventures", details: (err as any)?.message || err });
  }
});

export default router;
