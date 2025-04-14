import { BASE_URL } from "@/config/constants";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

interface ApiResponse<T = any> {
  data: T;
  status: number;
  success: boolean;
  error?: string;
}

export default function useApi() {
    /** 
     * Perform an API request using axios.
     * @param method - The HTTP method (GET, POST, PUT, PATCH, DELETE).
     * @param endpoint - The API endpoint to call.
     * @param data - The data to send with the request (optional).
     * @param headers - Additional headers to include with the request (optional).
     * @returns A promise that resolves to the API response.
     */
  const performRequest = async <T>(
    method: string,
    endpoint: string,
    data?: object,
    headers: object = {}
  ): Promise<ApiResponse<T>> => {
    // Ensure BASE_URL is defined
    if (!BASE_URL) {
      console.error("API Base URL is undefined");
      return {
        data: {} as T,
        status: 500,
        success: false,
        error: "API configuration error: Base URL is undefined"
      };
    }

    const url = `${BASE_URL}${endpoint}`;
    console.log(`Making ${method} request to: ${url}`);
    
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        "Content-Type": method === "GET" ? "application/json" : "multipart/form-data",
        ...headers,
      },
    };

    if (data && method !== "GET") {
      config.data = data;
    } else if (data && method === "GET") {
      config.params = data;
    }

    try {
      const response: AxiosResponse<T> = await axios(config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error: any) {
      console.error(`API ${method} request failed:`, error);
      return {
        data: {} as T,
        status: error.response?.status || 500,
        success: false,
        error: error.response?.data?.detail || error.message || "An unknown error occurred",
      };
    }
  };

  const performGetRequest = <T>(
    endpoint: string,
    params?: object,
    headers: object = {}
  ) => {
    return performRequest<T>("GET", endpoint, params, headers);
  };

  const performPostRequest = <T>(
    endpoint: string,
    data: object,
    headers: object = {}
  ) => {
    return performRequest<T>("POST", endpoint, data, headers);
  };

  const performPutRequest = <T>(
    endpoint: string,
    data: object,
    headers: object = {}
  ) => {
    return performRequest<T>("PUT", endpoint, data, headers);
  };

  const performPatchRequest = <T>(
    endpoint: string,
    data: object,
    headers: object = {}
  ) => {
    return performRequest<T>("PATCH", endpoint, data, headers);
  };

  const performDeleteRequest = <T>(
    endpoint: string,
    data?: object,
    headers: object = {}
  ) => {
    return performRequest<T>("DELETE", endpoint, data, headers);
  };

  return {
    performGetRequest,
    performPostRequest,
    performPutRequest,
    performPatchRequest,
    performDeleteRequest,
    performRequest
  };
}
