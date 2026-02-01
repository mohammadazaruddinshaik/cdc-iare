import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // We keep 'loading' true initially, but we won't block the render with it
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Direct API call - instant check
        const { data } = await api.get('/api/me');
        
        setUser({
          username: data.username || data.userId || data.rollno, 
          role: data.role,
          sem: data.sem,       
          batch: data.batch,   
          userId: data.userId 
        });

      } catch (error) {
        setUser(null);
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
      await api.post('/api/logout');
    } catch (error) {
      console.error("Logout failed", error);
    }
    setUser(null);
    window.location.replace('/');
  };

  // ⚡️ FIX: Removed the "if (loading) return <Loader />" block.
  // The app now renders children immediately.
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};