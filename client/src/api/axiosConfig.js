import axios from 'axios';

/**
 * API Instance
 * Configured for a 180-minute backend cookie session.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true, 
});

/**
 * Response Interceptor
 * If the 180-minute cookie expires, the backend returns a 401.
 * This interceptor catches that and redirects the user immediately.
 */
api.interceptors.response.use(
    (response) => response, 
    (error) => {
        // Logical check for Session Expiration
        if (error.response?.status === 401) {
            console.warn("Session expired. Redirecting to login...");
            
            // Direct "kick" to login page without touching local storage
            window.location.href = '/login'; 
        }

        return Promise.reject(error);
    }
);

export default api;