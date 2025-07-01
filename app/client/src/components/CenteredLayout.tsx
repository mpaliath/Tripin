import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function UserAvatar() {
  const { user, loading } = useUser();

  if (loading || !user) {
    return null;
  }

  if (user.id === 'guest') {
    return (
      <Avatar className="h-8 w-8">
        <AvatarFallback title="Guest User">
          {/* Heroicon: user-circle (solid) */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clipRule="evenodd" />
          </svg>
        </AvatarFallback>
      </Avatar>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={user.photoUrl} alt={user.name} />
      <AvatarFallback title={user.name}>{initials}</AvatarFallback>
    </Avatar>
  );
}

export default function CenteredLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div id="centered-layout-root" className="relative min-h-screen w-full flex flex-col">
      <div id="centered-layout-header" className="w-full absolute top-0 left-0 flex justify-center items-center p-4 pointer-events-none">
        <h1 id="centered-layout-title" className="text-2xl font-bold text-center pointer-events-auto">{title}</h1>
        <div className="absolute top-4 right-4 pointer-events-auto">
          <UserAvatar />
        </div>
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
