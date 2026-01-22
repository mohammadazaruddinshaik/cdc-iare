import React, { createContext, useContext, useState, useEffect } from 'react';
import Loader from '../components/Loader';
import api from '../api/axiosConfig'; // ⚡️ Using your new Axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Reduced delay to 300ms as requested (Artificial delay for smooth loader)
        const minLoadTime = new Promise(resolve => setTimeout(resolve, 300));
        
        // ⚡️ CHANGE 1: Use 'api.get' instead of fetch
        // This automatically handles credentials, headers, and Token Refresh
        const apiCall = api.get('/api/me');

        const [response] = await Promise.all([apiCall, minLoadTime]);

        // Axios returns the data directly in .data
        const data = response.data;
          
        // --- MAPPING LOGIC ---
        setUser({
          username: data.username || data.userId || data.rollno, 
          role: data.role,
          sem: data.sem,       
          batch: data.batch,   
          userId: data.userId 
        });

      } catch (error) {
        // --- CASE: Session invalid AND Refresh failed ---
        // If we get here, it means the Refresh Token was also expired.
        console.warn("Session check failed or expired:", error);
        setUser(null);
        
        // Only redirect if not already at root
        if (window.location.pathname !== '/') {
            // We use navigate or window location here. 
            // Since this is initialization, standard logic usually allows the protected route wrapper to handle the redirect,
            // but keeping your logic here is safe:
             window.location.replace('/');
        }
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // ⚡️ CHANGE 2: Use 'api.post' for logout
      await api.post('/api/logout');
    } catch (error) {
      console.error("Logout error", error);
    }
    // Clear state and force navigation to root
    setUser(null);
    window.location.replace('/');
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};