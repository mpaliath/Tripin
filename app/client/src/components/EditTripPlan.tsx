import { useState } from "react";
import { TripPlan } from "../types";
import CenteredLayout from "./CenteredLayout";

export default function EditTripPlan({ plan: initialPlan, onSave }: { plan: TripPlan; onSave: (plan: TripPlan) => void }) {
  const [plan, setPlan] = useState<TripPlan>(initialPlan);

  // For demonstration, allow editing the theme and packing list only
  return (
    <CenteredLayout title="Edit Your Trip Plan">
      <div id="edit-trip-plan-root" className="w-full max-w-md">
        <div id="edit-trip-plan-plan" className="bg-white rounded-2xl shadow p-4 mb-4">
          <ul id="edit-trip-plan-legs" className="space-y-1 text-sm text-gray-700 mb-2">
            {plan.legs.map((l, idx) => (
              <li key={l.time + idx} id={`edit-trip-plan-leg-${l.time}-${idx}`}>
                <span className="font-medium">{l.time}</span> – {l.label} {l.notes && `(${l.notes})`}
              </li>
            ))}
          </ul>
          <p id="edit-trip-plan-note" className="text-xs text-gray-500">Includes packing list & map links</p>
        </div>
        <div id="edit-trip-plan-buttons" className="grid grid-cols-3 gap-2 mt-6">
          <button
            id="edit-trip-plan-addstop-btn"
            className="bg-yellow-400 rounded-xl py-2 text-sm"
            type="button"
            onClick={() => {/* TODO: Add stop editing logic */}}
          >
            Add Stops
          </button>
          <button
            id="edit-trip-plan-changetime-btn"
            className="bg-gray-200 rounded-xl py-2 text-sm"
            type="button"
            onClick={() => {/* TODO: Add time editing logic */}}
          >
            Change Times
          </button>
          <button
            id="edit-trip-plan-save-btn"
            className="bg-blue-600 text-white rounded-xl py-2 text-sm"
            type="button"
            onClick={() => onSave(plan)}
          >
            Save
          </button>
        </div>
      </div>
    </CenteredLayout>
  );
}
