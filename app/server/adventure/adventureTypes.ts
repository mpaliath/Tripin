// Adventure type definition for use in OpenAI prompt and server responses
export type Adventure = {
  title: string;
  heroImage: string;
  driveTimeMin: number;
  outline: { name: string; startHint: string; durationMin: number }[];
  tags: string[];
  costUSD: string;
  sources: { title: string; url: string }[];
};
