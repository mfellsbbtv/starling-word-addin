/**
 * API Configuration for Starling Frontend
 * Update these values when your AWS backend is deployed
 */

const API_ENDPOINTS = {
  // Development/Local API
  development: {
    baseUrl: 'http://localhost:8000/api/v1',
    timeout: 30000,
    description: 'Local development server'
  },
  
  // AWS Production API (update when deployed)
  production: {
    baseUrl: 'https://your-aws-api-domain.com/api/v1',  // TODO: Update with actual AWS endpoint
    timeout: 30000,
    description: 'AWS production server'
  },
  
  // AWS Staging API (optional)
  staging: {
    baseUrl: 'https://staging-api.your-domain.com/api/v1',  // TODO: Update if using staging
    timeout: 30000,
    description: 'AWS staging server'
  }
};

// Default configuration
const DEFAULT_CONFIG = {
  // Environment detection
  environment: (typeof process !== 'undefined' && process.env.NODE_ENV) || 'development',
  
  // Feature flags
  USE_REAL_API: false,  // Set to true when backend is ready
  ENABLE_LOGGING: true,
  ENABLE_MOCK_RESPONSES: true,
  
  // Authentication (will be implemented later)
  auth: {
    tokenKey: 'starling_auth_token',
    refreshTokenKey: 'starling_refresh_token',
    tokenExpiry: 3600000 // 1 hour in milliseconds
  },
  
  // Request settings
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Retry settings
  retry: {
    attempts: 3,
    delay: 1000 // milliseconds
  }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    API_ENDPOINTS,
    DEFAULT_CONFIG
  };
} else {
  // Browser environment
  window.STARLING_CONFIG = {
    API_ENDPOINTS,
    DEFAULT_CONFIG
  };
}
