import { createContext, useContext, useState } from 'react';
import { ROLES } from '@/config/rolesConfig';

const UserContext = createContext(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // Mock logged-in user - Change role here to test different views
  const [user, setUser] = useState({
    name: 'John Doe',
    role: ROLES.CUSTOMER, // Change this to test different roles
    email: 'john.doe@example.com',
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
