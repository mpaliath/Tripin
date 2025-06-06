import { Container } from "@azure/cosmos";

export async function getFallbackAdventures(container: Container) {
  const querySpec = {
    query: "SELECT * FROM c WHERE c.type = @type",
    parameters: [{ name: "@type", value: "fallback" }]
  };
  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources.map((item: any) => item.data);
}
