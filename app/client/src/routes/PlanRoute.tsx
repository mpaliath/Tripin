import { useLocation, useParams } from "react-router-dom";
import TripPlan from "../components/TripPlan";
import { TripPlan as TripPlanType } from "../types";
import Redirect from "./Redirect";

export default function PlanRoute() {
  const { adventureId } = useParams();
  const location = useLocation();
  const plan = location.state?.plan as TripPlanType | undefined;
  if (!adventureId || !plan) return <Redirect to="/" />;
  return <TripPlan plan={plan} />;
}
