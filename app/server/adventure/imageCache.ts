import { Container } from "@azure/cosmos";
import crypto from "crypto";
import { fetchImages } from "./google";

export async function getCachedImageLink(imageId: string, container: Container): Promise<string | null> {
  try {
    const { resource } = await container.item(imageId, "image").read();
    return resource?.link ?? null;
  } catch {
    return null;
  }
}

export async function cacheImageLink(imageId: string, link: string, queryString: string, container: Container) {
  await container.items.upsert({
    id: imageId,
    type: "image",
    query: queryString,
    link,
    createdAt: new Date().toISOString()
  });
}

export async function replaceHeroImagesTextWithUrl(adventures: any[], container: Container) {
  for (const adv of adventures) {
    if (adv.heroImage) {
      const imageQuery = adv.heroImage;
      const imageId = crypto.createHash("sha256").update(adv.heroImage).digest("hex");
      try {
        let cachedLink = await getCachedImageLink(imageId, container);
        if (cachedLink) {
          adv.heroImage = cachedLink;
          continue;
        }
        const images = await fetchImages(adv.heroImage);
        if (images && images[0]) {
          adv.heroImage = images[0].link;
          await cacheImageLink(imageId, images[0].link, imageQuery, container);
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
