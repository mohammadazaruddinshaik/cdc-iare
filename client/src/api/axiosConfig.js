import axios from "axios";

// Create the instance using your environment variable
const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true, 
});

// Response Interceptor: Handles automatic token recovery
api.interceptors.response.use(
    (response) => response, 
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 (Unauthorized) and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
            
                await axios.post(`${import.meta.env.VITE_BASE_URL}/api/refresh`, {}, { withCredentials: true });

                // If successful, retry the original request with the new cookie
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, the session is completely dead
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;