import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import RecommendedTrip from "../components/RecommendedTrip";
import { AdventureCard } from "../types";
import Redirect from "./Redirect";

export default function RecommendRoute() {
  const { adventureId } = useParams();
  const location = useLocation();
  const cardFromState = location.state?.card as AdventureCard | undefined;
  const navigate = useNavigate();
  const [adventure, setAdventure] = useState<AdventureCard | null>(cardFromState || null);

  useEffect(() => {
    if (!cardFromState) return;
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
