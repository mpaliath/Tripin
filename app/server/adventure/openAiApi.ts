import { Container } from "@azure/cosmos";
import crypto from "crypto";
import OpenAI from "openai";
import { Adventure } from "./adventureTypes";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function makeSafeId(str: string) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

async function getOpenAiResponse({ model, messages, temperature, max_completion_tokens, top_p, frequency_penalty, presence_penalty }: {
  model: string,
  messages: any[],
  temperature: number,
  max_completion_tokens: number,
  top_p: number,
  frequency_penalty: number,
  presence_penalty: number
}) {
  const resp = await openai.chat.completions.create({
    model,
    messages,
    response_format: { "type": "json_object" },
    temperature,
    max_completion_tokens,
    top_p,
    frequency_penalty,
    presence_penalty
  });
  const content = resp.choices[0].message.content;
  if (!content) throw new Error("Invalid response from OpenAI");
  return typeof content === 'string' ? JSON.parse(content) : content;
}

export async function getOpenAiAdventures({ serpId, hrs, maxResults, snippets, container }: {
  serpId: string,
  hrs: number,
  maxResults: number,
  snippets: any[],
  container: Container
}): Promise<Adventure[]> {
  const openAiCacheId = makeSafeId(`${serpId}:${hrs}:${maxResults}`);
  try {
    const { resource } = await container.item(openAiCacheId, 'openAi').read();
    if (resource && resource.data) {
      const data = typeof resource.data === 'string' ? JSON.parse(resource.data) : resource.data;
      // Always return Adventure[]
      return Array.isArray(data) ? data : data.adventures;
    }
  } catch {}

  // Compose system prompt here
  const sysPrompt = `
You are a travel-planner AI. Take the JSON array \"SNIPPETS\" and output up to ${maxResults}
day-trip ideas as valid JSON matching this TypeScript interface:

type Adventure = {
  title: string;
  heroImage: string;
  driveTimeMin: number;
  outline: { name: string; startHint: string; durationMin: number }[];
  tags: string[];
  costUSD: string;
  sources: { title: string; url: string }[];
}

Rules:
- Drive time ≤ ${(hrs/2)|0} hours one-way.
- Focus on family-friendly, stroller-friendly where possible.
- For heroImage, return a search string suitable for finding a royalty-free landscape image of the place (e.g., on Unsplash).
- Use the snippet data for inspiration.
- Return ONLY an array of type Adventure[] in JSON.`;

  // Call OpenAI via helper
  const parsedContent = await getOpenAiResponse({
    model: "gpt-4o-mini",
    messages: [
      { "role": "system", "content": [{ "type": "text", "text": sysPrompt }] },
      { "role": "user", "content": [{ "type": "text", "text": JSON.stringify({ SNIPPETS: snippets }) }] }
    ],
    temperature: 0.4,
    max_completion_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  });
  if (!parsedContent?.adventures && !Array.isArray(parsedContent)) throw new Error("No content returned from OpenAI");
  const adventures: Adventure[] = Array.isArray(parsedContent) ? parsedContent : parsedContent.adventures;
  // Cache response
  try {
    await container.items.create({
      id: openAiCacheId,
      type: 'openAi',
      params: { serpId, hrs, maxResults },
      data: JSON.stringify(adventures),
      createdAt: new Date().toISOString()
    });
  } catch {}
  return adventures;
}
