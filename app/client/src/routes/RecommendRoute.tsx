import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import RecommendedTrip from "../components/RecommendedTrip";
import { Adventure } from "../types";
import Redirect from "./Redirect";

export default function RecommendRoute() {
  const { adventureId } = useParams();
  const location = useLocation();
  const cardFromState = location.state?.card as Adventure | undefined;
  const startTime = location.state?.startTime as string | undefined;
  const duration = location.state?.duration as number | undefined;
  const navigate = useNavigate();
  const [adventure, setAdventure] = useState<Adventure | null>(cardFromState || null);

  useEffect(() => {
    if (!cardFromState) return;
    setAdventure(cardFromState);
  }, [adventureId, adventure]);

  if (!cardFromState) return <Redirect to="/" />;
  if (!adventure) return <p>Loading…</p>;

  return (
    <RecommendedTrip
      card={adventure}
      startTime={startTime ?? "09:00"}
      duration={duration ?? 8}
      onRefresh={(newCard) =>
        navigate(`/recommend/${newCard.id}`, {
          state: { card: newCard, startTime: startTime ?? "09:00", duration: duration ?? 8 }
        })
      }
      onChoose={(trip) =>
        navigate(`/plan/${adventure.id}`, { state: { plan: trip } })
      }
      onFineTune={(trip) =>
        navigate(`/plan/${adventure.id}/edit`, { state: { plan: trip } })
      }
    />
  );
}
