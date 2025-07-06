import React from "react";
import { useUser } from "../context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function UserAvatar() {
  const { user, loading, logout } = useUser();

  if (loading) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="p-0 rounded-full hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {/* Adding a key here ensures React replaces the component on login/logout, */}
          {/* preventing potential rendering glitches within the Avatar component when its children change. */}
          <Avatar key={user ? user.id : "guest"} className="h-12 w-12">
            {user && user.id !== "guest" ? (
              <>
                <AvatarImage
                  src={user.photoUrl}
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </>
            ) : (
              <AvatarFallback>
                Sign In
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!user || user.id === "guest" ? (
          <>
            <DropdownMenuItem
              onSelect={() => {
                window.location.href = `/auth/google?returnTo=${encodeURIComponent(
                  window.location.href
                )}`;
              }}
            >
              Sign in with Google
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                window.location.href = `/auth/facebook?returnTo=${encodeURIComponent(
                  window.location.href
                )}`;
              }}
            >
              Sign in with Facebook
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel>Signed in as {user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                logout();
              }}
            >
              Sign out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
