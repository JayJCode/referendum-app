import { createContext, useContext, useEffect, useState } from 'react';
import API from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider mounted');
    const loadUser = async () => {
        console.log('Attempting to load user');
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await API.get('/users/me');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

    const login = async (username, password) => {
    try {
        const response = await API.post('/users/token', null, {
        headers: { 
            Authorization: `Basic ${window.btoa(`${username}:${password}`)}` 
        }
        });
        
        if (!response.data.access_token) {
        throw new Error('No token received');
        }
        
        localStorage.setItem('token', response.data.access_token);
        const userResponse = await API.get('/users/me');
        setUser(userResponse.data);
        return true;
    } catch (error) {
        console.error('Login error:', error);
        localStorage.removeItem('token');
        setUser(null);
        throw error;
    }
    };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);