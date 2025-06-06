import { useLocation, useNavigate, useParams } from "react-router-dom";
import EditTripPlan from "../components/EditTripPlan";
import { TripPlan as TripPlanType } from "../types";
import Redirect from "./Redirect";

export default function EditPlanRoute() {
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
