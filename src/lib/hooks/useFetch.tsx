import { useState, useEffect } from 'react';
import { useAuth } from '@lib/contexts/AuthContext';
import { createApiClient } from '@lib/utils/api';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchOptions {
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useFetch<T = any>(
  endpoint: string,
  options: UseFetchOptions = {}
): UseFetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const { getToken } = useAuth();
  const apiClient = createApiClient(import.meta.env.VITE_HOST_URL);
  const { enabled = true, onSuccess, onError } = options;

  const fetchData = async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    const token = getToken();
    if (!token) {
      const error = 'No auth token';
      setState({ data: null, loading: false, error });
      onError?.(error);
      return;
    }

    try {
      const response = await apiClient.get(endpoint, { token });
      
      if (response.success) {
        setState({ data: response.data, loading: false, error: null });
        onSuccess?.(response.data);
      } else {
        const error = response.error || 'Failed to fetch data';
        setState({ data: null, loading: false, error });
        onError?.(error);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Network error';
      setState({ data: null, loading: false, error });
      onError?.(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, enabled]);

  return {
    ...state,
    refetch: fetchData,
  };
}
