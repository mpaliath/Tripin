import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// This User type should match the one on the server
interface User {
  id: string;
  provider: 'google' | 'facebook';
  providerId: string;
  email: string;
  name: string;
  status: 'trial' | 'paid';
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/auth/user');
        const userData = await res.json();
        setUser(res.ok ? userData : null);
      } catch (error) {
        console.error("Failed to fetch user", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const logout = async () => {
    await fetch('/auth/logout', { method: 'POST' });
    setUser(null);
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