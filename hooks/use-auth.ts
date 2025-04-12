import { useState, useEffect, useCallback } from 'react';
import useApi from './use-api';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type?: 'student' | 'broker' | 'admin';
  student_profile?: any;
  broker_profile?: any;
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
  user_type: 'student' | 'broker' | 'admin';
  student_profile?: any;
  broker_profile?: any;
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
  user_type?: 'student' | 'broker' | 'admin';
}

interface OnboardingData {
  temp_token: string;
  user_type: 'student' | 'broker';
  first_name?: string;
  last_name?: string;
  student_profile?: any;
  broker_profile?: any;
}

export default function useAuth() {
  const { performGetRequest, performPostRequest } = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Token management functions
  const getTokens = useCallback((): AuthTokens | null => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    return access && refresh ? { access, refresh } : null;
  }, []);

  const setTokens = useCallback((tokens: AuthTokens) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!getTokens();
  }, [getTokens]);

  // Auth header creator
  const authHeaders = useCallback(() => {
    const tokens = getTokens();
    return tokens ? { 'Authorization': `Bearer ${tokens.access}` } : {};
  }, [getTokens]);

  // User fetching
  const fetchCurrentUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const response = await performGetRequest<User>('/users/me/', {}, authHeaders());

    if (response.success) {
      setUser(response.data);
    } else {
      // If token might be expired, try refreshing
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          // Try fetching user again with new token
          const retryResponse = await performGetRequest<User>('/users/me/', {}, authHeaders());
          if (retryResponse.success) {
            setUser(retryResponse.data);
          } else {
            setUser(null);
            setError('Session expired. Please login again.');
            clearTokens();
          }
        } else {
          setUser(null);
          clearTokens();
        }
      } else {
        setError(response.error || 'Failed to fetch user data');
        setUser(null);
      }
    }

    setLoading(false);
  }, [performGetRequest, authHeaders, isAuthenticated, clearTokens]);

  // Token refresh
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const tokens = getTokens();
    if (!tokens?.refresh) return false;

    const response = await performPostRequest<{ access: string }>('/token/refresh/', {
      refresh: tokens.refresh
    });

    if (response.success && response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      return true;
    }
    
    return false;
  }, [getTokens, performPostRequest]);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    const response = await performPostRequest<{ refresh: string; access: string; user: User }>(
      '/users/login/',
      credentials
    );

    if (response.success) {
      setTokens({
        access: response.data.access,
        refresh: response.data.refresh
      });
      setUser(response.data.user);
      setLoading(false);
      return true;
    } else {
      setError(response.error || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  // Register function
  const register = async (registerData: RegisterData) => {
    setLoading(true);
    setError(null);

    const response = await performPostRequest<{ refresh: string; access: string; user: User }>(
      '/users/',
      registerData
    );

    if (response.success) {
      setTokens({
        access: response.data.access,
        refresh: response.data.refresh
      });
      setUser(response.data.user);
      setLoading(false);
      return true;
    } else {
      setError(response.error || 'Registration failed');
      setLoading(false);
      return false;
    }
  };

  // Google login function
  const googleLogin = async (token: string) => {
    setLoading(true);
    setError(null);

    const response = await performPostRequest<GoogleLoginResponse>(
      '/users/google_login/',
      { token }
    );

    if (response.success) {
      if (response.data.status === 'success') {
        // User is authenticated
        if (response.data.access && response.data.refresh && response.data.user) {
          setTokens({
            access: response.data.access,
            refresh: response.data.refresh
          });
          setUser(response.data.user);
        }
        setLoading(false);
        return { success: true, data: response.data };
      } 
      // User needs to complete onboarding or profile
      setLoading(false);
      return { success: true, data: response.data };
    } else {
      setError(response.error || 'Google login failed');
      setLoading(false);
      return { success: false, error: response.error };
    }
  };

  // Complete Google onboarding
  const completeGoogleOnboarding = async (onboardingData: OnboardingData) => {
    setLoading(true);
    setError(null);

    const response = await performPostRequest<{ refresh: string; access: string; user: User }>(
      '/users/complete_google_onboarding/',
      onboardingData
    );

    if (response.success) {
      setTokens({
        access: response.data.access,
        refresh: response.data.refresh
      });
      setUser(response.data.user);
      setLoading(false);
      return true;
    } else {
      setError(response.error || 'Failed to complete onboarding');
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, [clearTokens]);

  // Check authentication status on mount
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    googleLogin,
    completeGoogleOnboarding,
    logout,
    fetchCurrentUser,
    authHeaders,
    refreshToken,
  };
}
