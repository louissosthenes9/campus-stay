import { useState, useEffect, useCallback } from 'react';
import {jwtDecode} from 'jwt-decode';
import useApi from './use-api';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles?: 'student' | 'broker' | 'admin';
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
  roles: 'student' | 'broker' | 'admin';
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
  roles?: 'student' | 'broker' | 'admin';
}

interface OnboardingData {
  temp_token: string;
  roles: 'student' | 'broker';
  first_name?: string;
  last_name?: string;
  student_profile?: any;
  broker_profile?: any;
}

interface DecodedToken {
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

export default function useAuth() {
  const { performPostRequest } = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Token management
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
      console.log('Decoded token:', decoded);

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
        setUser(newUser);
        return true;
      }
    } catch (err) {}

    return false;
  }, [getTokens, performPostRequest, getUserFromToken]);

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
        if (response.data.status === 'success') {
          if (response.data.access && response.data.refresh) {
            setTokens({ access: response.data.access, refresh: response.data.refresh });
            const userFromToken = getUserFromToken();
            setUser(userFromToken);
          }
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
  }, [clearTokens]);

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userFromToken = getUserFromToken();
        setUser(userFromToken);
      }
      setLoading(false);
      setInitialized(true);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
