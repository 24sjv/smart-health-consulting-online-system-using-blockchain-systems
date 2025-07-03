/**
 * API Wrapper for Healthcare Application
 */

const API = {
  // Base URL for API endpoints
  baseUrl: '/api',

  // Helper method for making fetch requests
  async request(url, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    async login(credentials) {
      return API.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    },
    
    async register(userData) {
      return API.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    }
  },

  // Assistant API
  assistant: {
    async chat(message, role = 'user', context = {}) {
      return API.request('/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message, role, context })
      });
    },
    
    async getStatus() {
      return API.request('/assistant/status');
    }
  },

  // Appointment endpoints
  appointments: {
    async getAll() {
      return API.request('/appointments');
    },
    
    async create(appointmentData) {
      return API.request('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });
    },
    
    async update(id, appointmentData) {
      return API.request(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(appointmentData)
      });
    }
  },

  // Health check
  async healthCheck() {
    return API.request('/health');
  },

  // Chatbot API
  chatbot: {
    async sendMessage(message, role = 'user', context = {}) {
      return API.request('/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, role, context })
      });
    }
  }
};

// Make API available globally
window.API = API;
