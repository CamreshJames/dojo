// Import necessary React hooks and types, along with crypto utilities and router hook
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { decryptData, encryptData } from '@lib/utils/cryptoUtils';
import { useNavigate } from '@tanstack/react-router';

// Define the shape of the current user object, now including token for API access
interface CurrentUser {
  username: string;
  token: string;
}

// Define the shape of the authentication context
interface AuthContextType {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: CurrentUser) => void;
  logout: () => void;
  // Creative addition: Getter for token to easily access in components for API calls
  getToken: () => string | null;
}

// Create a React context for authentication state
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to manage authentication state and provide it to children
export function AuthProvider({ children }: { children: ReactNode }) {
  // State for storing the current user, initially null
  const [user, setUser] = useState<CurrentUser | null>(null);
  // State for tracking loading status during auth initialization
  const [loading, setLoading] = useState(true);
  // Hook to handle navigation
  const navigate = useNavigate();

  // Retrieve AES key from environment variables for encryption/decryption
  const aesKey = import.meta.env.VITE_AES_KEY;

  // Function to initialize authentication state from localStorage
  const initializeAuth = async () => {
    if (!aesKey) {
      // If no AES key, skip initialization and set loading to false
      setLoading(false);
      return;
    }

    try {
      // Retrieve encrypted user data from localStorage
      const encryptedUser = localStorage.getItem('currentUser');
      if (encryptedUser) {
        // Decrypt and parse user data, then update state
        const decrypted = await decryptData(encryptedUser, aesKey);
        const parsedUser: CurrentUser = JSON.parse(decrypted);
        setUser(parsedUser);
      }
    } catch (error) {
      // Clear localStorage if decryption fails
      localStorage.removeItem('currentUser');
      console.error('Dojo session corrupted:', error);
    } finally {
      // Set loading to false after initialization
      setLoading(false);
    }
  };

  // Run initializeAuth on component mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Login function to store user data and navigate to dashboard
  const login = async (userData: CurrentUser) => {
    if (!aesKey) return;
    try {
      // Encrypt user data and store in localStorage
      const encryptedUser = await encryptData(JSON.stringify(userData), aesKey);
      localStorage.setItem('currentUser', encryptedUser);
      // Update user state
      setUser(userData);
      // Navigate to dashboard
      navigate({ to: '/dashboard' });
    } catch (error) {
      // Log error if encryption/storage fails
      console.error('Dojo login seal failed:', error);
    }
  };

  // Logout function to clear user data and navigate to login page
  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    navigate({ to: '/login' });
  };

  // Helper to get current token for API calls
  const getToken = () => user?.token || null;

  // Context value containing auth state and methods
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    getToken,
  };

  // Provide auth context to child components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to access auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Throw error if hook is used outside AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}