import { Adventure, TripPlan } from "../types";

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60)
    .toString()
    .padStart(2, "0");
  const m = Math.round(min % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}`;
}

export function createTripPlan(adventure: Adventure): TripPlan {
  const start = 9 * 60;
  const end = 17 * 60;
  const available = end - start;
  const total = adventure.outline.reduce((t, o) => t + o.durationMin, 0) || 1;
  const scale = available / total;

  let current = start;
  const legs = adventure.outline.map((item) => {
    const time = minutesToTime(current);
    current += item.durationMin * scale;
    return { time, label: item.name, notes: item.startHint };
  });

  return {
    theme: adventure.title,
    legs,
    packing: [],
  };
}
