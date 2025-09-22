// @lib/utils/api.ts
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  token?: string;
  baseUrl?: string;
}

interface ApiResponse<T = any> {
  data: T | null;
  success: boolean;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  private buildUrl(endpoint: string, baseUrl?: string): string {
    const base = baseUrl || this.baseUrl;
    if (endpoint.startsWith('http')) return endpoint;
    return `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  private buildHeaders(config: RequestConfig): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...config.headers };
    
    if (config.token) {
      headers.Authorization = `Bearer ${config.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch {
      data = null;
    }

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: data?.message || data?.error || `HTTP ${response.status}`,
        message: data?.message || `Request failed with status ${response.status}`,
      };
    }

    return {
      success: true,
      data,
      message: data?.message,
    };
  }

  async request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, config.baseUrl);
      const headers = this.buildHeaders(config);
      
      const requestConfig: RequestInit = {
        method: config.method || 'GET',
        headers,
      };

      if (config.body && config.method !== 'GET') {
        requestConfig.body = typeof config.body === 'string' 
          ? config.body 
          : JSON.stringify(config.body);
      }

      const response = await fetch(url, requestConfig);
      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        message: 'Request failed',
      };
    }
  }

  async get<T = any>(endpoint: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async patch<T = any>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  async delete<T = any>(endpoint: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export const createApiClient = (baseUrl?: string, defaultHeaders?: Record<string, string>) => 
  new ApiClient(baseUrl, defaultHeaders);

export default ApiClient;