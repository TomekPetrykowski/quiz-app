"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { LoginButton } from "./login-button";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access this page.
          </p>
          {fallback || <LoginButton />}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
