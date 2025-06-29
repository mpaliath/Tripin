import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function UserAvatar() {
  const { user, loading } = useUser();

  if (loading || !user) {
    return null;
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
