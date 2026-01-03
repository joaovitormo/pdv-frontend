import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../api/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextData {
  user: User | null;
  signIn: (credentials: { username: string; password: string }) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega usuário do localStorage ao iniciar
  useEffect(() => {
    const token = localStorage.getItem('@PDV:token');
    const userData = localStorage.getItem('@PDV:user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        localStorage.removeItem('@PDV:token');
        localStorage.removeItem('@PDV:user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (credentials: { username: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', credentials);
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('@PDV:token', access_token);
      localStorage.setItem('@PDV:user', JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('@PDV:token');
    localStorage.removeItem('@PDV:user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated: !!user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};