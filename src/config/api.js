// Development configuration
export const isDevelopment = import.meta.env.DEV;
export const useLocalBackend = true; // Set to true when you have a backend running

// API configuration
export const API_CONFIG = {
    baseURL: useLocalBackend ? 'http://localhost:5000/api' : null,
    timeout: 10000,
    useMockData: !useLocalBackend,
};

export default API_CONFIG;
