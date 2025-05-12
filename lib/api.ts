
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { BASE_URL } from '@/config/constants';
import { useAuthStore } from '@/stores/auth.store';

interface ApiResponse<T = any> {
  data: T;
  status: number;
  success: boolean;
  error?: string;
}

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { status } = error.response || {};
    const { refreshToken, refreshAuth, logout } = useAuthStore.getState();

    // Attempt token refresh on 401 errors
    if (status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true;
      try {
        await refreshAuth();
        return api(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<T> = await api(config);
    return {
      data: response.data,
      status: response.status,
      success: true,
    };
  } catch (error: any) {
    return {
      data: {} as T,
      status: error.response?.status || 500,
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

// Enhanced version of your useApi
export function useApi() {
  const performRequest = async <T>(
    method: string,
    endpoint: string,
    data?: object,
    headers: object = {},
    contentType = 'application/json'
  ): Promise<ApiResponse<T>> => {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      headers: {
        'Content-Type': contentType,
        ...headers,
      },
    };

    if (contentType === 'multipart/form-data' && data) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      config.data = formData;
    } else if (data) {
      config.data = method === 'GET' ? { params: data } : data;
    }

    return apiRequest<T>(config);
  };

  return {
    performGetRequest: <T>(endpoint: string, params?: object, headers?: object) =>
      performRequest<T>('GET', endpoint, params, headers),
    performPostRequest: <T>(
      endpoint: string,
      data?: object,
      headers?: object,
      contentType?: string
    ) => performRequest<T>('POST', endpoint, data, headers, contentType),
    performPutRequest: <T>(endpoint: string, data?: object, headers?: object) =>
      performRequest<T>('PUT', endpoint, data, headers),
    performPatchRequest: <T>(endpoint: string, data?: object, headers?: object) =>
      performRequest<T>('PATCH', endpoint, data, headers),
    performDeleteRequest: <T>(endpoint: string, data?: object, headers?: object) =>
      performRequest<T>('DELETE', endpoint, data, headers),
  };
}