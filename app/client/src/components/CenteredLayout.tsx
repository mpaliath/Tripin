import React from "react";
import { useNavigate } from "react-router-dom";

export default function CenteredLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div id="centered-layout-root" className="relative min-h-screen w-full flex flex-col">
      <div id="centered-layout-title-wrapper" className="w-full absolute top-0 left-0 flex justify-center pointer-events-none">
          <h1 id="centered-layout-title" className="text-2xl font-bold mt-4 text-center w-full pointer-events-auto">{title}</h1>
      </div>
      <div id="centered-layout-content-outer" className="flex-1 flex flex-col items-center w-full pt-20 overflow-auto">
        <div id="centered-layout-content-inner" className="flex flex-col items-center w-full">
          {children}
        </div>
      </div>
      <button
        id="centered-layout-restart-btn"
        className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs hover:text-gray-500 opacity-40 hover:opacity-80 transition-opacity"
        style={{ pointerEvents: 'auto' }}
        onClick={() => navigate("/")}
        aria-label="Back to start"
      >
        Restart
      </button>
    </div>
  );
}
