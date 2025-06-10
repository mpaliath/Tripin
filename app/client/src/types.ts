
export interface TripPlan {
  theme: string;
  legs: { time: string; label: string; notes?: string }[];
  packing: string[];
}
