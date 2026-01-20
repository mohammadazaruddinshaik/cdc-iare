import axios from 'axios';

// 1. Setup Instance
const api = axios.create({
  baseURL: import.process.env.VITE_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true, // Required for cookies
});

// Logic to handle multiple 401s at once
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 2. Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Expired) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // Queue this request and wait for the refresh to finish
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        // Attempt to hit the refresh endpoint
        axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true })
          .then(() => {
            processQueue(null);
            resolve(api(originalRequest)); // Retry original request
          })
          .catch((err) => {
            processQueue(err, null);
            window.location.href = '/login?session=expired'; // Session dead
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default api;