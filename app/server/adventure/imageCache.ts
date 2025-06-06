import { Container } from "@azure/cosmos";
import { fetchImages } from "./google";

export async function getCachedImageLink(query: string, container: Container): Promise<string | null> {
  const { resources } = await container.items
    .query({
      query: "SELECT TOP 1 c.link FROM c WHERE c.type = @type AND c.query = @query",
      parameters: [
        { name: "@type", value: "image" },
        { name: "@query", value: query }
      ]
    })
    .fetchAll();
  if (resources && resources.length > 0) {
    return resources[0].link;
  }
  return null;
}

export async function cacheImageLink(query: string, link: string, container: Container) {
  await container.items.create({
    id: `${query}-${Date.now()}`,
    type: "image",
    query,
    link,
    createdAt: new Date().toISOString()
  });
}

export async function replaceHeroImagesTextWithUrl(adventures: any[], container: Container) {
  for (const adv of adventures) {
    if (adv.heroImage) {
      try {
        let cachedLink = await getCachedImageLink(adv.heroImage, container);
        if (cachedLink) {
          adv.heroImage = cachedLink;
          continue;
        }
        const images = await fetchImages(adv.heroImage);
        if (images && images[0]) {
          adv.heroImage = images[0].link;
          await cacheImageLink(adv.heroImage, images[0].link, container);
        }
      } catch (e) {
        if (
          typeof e === "object" &&
          e !== null &&
          "response" in e &&
          typeof (e as any).response === "object" &&
          (e as any).response !== null &&
          "status" in (e as any).response &&
          (e as any).response.status === 429
        ) {
          console.warn("Rate limit exceeded while fetching image for:", adv.heroImage);
          return;
        }
        console.error("Failed to fetch image from google for:", adv.heroImage, e);
      }
    }
  }
}
