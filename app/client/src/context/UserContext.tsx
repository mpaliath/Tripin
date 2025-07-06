import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User } from '../../../shared/types';

/**
 * Defines the shape of the data and functions provided by the UserContext.
 */
interface UserContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// Create the context with an undefined default value to ensure it's used within a provider.
const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * The UserProvider component wraps parts of the app that need access to user data.
 * It handles fetching the user on initial load and provides the logout functionality.
 */
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On initial application load, check with the server to see if a user is logged in.
  useEffect(() => {
    axios.get<User | null>('/auth/user')
      .then(response => setUser(response.data))
      .catch(error => {
        console.error('Failed to fetch user:', error);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // The logout function now handles both server and client state.
  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      // On successful logout from the server, clear the user state on the client.
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return <UserContext.Provider value={{ user, loading, logout }}>{children}</UserContext.Provider>;
};

/**
 * Custom hook to easily consume the UserContext in components.
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};