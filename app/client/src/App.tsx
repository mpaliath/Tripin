import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import EditTripPlan from "./components/EditTripPlan";
import PickAdventure from "./components/PickAdventure";
import RecommendedTrip from "./components/RecommendedTrip";
import TripPlan from "./components/TripPlan";
import { AdventureCard, TripPlan as TripPlanType } from "./types";

function Redirect({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace: true });
  }, [to, navigate]);
  return null;
}

function RecommendRoute() {
  const { adventureId } = useParams();
  const location = useLocation();
  const cardFromState = location.state?.card as AdventureCard | undefined;
  const navigate = useNavigate();
  const [adventure, setAdventure] = useState<AdventureCard | null>(cardFromState || null);

  useEffect(() => {
    if(!cardFromState) return;
    setAdventure(cardFromState);
  }, [adventureId, adventure]);

  if (!cardFromState) return <Redirect to="/" />;
  if (!adventure) return <p>Loading…</p>;

  return (
    <RecommendedTrip
      card={adventure}
      onRefresh={(newCard) => navigate(`/recommend/${newCard.id}`, { state: { card: newCard } })}
      onChoose={(trip) => navigate(`/plan/${adventure.id}`, { state: { plan: trip } })}
      onFineTune={(trip) => navigate(`/plan/${adventure.id}/edit`, { state: { plan: trip } })}
    />
  );
}

function PlanRoute() {
  const { adventureId } = useParams();
  const location = useLocation();
  const plan = location.state?.plan as TripPlanType | undefined;
  if (!adventureId || !plan) return <Redirect to="/" />;
  return <TripPlan plan={plan} />;
}

function EditPlanRoute() {
  const { adventureId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan as TripPlanType | undefined;
  if (!adventureId || !plan) return <Redirect to="/" />;
  return (
    <EditTripPlan
      plan={plan}
      onSave={(updatedPlan) => navigate(`/plan/${adventureId}`, { state: { plan: updatedPlan } })}
    />
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <Routes>
        <Route
          path="/"
          element={
            <PickAdventure
              onPick={(card) => navigate(`/recommend`, { state: { card } })}
            />
          }
        />
        <Route path="/recommend" element={<RecommendRoute />} />
        <Route path="/plan/:adventureId" element={<PlanRoute />} />
        <Route path="/plan/:adventureId/edit" element={<EditPlanRoute />} />
        <Route path="*" element={<Redirect to="/" />} />
      </Routes>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
