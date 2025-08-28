const useApi = () => {
  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const response = await fetch(`${baseUrl}/api${url}`, { ...options, headers });

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
  };

  return apiFetch;
};

export default useApi;
