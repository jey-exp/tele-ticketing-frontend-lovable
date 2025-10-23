import { createContext, useContext, useState, ReactNode } from 'react';
import { ROLES, Role } from '@/config/rolesConfig';

interface User {
  name: string;
  role: Role;
  email: string;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  // Mock logged-in user - Change role here to test different views
  const [user, setUser] = useState<User>({
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
