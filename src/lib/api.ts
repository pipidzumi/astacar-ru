// API client to replace Supabase functionality
class ApiClient {
  private baseURL: string;

  constructor() {
    // Use the backend server port for API calls
    this.baseURL = 'http://localhost:3001/api';
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Auth methods
  auth = {
    signUp: async (params: { email: string; password: string; phone?: string; role?: string; fullName?: string }) => {
      return this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },

    signInWithPassword: async (params: { email: string; password: string }) => {
      return this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },

    signOut: async () => {
      // For now, just clear local storage
      localStorage.removeItem('auth_token');
      return { error: null };
    },

    getUser: async () => {
      // Mock user session for now
      const token = localStorage.getItem('auth_token');
      if (token) {
        return { 
          data: { 
            user: { 
              id: 'mock-user-id', 
              email: 'user@example.com' 
            } 
          }, 
          error: null 
        };
      }
      return { data: { user: null }, error: null };
    }
  };

  // Database-like interface to match Supabase
  from(table: string) {
    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => this.request(`/${table}?${column}=${value}`),
        order: (column: string, options?: { ascending?: boolean }) => this.request(`/${table}?order=${column}&asc=${options?.ascending !== false}`),
        limit: (count: number) => this.request(`/${table}?limit=${count}`),
        range: (from: number, to: number) => this.request(`/${table}?offset=${from}&limit=${to - from + 1}`),
        single: () => this.request(`/${table}/single`),
      }),
      
      insert: (values: any[]) => ({
        select: () => this.request(`/${table}`, {
          method: 'POST',
          body: JSON.stringify(values),
        }),
        single: () => this.request(`/${table}`, {
          method: 'POST',
          body: JSON.stringify(values[0]),
        }),
      }),
      
      update: (values: any) => ({
        eq: (column: string, value: any) => ({
          select: () => this.request(`/${table}/${value}`, {
            method: 'PUT',
            body: JSON.stringify(values),
          }),
        }),
      }),
      
      delete: () => ({
        eq: (column: string, value: any) => this.request(`/${table}/${value}`, {
          method: 'DELETE',
        }),
      }),
    };
  }

  // Specific methods for the application
  async getListings(filters: any = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/listings${params ? '?' + params : ''}`);
  }

  async createListing(listingData: any) {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  async placeBid(bidData: any) {
    return this.request('/bidding/bids', {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  }

  async createDeposit(depositData: any) {
    return this.request('/bidding/deposits', {
      method: 'POST',
      body: JSON.stringify(depositData),
    });
  }

  async submitQuestion(questionData: any) {
    return this.request('/qa/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async answerQuestion(questionId: string, answerData: any) {
    return this.request(`/qa/questions/${questionId}/answer`, {
      method: 'PUT',
      body: JSON.stringify(answerData),
    });
  }

  async getSettings() {
    return this.request('/settings');
  }

  async seedData() {
    return this.request('/seed-data', {
      method: 'POST',
    });
  }
}

// Create and export the API client instance
export const api = new ApiClient();

// Export a supabase-compatible interface for gradual migration
export const supabase = api;