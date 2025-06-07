import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import React from "react";
import { useNavigate } from "react-router-dom";
import ImageCollage from "./imageCollage";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div id="landing-page" className="relative min-h-screen flex items-center justify-center">
      <ImageCollage />
      <div
        id="landing-content"
        className="absolute inset-0 flex items-center justify-center z-10"
      >
        <Card
          id="landing-card"
          className="bg-white/70 backdrop-blur-lg shadow-2xl p-12 rounded-xl text-center"
        >
          <CardHeader>
            <h1
              id="landing-title"
              className="text-3xl font-bold text-blue-700 drop-shadow mb-2"
            >
              Plan a trip with ONE click!
            </h1>
          </CardHeader>
          <p
            id="landing-subtitle"
            className="text-lg text-gray-800 mt-4 mb-8"
          >
            Use AI to prepare an outing for your friends and family.
          </p>
          <CardFooter className="flex justify-center">
            <button
              id="get-started-button"
              className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
              onClick={() => navigate("/home")}
            >
              Get Started
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LandingPage;
