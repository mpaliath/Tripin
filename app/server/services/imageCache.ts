import crypto from "crypto";
import { storeItem, tryGetItem } from "../utils/cosmosCache";
import { fetchImages } from "../utils/google";

export type ImageDetails = { link: string };

export async function getCachedImageLink(imageId: string): Promise<string | null> {
  const cached = await tryGetItem<ImageDetails>(imageId, "image");
  return cached?.link ?? null;
}

export async function cacheImageLink(imageId: string, link: string, queryString: string) {
  await storeItem(imageId, "image", { link }, { query: queryString });
}

export async function replaceHeroImagesTextWithUrl(adventures: any[]) {
  for (const adv of adventures) {
    if (adv.heroImage) {
      const imageQuery = adv.heroImage;
      const imageId = crypto.createHash("sha256").update(adv.heroImage).digest("hex");
      try {
        let cachedLink = await getCachedImageLink(imageId);
        if (cachedLink) {
          adv.heroImage = cachedLink;
          continue;
        }
        const images = await fetchImages(adv.heroImage);
        if (images && images[0]) {
          adv.heroImage = images[0].link;
          await cacheImageLink(imageId, images[0].link, imageQuery);
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
