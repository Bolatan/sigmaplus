import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

const useApi = <T>(url: string, options: RequestInit = {}) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const { logout } = useAuth();

  const apiFetch = useCallback(async () => {
    setState((prevState) => ({ ...prevState, loading: true }));
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await fetch(`/api${url}`, { ...options, headers });

      if (response.status === 401) {
        logout();
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred');
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error: any) {
      setState({ data: null, loading: false, error });
    }
  }, [url, options, logout]);

  useEffect(() => {
    apiFetch();
  }, [apiFetch]);

  return state;
};

export default useApi;
