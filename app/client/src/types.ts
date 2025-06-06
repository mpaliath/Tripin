export interface AdventureCard {
  id: string;
  title: string;
  subtitle: string;
  heroImage: string;
}

export interface TripPlan {
  theme: string;
  legs: { time: string; label: string; notes?: string }[];
  packing: string[];
}
