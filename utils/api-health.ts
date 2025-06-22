import axios from 'axios';
import { BASE_URL } from '@/config/constants';

export interface HealthCheckResult {
  isHealthy: boolean;
  status: number;
  statusText: string;
  error?: string;
  responseTime?: number;
}

export async function checkApiHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  if (!BASE_URL) {
    return {
      isHealthy: false,
      status: 0,
      statusText: 'Not Configured',
      error: 'API base URL is not configured',
    };
  }

  try {
    const response = await axios({
      method: 'GET',
      url: `${BASE_URL}/health/`,
      timeout: 5000, // 5 seconds timeout
      validateStatus: () => true, // Don't throw on non-2xx status
    });

    const responseTime = Date.now() - startTime;
    
    return {
      isHealthy: response.status === 200,
      status: response.status,
      statusText: response.statusText,
      responseTime,
    };
  } catch (error: any) {
    return {
      isHealthy: false,
      status: error.response?.status || 0,
      statusText: error.response?.statusText || 'Network Error',
      error: error.message,
      responseTime: Date.now() - startTime,
    };
  }
}

export async function checkApiEndpoint(endpoint: string): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  if (!BASE_URL) {
    return {
      isHealthy: false,
      status: 0,
      statusText: 'Not Configured',
      error: 'API base URL is not configured',
    };
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  try {
    const response = await axios({
      method: 'GET',
      url,
      timeout: 10000, // 10 seconds timeout
      validateStatus: () => true, // Don't throw on non-2xx status
    });

    const responseTime = Date.now() - startTime;
    
    return {
      isHealthy: response.status < 400,
      status: response.status,
      statusText: response.statusText,
      responseTime,
    };
  } catch (error: any) {
    return {
      isHealthy: false,
      status: error.response?.status || 0,
      statusText: error.response?.statusText || 'Network Error',
      error: error.message,
      responseTime: Date.now() - startTime,
    };
  }
}
