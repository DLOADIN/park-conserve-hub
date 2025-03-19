
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

export type UserRole = 'visitor' | 'admin' | 'park-staff' | 'government' | 'finance' | 'auditor';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  park?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock authentication
      // In a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let mockUser: User;
      
      if (email === 'admin@ecopark.com') {
        mockUser = {
          id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@ecopark.com',
          role: 'admin',
          park: 'Yellowstone'
        };
      } else if (email === 'parkstaff@ecopark.com') {
        mockUser = {
          id: '2',
          firstName: 'Park',
          lastName: 'Staff',
          email: 'parkstaff@ecopark.com',
          role: 'park-staff',
          park: 'Yellowstone'
        };
      } else if (email === 'government@ecopark.com') {
        mockUser = {
          id: '3',
          firstName: 'Government',
          lastName: 'Agent',
          email: 'government@ecopark.com',
          role: 'government'
        };
      } else if (email === 'finance@ecopark.com') {
        mockUser = {
          id: '4',
          firstName: 'Finance',
          lastName: 'Officer',
          email: 'finance@ecopark.com',
          role: 'finance',
          park: 'Yellowstone'
        };
      } else if (email === 'auditor@ecopark.com') {
        mockUser = {
          id: '5',
          firstName: 'Auditor',
          lastName: 'Officer',
          email: 'auditor@ecopark.com',
          role: 'auditor'
        };
      } else {
        throw new Error('Invalid credentials');
      }
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      toast.success('Login successful');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
