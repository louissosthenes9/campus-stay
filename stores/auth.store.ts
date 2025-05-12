// stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '@/lib/api';

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

interface LoginCredentials {
    username: string;
    password: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      accessToken: null,
      refreshToken: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        const response = await apiRequest<{
          user: User;
          access: string;
          refresh: string;
        }>({
          method: 'POST',
          url: '/auth/login/',
          data: credentials,
        });

        if (response.success) {
          set({
            user: response.data.user,
            accessToken: response.data.access,
            refreshToken: response.data.refresh,
            error: null,
          });
          return true;
        } else {
          set({ error: response.error || 'Login failed' });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        const response = await apiRequest<{ access: string }>({
          method: 'POST',
          url: '/auth/refresh/',
          data: { refresh: refreshToken },
        });

        if (response.success) {
          set({ accessToken: response.data.access });
          return true;
        }
        return false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);