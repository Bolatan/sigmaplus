import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Assuming AuthContext is exported

const useApi = () => {
  const { logout, setAuthToken } = useContext(AuthContext);

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    let token = localStorage.getItem('authToken');

    const makeRequest = async () => {
      const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api${url}`, { ...options, headers });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired, try to refresh it
          try {
            const newToken = await refreshToken();
            token = newToken; // Update token for the retry
            // Retry the original request with the new token
            return makeRequest();
          } catch (refreshError) {
            // If refresh fails, logout the user
            logout();
            throw new Error('Session expired. Please log in again.');
          }
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred');
      }
      return response.json();
    };

    return makeRequest();
  };

  const refreshToken = async () => {
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
      setAuthToken(data.token); // Update token in context and local storage
      return data.token;
    } else {
      throw new Error('No new token received');
    }
  };

  return apiFetch;
};

export default useApi;
