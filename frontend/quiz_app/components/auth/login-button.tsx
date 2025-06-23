"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "../ui/button";

export function LoginButton() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("keycloak");
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center gap-4">
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="text-gray-600">Welcome, </span>
          <span className="font-medium">
            {session.user?.name || session.user?.email || "User"}
          </span>
        </div>
        <Button
          onClick={handleSignOut}
          disabled={isLoading}
          variant="outline"
          size="sm">
          {isLoading ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleSignIn} disabled={isLoading} size="sm">
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </div>
  );
}
