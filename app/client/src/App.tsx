import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import PickAdventure from "./components/PickAdventure";
import EditPlanRoute from "./routes/EditPlanRoute";
import PlanRoute from "./routes/PlanRoute";
import RecommendRoute from "./routes/RecommendRoute";
import Redirect from "./routes/Redirect";

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
