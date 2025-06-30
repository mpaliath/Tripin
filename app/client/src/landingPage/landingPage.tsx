import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import React from "react";
import { useNavigate } from "react-router-dom";
import ImageCollage from "./imageCollage";
import { useUser } from "../context/UserContext";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();

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
          <CardFooter className="flex flex-col gap-4 justify-center">
            {user ? (
              <>
                <p className="text-sm">Signed in as {user.name}</p>
                <button
                  className="px-6 py-2 bg-gray-600 text-white rounded-md"
                  onClick={logout}
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  className="px-6 py-2 bg-red-600 text-white rounded-md"
                  href="/auth/google"
                >
                  Sign in with Google
                </a>
                <a
                  className="px-6 py-2 bg-blue-800 text-white rounded-md"
                  href="/auth/facebook"
                >
                  Sign in with Facebook
                </a>
              </div>
            )}
            <button
              id="get-started-button"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
              onClick={() => navigate("/")}
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
