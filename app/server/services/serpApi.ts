import crypto from "crypto";
import fetch from "node-fetch";
import { storeItem, tryGetItem } from "../utils/cosmosCache";

const SERP_KEY = process.env.SERP_KEY;

function makeSafeId(url: string) {
  return crypto.createHash("sha256").update(url).digest("hex");
}

export type Serp = any; // Replace 'any' with a more specific type if available

export async function getSerpResults({ cityQ }: { cityQ: string }) {
  const serpURL = `https://serpapi.com/search.json?api_key=${SERP_KEY}&q=${encodeURIComponent(cityQ)}&num=10`;
  const serpId = makeSafeId(serpURL);
  let serp;
  const cached = await tryGetItem<Serp>(serpId, "serp");
  if (cached) {
    serp = cached;
  } else {
    serp = await fetch(serpURL).then(r => r.json());
    await storeItem(serpId, "serp", serp);
  }
  return { serp, serpId };
}
