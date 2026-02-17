import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { PublicPlayerData } from '../../../shared/types/player';
import { AuthLoginResponse, AuthValidateResponse } from '../../../shared/types/events';

interface AuthContextType {
  user: PublicPlayerData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const [user, setUser] = useState<PublicPlayerData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-validate on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && socket) {
      socket.emit('auth:validate', { token: storedToken }, (response: AuthValidateResponse) => {
        if (response.success && response.player) {
          setToken(storedToken);
          setUser(response.player);
        } else {
          localStorage.removeItem('token');
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [socket]);

  const login = async (username: string): Promise<{ success: boolean; error?: string }> => {
    if (!socket) {
      return { success: false, error: 'Not connected to server' };
    }

    return new Promise((resolve) => {
      socket.emit('auth:login', { username }, (response: AuthLoginResponse) => {
        if (response.success && response.token && response.player) {
          setToken(response.token);
          setUser(response.player);
          localStorage.setItem('token', response.token);
          resolve({ success: true });
        } else {
          resolve({ success: false, error: response.error });
        }
      });
    });
  };

  const logout = () => {
    if (socket) {
      socket.emit('auth:logout');
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
