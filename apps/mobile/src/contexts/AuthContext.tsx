import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authService } from '../services/auth.service';

interface User {
  id: number;
  nome: string;
  empresaId: number;
  token: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (login: string, senha: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = async (login: string, senha: string) => {
    try {
      const response = await authService.login({ login, senha });
      
      const userData: User = {
        id: response.usuario.id,
        nome: response.usuario.nome,
        empresaId: response.usuario.empresa_id,
        token: response.token,
      };

      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
