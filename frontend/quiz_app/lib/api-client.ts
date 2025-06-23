import { getSession } from "next-auth/react";

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  username?: string;
  [key: string]: unknown;
}

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  }

  // Exchange frontend token for api-service token
  private async getApiServiceToken(): Promise<string> {
    const session = await getSession();

    if (!session?.accessToken) {
      throw new ApiError(401, "Unauthorized", "No access token available");
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
            client_id: process.env.NEXT_PUBLIC_API_SERVICE_CLIENT_ID!,
            client_secret: process.env.NEXT_PUBLIC_API_SERVICE_CLIENT_SECRET!,
            subject_token: session.accessToken,
            subject_token_type: "urn:ietf:params:oauth:token-type:access_token",
            audience: "api-service",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Token exchange error:", errorData);
        throw new Error(
          `Token exchange failed: ${response.status} - ${errorData}`
        );
      }

      const tokenData = await response.json();
      return tokenData.access_token;
    } catch (error) {
      console.error("Token exchange failed:", error);
      throw new ApiError(
        401,
        "Unauthorized",
        "Failed to get API service token"
      );
    }
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const apiToken = await this.getApiServiceToken();

    return {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {}
      throw new ApiError(response.status, response.statusText, errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text() as T;
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // Test endpoint for user profile
  async getUserProfile(): Promise<UserProfile> {
    return this.get("/v1/auth/profile");
  }
}

export const apiClient = new ApiClient();
