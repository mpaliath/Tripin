type Adventure = {
  title: string;           // “Woodland Park Zoo + Green Lake Picnic”
  heroImage: string;       // Unsplash or site image
  driveTimeMin: number;    // round-trip estimate
  outline: ItineraryItem[];// 2–4 stops in order
  tags: string[];          // ["animals","picnic","stroller-friendly"]
  costUSD: string;         // “$30–$60”
  sources: {title: string; url: string;}[];
};

type ItineraryItem = {
  name: string;            // “Woodland Park Zoo”
  startHint: string;       // “Arrive ~11 AM”
  durationMin: number;     // suggested stay length
};
