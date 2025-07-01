import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../../shared/types';

// This User type now comes from the shared location
interface UserContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = {
  id: 'guest',
  name: 'Guest',
	photoUrl: '',
	provider: 'guest',
	providerId: '',
	email: '',
  status: 'guest',
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/auth/user');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData && userData.id ? userData : defaultUser);
        } else {
          setUser(defaultUser);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
        setUser(defaultUser);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST' });
    } finally {
      setUser(defaultUser);
    }
  };

  return <UserContext.Provider value={{ user, loading, logout }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};