export interface Adventure {
  id: string;
  title: string;
  heroImage: string;
  driveTimeMin: number;
  outline: { name: string; startHint: string; durationMin: number }[];
  tags: string[];
  costUSD: string;
  sources: { title: string; url: string }[];
}

export type AdventureCard = Adventure;

export interface TripPlan {
  theme: string;
  legs: { time: string; label: string; notes?: string }[];
  packing: string[];
}
