import { useState, useEffect, useCallback } from 'react';
import { createApiClient, type ApiResponse } from '@lib/utils/api';

interface ApiHookConfig {
  baseUrl?: string;
  token?: string;
  defaultMethod?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  skip?: boolean;
}

const cache: Record<string, any> = {};

export function useFetch<T>(endpoint: string, config: ApiHookConfig = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!config.skip);
  const [error, setError] = useState<string | null>(null);
  const apiClient = createApiClient(config.baseUrl || '');

  const fetchData = useCallback(async () => {
    if (config.skip) return;
    const cacheKey = `${endpoint}:${config.token || ''}`;
    if (cache[cacheKey]) {
      setData(cache[cacheKey]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const response = await apiClient.get<T>(endpoint, { token: config.token });

    if (response.success) {
      cache[cacheKey] = response.data;
      setData(response.data);
    } else {
      setError(response.error || 'Failed to fetch data');
    }
    setLoading(false);
  }, [endpoint, config.token, config.skip, apiClient]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useMutate<T>(endpoint: string, config: ApiHookConfig = {}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const apiClient = createApiClient(config.baseUrl || '');

  const mutate = useCallback(async (data: Partial<T>, method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE') => {
    setLoading(true);
    setError(null);

    const effectiveMethod = method || config.defaultMethod || 'PATCH';
    let response: ApiResponse<T>;
    switch (effectiveMethod) {
      case 'POST':
        response = await apiClient.post<T>(endpoint, data, { token: config.token });
        break;
      case 'PUT':
        response = await apiClient.put<T>(endpoint, data, { token: config.token });
        break;
      case 'PATCH':
        response = await apiClient.patch<T>(endpoint, data, { token: config.token });
        break;
      case 'DELETE':
        response = await apiClient.delete<T>(endpoint, { token: config.token });
        break;
      default:
        response = await apiClient.patch<T>(endpoint, data, { token: config.token });
    }

    if (!response.success) {
      setError(response.error || 'Mutation failed');
      setLoading(false);
      return false;
    }

    const cacheKey = `${endpoint}:${config.token || ''}`;
    delete cache[cacheKey];
    setLoading(false);
    return true;
  }, [endpoint, config.token, config.defaultMethod, apiClient]);

  return { mutate, loading, error };
}