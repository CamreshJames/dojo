import { useAuth } from '@lib/contexts/AuthContext';
import { createApiClient } from '@lib/utils/api';
import { useFetch } from './useFetch';

interface UseMutateState {
  loading: boolean;
  error: string | null;
}

interface UseMutateOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useMutate(
  options: UseMutateOptions = {}
) {
  const [state, setState] = useState<UseMutateState>({
    loading: false,
    error: null,
  });

  const { getToken } = useAuth();
  const apiClient = createApiClient(import.meta.env.VITE_HOST_URL);
  const { onSuccess, onError } = options;

  const mutate = async (
    endpoint: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data?: any
  ): Promise<boolean> => {
    setState({ loading: true, error: null });

    const token = getToken();
    if (!token) {
      const error = 'No auth token';
      setState({ loading: false, error });
      onError?.(error);
      return false;
    }

    try {
      let response;
      switch (method) {
        case 'POST':
          response = await apiClient.post(endpoint, data, { token });
          break;
        case 'PUT':
          response = await apiClient.put(endpoint, data, { token });
          break;
        case 'PATCH':
          response = await apiClient.patch(endpoint, data, { token });
          break;
        case 'DELETE':
          response = await apiClient.delete(endpoint, { token });
          break;
      }

      if (response.success) {
        setState({ loading: false, error: null });
        onSuccess?.(response.data);
        return true;
      } else {
        const error = response.error || 'Mutation failed';
        setState({ loading: false, error });
        onError?.(error);
        return false;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Network error';
      setState({ loading: false, error });
      onError?.(error);
      return false;
    }
  };

  // Convenience methods
  const create = (endpoint: string, data: any) => mutate(endpoint, 'POST', data);
  const update = (endpoint: string, data: any) => mutate(endpoint, 'PUT', data);
  const patch = (endpoint: string, data: any) => mutate(endpoint, 'PATCH', data);
  const remove = (endpoint: string) => mutate(endpoint, 'DELETE');

  return {
    ...state,
    mutate,
    create,
    update,
    patch,
    remove,
  };
}

// hooks/useDetailPage.ts - Combined hook for detail pages
import { useState } from 'react';

interface UseDetailPageOptions<T> {
  endpoint: string;
  extractData: (response: any) => T;
  onUpdateSuccess?: (data: T) => void;
}

export function useDetailPage<T>({
  endpoint,
  extractData,
  onUpdateSuccess,
}: UseDetailPageOptions<T>) {
  const [data, setData] = useState<T | null>(null);

  const { loading, error, refetch } = useFetch(endpoint, {
    onSuccess: (response) => {
      const extracted = extractData(response);
      setData(extracted);
    },
  });

  const { patch: patchMutation, loading: updating } = useMutate({
    onSuccess: () => {
      if (data) onUpdateSuccess?.(data);
    },
  });

  const handleFieldUpdate = (field: keyof T) => async (value: any): Promise<boolean> => {
    if (!data) return false;

    // Convert string "true"/"false" to boolean for boolean fields
    const patchedValue = typeof (data as any)[field] === 'boolean' && typeof value === 'string'
      ? value === 'true'
      : value;

    const success = await patchMutation(endpoint, { [field]: patchedValue });

    if (success) {
      setData(prev => prev ? { ...prev, [field]: patchedValue } : null);
    }

    return success;
  };

  return {
    data,
    loading: loading || updating,
    error,
    refetch,
    handleFieldUpdate,
    setData,
  };
}