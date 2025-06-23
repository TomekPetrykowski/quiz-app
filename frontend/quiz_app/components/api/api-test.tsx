"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useApi } from "../../hooks/useApi";
import { Button } from "../ui/button";
import { UserProfile } from "../../lib/api-client";

export function ApiTestComponent() {
  const { data: session } = useSession();
  const { getUserProfile, loading, error } = useApi();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  const testUserProfile = async () => {
    await getUserProfile({
      onSuccess: (data) => {
        setProfileData(data);
        console.log("User profile:", data);
      },
      onError: (error) => {
        console.error("Profile API Error:", error.message);
        setProfileData(null);
      },
    });
  };

  if (!session) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">Please sign in to test API calls.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">API Test - User Profile</h3>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testUserProfile} disabled={loading} size="sm">
            {loading ? "Loading..." : "Get User Profile"}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">
              <strong>Error:</strong> {error.message}
            </p>
            <p className="text-red-600 text-xs mt-1">
              Status: {error.status} - {error.statusText}
            </p>
            <p className="text-red-600 text-xs mt-1">
              Endpoint: /v1/auth/profile
            </p>
          </div>
        )}

        {profileData && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm font-medium mb-2">
              User Profile from API:
            </p>
            <pre className="text-xs text-green-700 bg-green-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(profileData, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-xs text-gray-500 border-t pt-3">
          <p>
            <strong>Session Info:</strong>
          </p>
          <p>User: {session.user?.name || session.user?.email}</p>
          <p>
            Token expires:{" "}
            {session.expiresAt
              ? new Date(session.expiresAt).toLocaleString()
              : "Unknown"}
          </p>
          <p>
            API URL:{" "}
            {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}
          </p>
          <p>Using token exchange for api-service client</p>
        </div>
      </div>
    </div>
  );
}
