"use client";

import { useSession } from "next-auth/react";
import { ProtectedRoute } from "../../components/auth/protected-route";
import { ApiTestComponent } from "../../components/api/api-test";

function Dashboard() {
  const { data: session } = useSession();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">dashboard</h1>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">information</h2>
          <div className="text-sm text-gray-600">
            <p>
              <strong>User:</strong>{" "}
              {session?.user?.name || session?.user?.email}
            </p>
            <p>
              <strong>Email:</strong> {session?.user?.email}
            </p>
            <p>
              <strong>Has Access Token:</strong>{" "}
              {session?.accessToken ? "Yes" : "No"}
            </p>
            <p>
              <strong>Token Expires:</strong>{" "}
              {session?.expiresAt
                ? new Date(session.expiresAt).toLocaleString()
                : "Unknown"}
            </p>
          </div>
        </div>

        {/* API Test Component */}
        <div className="mb-6">
          <ApiTestComponent />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
