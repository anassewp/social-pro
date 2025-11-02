// Jest setup file for testing environment
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
  useParams() {
    return {};
  },
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          maybeSingle: jest.fn(),
          order: jest.fn(() => ({
            limit: jest.fn(),
          })),
        })),
        order: jest.fn(() => ({
          limit: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  })),
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    refetchQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClientProvider: ({ children }: any) => children,
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: (props: any) => {
    const { children, ...rest } = props;
    return <a {...rest}>{children}</a>;
  },
}));

// Mock window.matchMedia
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

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock crypto for Node.js environment
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    randomUUID: () => Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9),
    subtle: {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      digest: jest.fn(),
      generateKey: jest.fn(),
      importKey: jest.fn(),
    },
  },
});

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mock-url'),
});

// Mock URL.revokeObjectURL
Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock performance.now
Object.defineProperty(performance, 'now', {
  writable: true,
  value: jest.fn(() => Date.now()),
});

// Mock fetch
global.fetch = jest.fn();

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  onopen: any = null;
  onmessage: any = null;
  onclose: any = null;
  onerror: any = null;

  readyState = MockWebSocket.CONNECTING;
  url = '';

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) this.onopen({});
    }, 0);
  }

  send(data: any) {
    if (this.onmessage && this.readyState === MockWebSocket.OPEN) {
      this.onmessage({ data });
    }
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose({});
  }

  addEventListener(event: string, callback: any) {
    switch (event) {
      case 'open':
        this.onopen = callback;
        break;
      case 'message':
        this.onmessage = callback;
        break;
      case 'close':
        this.onclose = callback;
        break;
      case 'error':
        this.onerror = callback;
        break;
    }
  }

  removeEventListener(event: string, callback: any) {
    switch (event) {
      case 'open':
        this.onopen = null;
        break;
      case 'message':
        this.onmessage = null;
        break;
      case 'close':
        this.onclose = null;
        break;
      case 'error':
        this.onerror = null;
        break;
    }
  }

  dispatchEvent() {
    return true;
  }
}

Object.defineProperty(window, 'WebSocket', {
  value: MockWebSocket,
});

// Suppress console warnings in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeAll(() => {
  // Suppress React warnings in tests
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || 
       args[0].includes('ReactDOMTestUtils') ||
       args[0].includes('validateDOMNesting') ||
       args[0].includes('autoFocus'))
    ) {
      return;
    }
    originalConsoleError(...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || 
       args[0].includes('deprecated') ||
       args[0].includes('useLayoutEffect'))
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
});

// Clean up after all tests
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Global test utilities
global.testUtils = {
  // Performance measurement
  measurePerformance: async (fn: Function) => {
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

  // Mock localStorage
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
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  // Generate random campaign data
  generateCampaign: (overrides = {}) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return {
      id: 'campaign_' + Math.random().toString(36).substr(2, 9),
      name: `Test Campaign ${Math.random().toString(36).substr(2, 5)}`,
      description: 'Test campaign description',
      budget: Math.floor(Math.random() * 10000) + 1000,
      status: 'draft',
      startDate: now.toISOString(),
      endDate: futureDate.toISOString(),
      targetAudience: 'all',
      createdAt: now.toISOString(),
      ...overrides,
    };
  },

  // Generate random group data
  generateGroup: (overrides = {}) => ({
    id: 'group_' + Math.random().toString(36).substr(2, 9),
    name: `Test Group ${Math.random().toString(36).substr(2, 5)}`,
    type: 'public',
    members: Math.floor(Math.random() * 1000) + 1,
    description: 'Test group description',
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

// Add custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  toHaveValidDate(received: string) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime()) && received === date.toISOString();
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ISO date string`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ISO date string`,
        pass: false,
      };
    }
  },
});

export {};