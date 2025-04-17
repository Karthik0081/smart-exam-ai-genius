
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

// Define types
type User = {
  id: string;
  username: string;
  role: 'admin' | 'student';
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, role: 'admin' | 'student') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user database - in a real app this would be an API call to a backend
const mockUsers = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' as const },
  { id: '2', username: 'student', password: 'student123', role: 'student' as const },
];

// Auth Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('smartex-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(
          (u) => u.username === username && u.password === password
        );
        
        if (foundUser) {
          const { password, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('smartex-user', JSON.stringify(userWithoutPassword));
          toast.success('Logged in successfully');
          resolve(true);
        } else {
          toast.error('Invalid username or password');
          resolve(false);
        }
        
        setIsLoading(false);
      }, 1000);
    });
  };

  // Register function
  const register = async (username: string, password: string, role: 'admin' | 'student'): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const userExists = mockUsers.some(u => u.username === username);
        
        if (userExists) {
          toast.error('Username already exists');
          resolve(false);
        } else {
          const newUser = {
            id: String(mockUsers.length + 1),
            username,
            password,
            role,
          };
          
          mockUsers.push(newUser);
          
          const { password: _, ...userWithoutPassword } = newUser;
          setUser(userWithoutPassword);
          localStorage.setItem('smartex-user', JSON.stringify(userWithoutPassword));
          
          toast.success('Registered successfully');
          resolve(true);
        }
        
        setIsLoading(false);
      }, 1000);
    });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('smartex-user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
