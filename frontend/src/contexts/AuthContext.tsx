import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  avatar?: string;
  username?: string;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Инициализация пользователя из localStorage при загрузке
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Проверяем валидность токена через API
          const response = await api.get('/auth/user/');
          const userData = response.data;
          
          // Приводим данные к единому формату
          const mappedUser: User = {
            id: userData.pk || userData.id,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            full_name: userData.full_name || `${userData.first_name} ${userData.last_name}`,
            username: userData.username,
            avatar: userData.avatar
          };
          
          setUser(mappedUser);
        } catch (error) {
          // Токен невалидный, очищаем localStorage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login/', {
        email,
        password,
      });
      
      const { access, refresh, user: userData } = response.data;
      
      // Сохраняем токены в localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Приводим данные к единому формату
      const mappedUser: User = {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        full_name: userData.full_name || `${userData.first_name} ${userData.last_name}`,
        username: userData.username,
        avatar: userData.avatar
      };
      
      // Устанавливаем пользователя в состояние
      setUser(mappedUser);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      await api.post('/auth/register/', userData);
      // После регистрации автоматически логинимся
      await login(userData.email, userData.password);
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.response?.data?.detail || 'Ошибка регистрации');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
