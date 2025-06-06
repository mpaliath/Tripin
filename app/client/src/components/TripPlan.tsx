import { TripPlan } from "../types";
import CenteredLayout from "./CenteredLayout";

export default function TripPlanView({ plan }: { plan: TripPlan }) {
  return (
    <CenteredLayout title="Your Trip Plan">
      <div id="trip-plan-root" className="w-full max-w-md bg-white rounded-2xl shadow p-4">
        <ul id="trip-plan-legs" className="space-y-1 text-sm text-gray-700 mb-4">
          {plan.legs.map((l) => (
            <li key={l.time} id={`trip-plan-leg-${l.time}`}>
              <span className="font-medium">{l.time}</span> – {l.label}{" "}
              {l.notes && `(${l.notes})`}
            </li>
          ))}
        </ul>
        <h2 id="trip-plan-packing-title" className="font-semibold mb-2">Packing List</h2>
        <ul id="trip-plan-packing-list" className="list-disc list-inside text-sm text-gray-700">
          {plan.packing.map((p) => (
            <li key={p} id={`trip-plan-packing-${p}`}>{p}</li>
          ))}
        </ul>
      </div>
    </CenteredLayout>
  );
}
