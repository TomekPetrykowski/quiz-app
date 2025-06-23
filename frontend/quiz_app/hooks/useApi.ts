"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiClient, ApiError, UserProfile } from "../lib/api-client";

export interface UseApiOptions<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export function useApi() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      options?: UseApiOptions<T>
    ): Promise<T | null> => {
      if (!session) {
        const error = new ApiError(401, "Unauthorized", "No active session");
        setError(error);
        options?.onError?.(error);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError(
                500,
                "Internal Error",
                "An unexpected error occurred"
              );

        setError(apiError);
        options?.onError?.(apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  const get = useCallback(
    <T>(endpoint: string, options?: UseApiOptions<T>) => {
      return execute(() => apiClient.get<T>(endpoint), options);
    },
    [execute]
  );

  const post = useCallback(
    <T>(endpoint: string, data?: unknown, options?: UseApiOptions<T>) => {
      return execute(() => apiClient.post<T>(endpoint, data), options);
    },
    [execute]
  );

  const getUserProfile = useCallback(
    (options?: UseApiOptions<UserProfile>) => {
      return execute(() => apiClient.getUserProfile(), options);
    },
    [execute]
  );

  return {
    loading,
    error,
    get,
    post,
    getUserProfile,
    execute,
  };
}

// Hook for making a single API call on mount
export function useApiCall<T>(apiCall: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const { execute } = useApi();

  const refetch = useCallback(() => {
    setLoading(true);
    execute(apiCall, {
      onSuccess: (result) => {
        setData(result);
        setLoading(false);
      },
      onError: (err) => {
        setError(err);
        setLoading(false);
      },
    });
  }, [execute, apiCall]);

  // Effect to run on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
