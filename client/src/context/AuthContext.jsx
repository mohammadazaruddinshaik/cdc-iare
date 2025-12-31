import React, { createContext, useContext, useState, useEffect } from 'react';
import Loader from '../components/Loader';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Reduced delay to 300ms as requested
        const minLoadTime = new Promise(resolve => setTimeout(resolve, 300));
        
        const apiCall = fetch(`${API_URL}/api/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const [response] = await Promise.all([apiCall, minLoadTime]);

        if (response.ok) {
          const data = await response.json();
          setUser({
            username: data.username || data.rollno,
            role: data.role,
          });
        } else {
          // --- CASE 1: Token missing or Invalid (401/403) ---
          console.warn("Session invalid, redirecting to login.");
          setUser(null);
          // Only redirect if not already at root to avoid infinite loops
          if (window.location.pathname !== '/') {
            window.location.replace('/');
          }
        }
      } catch (error) {
        // --- CASE 2: Network error or Server down ---
        console.error("Session check failed:", error);
        setUser(null);
        // Only redirect if not already at root to avoid infinite loops
        if (window.location.pathname !== '/') {
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
      await fetch(`${API_URL}/api/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      });
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