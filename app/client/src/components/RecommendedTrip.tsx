import { useEffect, useState } from "react";
import { Adventure, TripPlan } from "../types";
import { createTripPlan } from "../lib/createTripPlan";
import CenteredLayout from "./CenteredLayout";

export default function RecommendedTrip({
  card,
  startTime,
  duration,
  onRefresh,
  onChoose,
  onFineTune
}: {
  card: Adventure;
  startTime: string;
  duration: number;
  onRefresh: (c: Adventure) => void;
  onChoose: (trip: TripPlan) => void;
  onFineTune: (trip: TripPlan) => void;
}) {
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPlan(createTripPlan(card, duration, startTime));
    setLoading(false);
  }, [card, duration, startTime]);

  if (loading || !plan) return <p>Loading recommendation…</p>;

  return (
    <CenteredLayout title="Your Recommended Day Trip">
      <div id="recommended-trip-root" className="w-full max-w-md">
        <div id="recommended-trip-plan" className="bg-white rounded-2xl shadow p-4 mb-4">
          <h2 id="recommended-trip-title" className="font-semibold mb-2">{card.title}</h2>
          <ul id="recommended-trip-legs" className="space-y-1 text-sm text-gray-700 mb-2">
            {plan.legs.map((l) => (
              <li key={l.time} id={`recommended-trip-leg-${l.time}`}> 
                <span className="font-medium">{l.time}</span> – {l.label}
              </li>
            ))}
          </ul>
          <p id="recommended-trip-note" className="text-xs text-gray-500">Includes packing list & map links</p>
        </div>
        <div id="recommended-trip-buttons" className="grid grid-cols-3 gap-2 mt-20">
          <button id="recommended-trip-refresh-btn"
            className="bg-gray-200 rounded-xl py-2 text-sm"
            onClick={() => onRefresh(card)}
          >
            Refresh
          </button>
          <button id="recommended-trip-choose-btn"
            className="bg-blue-600 text-white rounded-xl py-2 text-sm"
            onClick={() => onChoose(plan)}
          >
            Choose
          </button>
          <button id="recommended-trip-finetune-btn"
            className="bg-yellow-400 rounded-xl py-2 text-sm"
            onClick={() => onFineTune(plan)}
            type="button"
          >
            Fine‑Tune
          </button>
        </div>
      </div>
    </CenteredLayout>
  );
}