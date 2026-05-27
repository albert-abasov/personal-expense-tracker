import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType } from '../../types/auth';
import { getCurrentUser, logout as logoutApi } from '../../api/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
      setUser(null);
      window.location.href = '/login';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    logout,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
