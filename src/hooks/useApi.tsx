import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Shared state to prevent race conditions with token refreshing
let refreshTokenPromise: Promise<string> | null = null;

const useApi = () => {
  const { logout, setAuthToken } = useContext(AuthContext);

  const handleRefreshToken = async () => {
    try {
      const currentToken = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

      const response = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      if (data.token) {
        setAuthToken(data.token);
        refreshTokenPromise = null; // Clear the promise on success
        return data.token;
      } else {
        throw new Error('No new token received');
      }
    } catch (error) {
      logout(); // Logout user on refresh failure
      refreshTokenPromise = null; // Clear the promise on failure
      throw error;
    }
  };

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const makeRequest = async (token: string | null): Promise<any> => {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api${url}`, { ...options, headers });

      if (response.status !== 401) {
        if (!response.ok) {
          // Handle non-401 errors
          const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
          throw new Error(errorData.message || 'An error occurred');
        }
        // Handle 204 No Content
        if (response.status === 204) {
          return null;
        }
        return response.json();
      }

      // Handle 401 Unauthorized error: token needs refresh
      if (!refreshTokenPromise) {
        refreshTokenPromise = handleRefreshToken();
      }

      try {
        const newToken = await refreshTokenPromise;
        // Retry the original request with the new token
        return makeRequest(newToken);
      } catch (error) {
        // This will be caught if handleRefreshToken throws an error
        throw new Error('Session expired. Please log in again.');
      }
    };

    const initialToken = localStorage.getItem('authToken');
    return makeRequest(initialToken);
  };

  return apiFetch;
};

export default useApi;
