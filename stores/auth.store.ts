import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import useApi from '../hooks/use-api';
import React from 'react';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles?: 'student' | 'broker' | 'admin';
  student_profile?: any;
  broker_profile?: any;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  roles: 'student' | 'broker' | 'admin';
  student_profile?: any;
  broker_profile?: any;
}

export interface GoogleLoginResponse {
  status: 'success' | 'onboarding_required' | 'profile_required';
  refresh?: string;
  access?: string;
  user?: User;
  email?: string;
  first_name?: string;
  last_name?: string;
  google_id?: string;
  temp_token?: string;
  roles?: 'student' | 'broker' | 'admin';
}

export interface OnboardingData {
  temp_token: string;
  roles: 'student' | 'broker';
  first_name?: string;
  last_name?: string;
  student_profile?: any;
  broker_profile?: any;
}

export interface DecodedToken {
  user_id: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  roles?: 'student' | 'broker' | 'admin';
  exp: number;
  student_profile?: any;
  broker_profile?: any;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Methods
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  
  // Auth actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (registerData: RegisterData) => Promise<boolean>;
  googleLogin: (token: string) => Promise<{ success: boolean; data?: GoogleLoginResponse; error?: string }>;
  completeGoogleOnboarding: (onboardingData: OnboardingData) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  
  // Helper methods
  isAuthenticated: () => boolean;
  authHeaders: () => { Authorization?: string };
  getUserFromToken: () => User | null;
}

// Helper functions
const getUserFromToken = (access: string): User | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(access);
    return {
      id: decoded.user_id,
      username: decoded.username,
      email: decoded.email || '',
      first_name: decoded.first_name || '',
      last_name: decoded.last_name || '',
      roles: decoded.roles,
      student_profile: decoded.student_profile,
      broker_profile: decoded.broker_profile,
    };
  } catch (err) {
    return null;
  }
};

// Create the Zustand store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Initialize API here to avoid circular dependencies
      const api = useApi();
      
      return {
        user: null,
        tokens: null,
        loading: true,
        error: null,
        initialized: false,
        
        // State setters
        setUser: (user) => set({ user }),
        setTokens: (tokens) => set({ tokens }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        setInitialized: (initialized) => set({ initialized }),
        
        // Auth operations
        login: async (credentials) => {
          set({ loading: true, error: null });
          
          try {
            const response = await api.performPostRequest<{ refresh: string; access: string }>(
              '/users/login/',
              credentials
            );
            
            if (response.success && response.data) {
              const tokens = { access: response.data.access, refresh: response.data.refresh };
              const user = getUserFromToken(tokens.access);
              set({ tokens, user, loading: false });
              return true;
            } else {
              set({ error: response.error || 'Login failed', loading: false });
              return false;
            }
          } catch (err) {
            set({ error: 'Network error during login', loading: false });
            return false;
          }
        },
        
        register: async (registerData) => {
          set({ loading: true, error: null });
          
          try {
            const response = await api.performPostRequest<{ refresh: string; access: string }>(
              '/users/',
              registerData,
              {},
              'application/json'
            );
            
            if (response.success && response.data) {
              const tokens = { access: response.data.access, refresh: response.data.refresh };
              const user = getUserFromToken(tokens.access);
              set({ tokens, user, loading: false });
              return true;
            } else {
              set({ error: response.error || 'Registration failed', loading: false });
              return false;
            }
          } catch (err) {
            set({ error: 'Network error during registration', loading: false });
            return false;
          }
        },
        
        googleLogin: async (token) => {
          set({ loading: true, error: null });
          
          try {
            const response = await api.performPostRequest<GoogleLoginResponse>(
              '/users/google_login/', 
              { id_token: token }
            );
            
            if (response.success) {
              if (response.data.status === 'success' && response.data.access && response.data.refresh) {
                const tokens = { access: response.data.access, refresh: response.data.refresh };
                const user = getUserFromToken(tokens.access);
                set({ tokens, user });
              }
              set({ loading: false });
              return { success: true, data: response.data };
            } else {
              set({ error: response.error || 'Google login failed', loading: false });
              return { success: false, error: response.error };
            }
          } catch (err) {
            set({ error: 'Network error during Google login', loading: false });
            return { success: false, error: 'Network error' };
          }
        },
        
        completeGoogleOnboarding: async (onboardingData) => {
          set({ loading: true, error: null });
          
          try {
            const response = await api.performPostRequest<{ refresh: string; access: string }>(
              '/users/complete_google_onboarding/',
              onboardingData
            );
            
            if (response.success && response.data) {
              const tokens = { access: response.data.access, refresh: response.data.refresh };
              const user = getUserFromToken(tokens.access);
              set({ tokens, user, loading: false });
              return true;
            } else {
              set({ error: response.error || 'Failed to complete onboarding', loading: false });
              return false;
            }
          } catch (err) {
            set({ error: 'Network error during onboarding', loading: false });
            return false;
          }
        },
        
        logout: () => {
          // Clear tokens and user from state
          set({ tokens: null, user: null });
          
          // Optionally, you could also call a logout endpoint here if needed
          // api.performPostRequest('/users/logout/', {});
        },
        
        refreshToken: async () => {
          const tokens = get().tokens;
          if (!tokens?.refresh) return false;
          
          try {
            const response = await api.performPostRequest<{ access: string }>(
              '/token/refresh/',
              { refresh: tokens.refresh }
            );
            
            if (response.success && response.data.access) {
              const newTokens = { ...tokens, access: response.data.access };
              const user = getUserFromToken(newTokens.access);
              set({ tokens: newTokens, user });
              return true;
            }
          } catch (err) {}
          
          return false;
        },
        
        // Helper methods
        isAuthenticated: () => {
          const tokens = get().tokens;
          return !!tokens?.access && !!tokens?.refresh;
        },
        
        authHeaders: () => {
          const tokens = get().tokens;
          return tokens ? { Authorization: `Bearer ${tokens.access}` } : {};
        },
        
        getUserFromToken: () => {
          const tokens = get().tokens;
          return tokens?.access ? getUserFromToken(tokens.access) : null;
        },
      };
    },
    {
      name: 'auth-storage', // name for the storage
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({ tokens: state.tokens }), // Only persist tokens to localStorage
    }
  )
);

// Create a hook to initialize auth on app start
export const useAuthInit = () => {
  const { tokens, setUser, setLoading, setInitialized, getUserFromToken } = useAuthStore();
  
  React.useEffect(() => {
    // On app initialization, check if we have tokens and set the user if valid
    if (tokens?.access) {
      const user = getUserFromToken();
      setUser(user);
    }
    
    setLoading(false);
    setInitialized(true);
  }, []);
};

export default useAuthStore;