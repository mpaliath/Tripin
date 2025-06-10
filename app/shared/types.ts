// Shared types for both client and server

export type Location = {
  name: string;
  latitude: number;
  longitude: number;
};

// Add id to Adventure for client-side usage
export interface Adventure {
  id: string;
  title: string;
  heroImage: string;
  driveTimeMin: number;
  outline: { name: string; start: Location; end: Location; startHint: string; durationMin: number }[];
  tags: string[];
  costUSD: string;
  sources: { title: string; url: string }[];
}
