// Advanced Jest setup for performance and integration tests

// Performance test utilities
global.performance = {
  now: () => Date.now(),
};

// Mock fetch for API tests
global.fetch = jest.fn();

// Mock timers for testing async operations
jest.useFakeTimers();

// Global test utilities
global.testUtils = {
  // Performance measurement
  measurePerformance: async (fn) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return {
      result,
      duration: end - start,
    };
  },

  // Memory usage tracking
  trackMemory: () => {
    if (global.gc) {
      global.gc();
    }
    return process.memoryUsage();
  },

  // Mock WebSocket for real-time tests
  createMockWebSocket: () => ({
    send: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }),

  // Mock localStorage for client-side tests
  mockLocalStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },

  // Mock sessionStorage
  mockSessionStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
};

// Setup DOM APIs for JSDOM
if (typeof window !== 'undefined') {
  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {
      return null;
    }
    disconnect() {
      return null;
    }
    unobserve() {
      return null;
    }
  };

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {
      return null;
    }
    disconnect() {
      return null;
    }
    unobserve() {
      return null;
    }
  };

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock clipboard API
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn(() => Promise.resolve()),
      readText: jest.fn(() => Promise.resolve('')),
    },
  });

  // Mock service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker = {
      register: jest.fn(() => Promise.resolve()),
      ready: Promise.resolve(),
      getRegistration: jest.fn(() => Promise.resolve()),
    };
  }
}

// Setup console methods for testing
const originalConsole = { ...console };

// Add test-specific console methods
global.consoleTest = {
  log: (...args) => originalConsole.log('[TEST]', ...args),
  warn: (...args) => originalConsole.warn('[TEST-WARN]', ...args),
  error: (...args) => originalConsole.error('[TEST-ERROR]', ...args),
};

// Clean up after each test suite
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

// Global error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Setup test data generators
global.testData = {
  // Generate random user data
  generateUser: (overrides = {}) => ({
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    email: `user${Math.random().toString(36).substr(2, 9)}@example.com`,
    name: 'Test User',
    role: 'user',
    ...overrides,
  }),

  // Generate random campaign data
  generateCampaign: (overrides = {}) => ({
    id: 'campaign_' + Math.random().toString(36).substr(2, 9),
    name: `Test Campaign ${Math.random().toString(36).substr(2, 5)}`,
    status: 'draft',
    createdAt: new Date().toISOString(),
    settings: {
      targetAudience: 'all',
      budget: 1000,
      duration: 7,
    },
    ...overrides,
  }),

  // Generate random group data
  generateGroup: (overrides = {}) => ({
    id: 'group_' + Math.random().toString(36).substr(2, 9),
    name: `Test Group ${Math.random().toString(36).substr(2, 5)}`,
    type: 'public',
    members: Math.floor(Math.random() * 1000) + 1,
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  // Generate random session data
  generateSession: (overrides = {}) => ({
    id: 'session_' + Math.random().toString(36).substr(2, 9),
    phoneNumber: '+1234567890',
    status: 'active',
    lastActivity: new Date().toISOString(),
    ...overrides,
  }),
};

// Mock crypto for testing encryption/decryption
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    randomUUID: () => Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9),
  },
});

// Mock crypto.subtle for Node.js environment
Object.defineProperty(global.crypto, 'subtle', {
  value: {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    digest: jest.fn(),
  },
});