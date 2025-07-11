import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUserPoints: (points: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers = [
  {
    id: '1',
    email: 'admin@gmail.com',
    name: 'Admin',
    isAdmin: true,
    points: 0,
    createdAt: new Date(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('smartRecycleUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check admin credentials
    if (credentials.email === 'admin@gmail.com' && credentials.password === 'ADMIN') {
      const user: User = {
        id: 'admin',
        email: credentials.email,
        name: 'Admin',
        isAdmin: true,
        points: 0,
        createdAt: new Date(),
      };
      
      localStorage.setItem('smartRecycleUser', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
    
    // Check registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find((u: any) => 
      u.email === credentials.email && u.password === credentials.password
    );
    
    if (user) {
      const authUser: User = {
        ...user,
        isAdmin: false,
        createdAt: new Date(user.createdAt),
      };
      
      localStorage.setItem('smartRecycleUser', JSON.stringify(authUser));
      setAuthState({
        user: authUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return false;
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Check if user already exists
    if (registeredUsers.some((u: any) => u.email === data.email)) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
    
    const newUser = {
      id: Date.now().toString(),
      ...data,
      points: 0,
      createdAt: new Date(),
    };
    
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return true;
  };

  const logout = () => {
    localStorage.removeItem('smartRecycleUser');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUserPoints = (points: number) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, points };
      setAuthState(prev => ({ ...prev, user: updatedUser }));
      localStorage.setItem('smartRecycleUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout,
      updateUserPoints,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};