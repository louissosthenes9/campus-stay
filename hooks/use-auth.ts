'use client'
import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import useApi from './use-api';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles?: 'student' | 'admin';
  student_profile?: any;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  roles: 'student' | 'admin';
  student_profile?: any;
}

interface GoogleLoginResponse {
  status: 'success' | 'onboarding_required' | 'profile_required';
  refresh?: string;
  access?: string;
  user?: User;
  email?: string;
  first_name?: string;
  last_name?: string;
  google_id?: string;
  temp_token?: string;
  roles?: 'student'  | 'admin';
}

interface OnboardingData {
  temp_token: string;
  roles: 'student';
  first_name?: string;
  last_name?: string;
  student_profile?: any;
}

interface DecodedToken {
  user_id: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  roles?: 'student' | 'admin';
  exp: number;
  student_profile?: any;
  [key: string]: any;
}

export default function useAuth() {
  const { performPostRequest } = useApi();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  // Added this to avoid re-calculations causing re-renders
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Token management
  const getTokens = useCallback((): AuthTokens | null => {
    if (typeof window === 'undefined') return null;
    
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    return access && refresh ? { access, refresh } : null;
  }, []);

  const setTokens = useCallback((tokens: AuthTokens) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    setIsAuthenticated(true);
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
  }, []);

  const authHeaders = useCallback(() => {
    const tokens = getTokens();
    return tokens ? { Authorization: `Bearer ${tokens.access}` } : {};
  }, [getTokens]);

  // Decode user from token
  const getUserFromToken = useCallback((): User | null => {
    try {
      const tokens = getTokens();
      if (!tokens?.access) return null;

      const decoded = jwtDecode<DecodedToken>(tokens.access);

      return {
        id: decoded.user_id,
        username: decoded.username,
        email: decoded.email || '',
        first_name: decoded.first_name || '',
        last_name: decoded.last_name || '',
        roles: decoded.roles,
        student_profile: decoded.student_profile,

      };
    } catch (err) {
      return null;
    }
  }, [getTokens]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const tokens = getTokens();
    if (!tokens?.refresh) return false;

    try {
      const response = await performPostRequest<{ access: string }>('/token/refresh/', {
        refresh: tokens.refresh
      });

      if (response.success && response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        const newUser = getUserFromToken();
        if (newUser) {
          setUser(newUser);
          return true;
        }
      }
    } catch (err) {
      // If refresh fails, log out the user
      clearTokens();
      setUser(null);
    }

    return false;
  }, [getTokens, performPostRequest, getUserFromToken, clearTokens]);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await performPostRequest<{ refresh: string; access: string }>(
        '/users/login/',
        credentials
      );

      if (response.success && response.data) {
        setTokens(response.data);
        const userFromToken = getUserFromToken();
        setUser(userFromToken);
        setLoading(false);
        return true;
      } else {
        setError(response.error || 'Login failed');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('Network error during login');
      setLoading(false);
      return false;
    }
  };

  const register = async (registerData: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await performPostRequest<{ refresh: string; access: string }>(
        '/users/',
        registerData,
        {},
        'application/json'
      );

      if (response.success && response.data) {
        setTokens(response.data);
        const userFromToken = getUserFromToken();
        setUser(userFromToken);
        setLoading(false);
        return true;
      } else {
        setError(response.error || 'Registration failed');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('Network error during registration');
      setLoading(false);
      return false;
    }
  };

  const googleLogin = async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await performPostRequest<GoogleLoginResponse>(
        '/users/google_login/',
        { id_token: token }
      );

      if (response.success) {
        if (response.data.status === 'success' && response.data.access && response.data.refresh) {
          setTokens({ access: response.data.access, refresh: response.data.refresh });
          const userFromToken = getUserFromToken();
          setUser(userFromToken);
        }
        setLoading(false);
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Google login failed');
        setLoading(false);
        return { success: false, error: response.error };
      }
    } catch (err) {
      setError('Network error during Google login');
      setLoading(false);
      return { success: false, error: 'Network error' };
    }
  };

  const completeGoogleOnboarding = async (onboardingData: OnboardingData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await performPostRequest<{ refresh: string; access: string }>(
        '/users/complete_google_onboarding/',
        onboardingData
      );

      if (response.success && response.data) {
        setTokens(response.data);
        const userFromToken = getUserFromToken();
        setUser(userFromToken);
        setLoading(false);
        return true;
      } else {
        setError(response.error || 'Failed to complete onboarding');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('Network error during onboarding');
      setLoading(false);
      return false;
    }
  };

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push('/login'); // Redirect to login page after logout
  }, [clearTokens, router]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      const tokens = getTokens();
      if (tokens) {
        setIsAuthenticated(true);
        const userFromToken = getUserFromToken();
        
        if (userFromToken) {
          setUser(userFromToken);
        } else {
          // Token invalid or expired, try to refresh
          const refreshed = await refreshToken();
          if (!refreshed) {
            clearTokens(); // This will set isAuthenticated to false
          }
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setLoading(false);
      setInitialized(true);
    };

    initializeAuth();
    // We're intentionally not including dependencies here as this should only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Token refresh setup - separated from initialization
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Set up periodic token refresh
    const refreshInterval = setInterval(async () => {
      // Only refresh if we're authenticated
      if (isAuthenticated) {
        await refreshToken();
      }
    }, 15 * 60 * 1000); // Check every 15 minutes
    
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, refreshToken]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    initialized,
    login,
    register,
    googleLogin,
    completeGoogleOnboarding,
    logout,
    refreshToken,
    authHeaders,
  };
}