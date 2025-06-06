import { Container } from "@azure/cosmos";
import crypto from "crypto";
import fetch from "node-fetch";

const SERP_KEY = process.env.SERP_KEY;

function makeSafeId(url: string) {
  return crypto.createHash("sha256").update(url).digest("hex");
}

export async function getSerpResults({ cityQ, container }: { cityQ: string, container: Container }) {
  const serpURL = `https://serpapi.com/search.json?api_key=${SERP_KEY}&q=${encodeURIComponent(cityQ)}&num=10`;
  const serpId = makeSafeId(serpURL);
  let serp;
  try {
    const { resource } = await container.item(serpId, 'serp').read();
    if (resource && resource.data) {
      serp = resource.data;
    } else {
      serp = await fetch(serpURL).then(r => r.json());
      await container.items.create({ id: serpId, type: 'serp', data: serp, createdAt: new Date().toISOString() });
    }
  } catch (e) {
    serp = await fetch(serpURL).then(r => r.json());
    try {
      await container.items.create({ id: serpId, type: 'serp', data: serp, createdAt: new Date().toISOString() });
    } catch {}
  }
  return { serp, serpId };
}
