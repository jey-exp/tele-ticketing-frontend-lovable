// src/contexts/UserContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const UserContext = createContext(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        
        // Dr. X's Note: We now read the 'sub' for username and 'authorities' for the role.
        const userData = {
          username: decodedToken.sub,
          // We get the first role from the authorities list inside the token.
          role: decodedToken.authorities && decodedToken.authorities.length > 0 ? decodedToken.authorities[0] : null,
        };
        setUser(userData);
      } catch (error) {
        console.error('Invalid token on load:', error);
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('accessToken', token);
    const decodedToken = jwtDecode(token);
    const userData = {
      username: decodedToken.sub,
      role: decodedToken.authorities && decodedToken.authorities.length > 0 ? decodedToken.authorities[0] : null,
    };
    console.log("login  :" , userData);
    
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};