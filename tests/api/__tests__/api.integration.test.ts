// Integration tests for API routes
// Tests for API endpoints and their integration with database/services

import { createMocks } from 'node-mocks-http';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client for testing
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          maybeSingle: jest.fn(),
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
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn(),
    },
  })),
}));

describe('API Integration Tests', () => {
  // Campaign API Tests
  describe('Campaign API Routes', () => {
    describe('GET /api/campaigns/list', () => {
      test('should return campaign list successfully', async () => {
        const mockCampaigns = [
          testData.generateCampaign(),
          testData.generateCampaign(),
        ];

        // Mock database response
        const { createClient } = require('@/lib/supabase/client');
        const mockDb = createClient();
        mockDb.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: mockCampaigns }),
            }),
          }),
        });

        const { req, res } = createMocks({
          method: 'GET',
          query: { page: 1, limit: 10 },
        });

        // Import and call the API route
        const handler = require('@/app/api/campaigns/list/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const responseData = JSON.parse(res._getData());
        expect(responseData.data).toEqual(mockCampaigns);
        expect(responseData.pagination).toHaveProperty('page');
        expect(responseData.pagination).toHaveProperty('limit');
      });

      test('should handle database errors gracefully', async () => {
        const { createClient } = require('@/lib/supabase/client');
        const mockDb = createClient();
        mockDb.from.mockReturnValue({
          select: jest.fn().mockRejectedValue(new Error('Database error')),
        });

        const { req, res } = createMocks({
          method: 'GET',
        });

        const handler = require('@/app/api/campaigns/list/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        const responseData = JSON.parse(res._getData());
        expect(responseData.error).toBeDefined();
      });

      test('should validate query parameters', async () => {
        const { req, res } = createMocks({
          method: 'GET',
          query: { page: -1, limit: 999 }, // Invalid parameters
        });

        const handler = require('@/app/api/campaigns/list/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        const responseData = JSON.parse(res._getData());
        expect(responseData.error).toMatch(/invalid.*parameter/i);
      });
    });

    describe('POST /api/campaigns/create', () => {
      test('should create campaign successfully', async () => {
        const campaignData = {
          name: 'Test Campaign',
          description: 'Test Description',
          budget: 1000,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const { createClient } = require('@/lib/supabase/client');
        const mockDb = createClient();
        const createdCampaign = testData.generateCampaign(campaignData);
        
        mockDb.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: createdCampaign }),
            }),
          }),
        });

        const { req, res } = createMocks({
          method: 'POST',
          body: campaignData,
        });

        const handler = require('@/app/api/campaigns/create/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(201);
        const responseData = JSON.parse(res._getData());
        expect(responseData.data).toEqual(createdCampaign);
      });

      test('should validate required fields', async () => {
        const { req, res } = createMocks({
          method: 'POST',
          body: { name: '' }, // Missing required fields
        });

        const handler = require('@/app/api/campaigns/create/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        const responseData = JSON.parse(res._getData());
        expect(responseData.error).toMatch(/required/i);
      });

      test('should handle validation errors', async () => {
        const invalidData = {
          name: 'Test Campaign',
          budget: -100, // Invalid budget
          startDate: 'invalid-date',
        };

        const { req, res } = createMocks({
          method: 'POST',
          body: invalidData,
        });

        const handler = require('@/app/api/campaigns/create/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        const responseData = JSON.parse(res._getData());
        expect(responseData.error).toBeDefined();
      });
    });

    describe('DELETE /api/campaigns/delete', () => {
      test('should delete campaign successfully', async () => {
        const campaignId = 'campaign_123';

        const { createClient } = require('@/lib/supabase/client');
        const mockDb = createClient();
        mockDb.from.mockReturnValue({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null }),
          }),
        });

        const { req, res } = createMocks({
          method: 'DELETE',
          query: { id: campaignId },
        });

        const handler = require('@/app/api/campaigns/delete/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const responseData = JSON.parse(res._getData());
        expect(responseData.success).toBe(true);
      });

      test('should handle non-existent campaign', async () => {
        const { createClient } = require('@/lib/supabase/client');
        const mockDb = createClient();
        mockDb.from.mockReturnValue({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null }),
          }),
        });

        const { req, res } = createMocks({
          method: 'DELETE',
          query: { id: 'non-existent-id' },
        });

        const handler = require('@/app/api/campaigns/delete/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(404);
        const responseData = JSON.parse(res._getData());
        expect(responseData.error).toMatch(/not found/i);
      });
    });
  });

  // Team API Tests
  describe('Team API Routes', () => {
    describe('GET /api/team/list', () => {
      test('should return team members list', async () => {
        const mockMembers = [
          testData.generateUser({ role: 'admin' }),
          testData.generateUser({ role: 'member' }),
        ];

        const { createClient } = require('@/lib/supabase/client');
        const mockDb = createClient();
        mockDb.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockMembers }),
          }),
        });

        const { req, res } = createMocks({ method: 'GET' });

        const handler = require('@/app/api/team/list/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const responseData = JSON.parse(res._getData());
        expect(responseData.data).toEqual(mockMembers);
      });
    });

    describe('POST /api/team/invite', () => {
      test('should invite team member successfully', async () => {
        const inviteData = {
          email: 'newmember@example.com',
          role: 'member',
        };

        const { createClient } = require('@/lib/supabase/client');
        const mockDb = createClient();
        const inviteResult = { id: 'invite_123', ...inviteData };
        
        mockDb.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: inviteResult }),
            }),
          }),
        });

        const { req, res } = createMocks({
          method: 'POST',
          body: inviteData,
        });

        const handler = require('@/app/api/team/invite/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(201);
        const responseData = JSON.parse(res._getData());
        expect(responseData.data).toEqual(inviteResult);
      });

      test('should handle duplicate email invitation', async () => {
        const inviteData = {
          email: 'existing@example.com',
          role: 'member',
        };

        const { createClient } = require('@/lib/supabase/client');
        const mockDb = createClient();
        mockDb.from.mockReturnValue({
          insert: jest.fn().mockRejectedValue({ code: '23505' }), // Unique constraint violation
        });

        const { req, res } = createMocks({
          method: 'POST',
          body: inviteData,
        });

        const handler = require('@/app/api/team/invite/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(409);
        const responseData = JSON.parse(res._getData());
        expect(responseData.error).toMatch(/already exists/i);
      });
    });
  });

  // Telegram API Tests
  describe('Telegram API Routes', () => {
    describe('POST /api/telegram/send-code', () => {
      test('should send verification code successfully', async () => {
        const codeData = {
          phoneNumber: '+1234567890',
        };

        // Mock Telegram client
        jest.mock('@/lib/telegram/client', () => ({
          sendCode: jest.fn().mockResolvedValue({ success: true }),
        }));

        const { req, res } = createMocks({
          method: 'POST',
          body: codeData,
        });

        const handler = require('@/app/api/telegram/send-code/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const responseData = JSON.parse(res._getData());
        expect(responseData.success).toBe(true);
      });

      test('should validate phone number format', async () => {
        const invalidData = {
          phoneNumber: 'invalid-phone',
        };

        const { req, res } = createMocks({
          method: 'POST',
          body: invalidData,
        });

        const handler = require('@/app/api/telegram/send-code/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        const responseData = JSON.parse(res._getData());
        expect(responseData.error).toMatch(/invalid.*phone/i);
      });
    });

    describe('POST /api/telegram/verify-code', () => {
      test('should verify code successfully', async () => {
        const verifyData = {
          phoneNumber: '+1234567890',
          code: '12345',
        };

        // Mock Telegram client
        jest.mock('@/lib/telegram/client', () => ({
          verifyCode: jest.fn().mockResolvedValue({ 
            success: true, 
            sessionId: 'session_123' 
          }),
        }));

        const { req, res } = createMocks({
          method: 'POST',
          body: verifyData,
        });

        const handler = require('@/app/api/telegram/verify-code/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const responseData = JSON.parse(res._getData());
        expect(responseData.success).toBe(true);
        expect(responseData.sessionId).toBeDefined();
      });

      test('should handle invalid verification code', async () => {
        const verifyData = {
          phoneNumber: '+1234567890',
          code: '00000',
        };

        // Mock Telegram client
        jest.mock('@/lib/telegram/client', () => ({
          verifyCode: jest.fn().mockRejectedValue(new Error('Invalid code')),
        }));

        const { req, res } = createMocks({
          method: 'POST',
          body: verifyData,
        });

        const handler = require('@/app/api/telegram/verify-code/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        const responseData = JSON.parse(res._getData());
        expect(responseData.error).toMatch(/invalid.*code/i);
      });
    });
  });

  // Groups API Tests
  describe('Groups API Routes', () => {
    describe('GET /api/telegram/get-groups', () => {
      test('should return groups list', async () => {
        const mockGroups = [
          testData.generateGroup(),
          testData.generateGroup(),
        ];

        // Mock Telegram client
        jest.mock('@/lib/telegram/client', () => ({
          getGroups: jest.fn().mockResolvedValue({ data: mockGroups }),
        }));

        const { req, res } = createMocks({ method: 'GET' });

        const handler = require('@/app/api/telegram/get-groups/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const responseData = JSON.parse(res._getData());
        expect(responseData.data).toEqual(mockGroups);
      });

      test('should handle authentication required', async () => {
        // Mock failed authentication
        jest.mock('@/lib/telegram/client', () => ({
          getGroups: jest.fn().mockRejected(new Error('Authentication required')),
        }));

        const { req, res } = createMocks({ method: 'GET' });

        const handler = require('@/app/api/telegram/get-groups/route');
        await handler(req, res);

        expect(res._getStatusCode()).toBe(401);
        const responseData = JSON.parse(res._getData());
        expect(responseData.error).toMatch(/auth.*required/i);
      });
    });
  });
});

// API Security Integration Tests
describe('API Security Integration Tests', () => {
  test('should reject requests without authentication', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: '', // Missing auth token
      },
    });

    const handler = require('@/app/api/campaigns/list/route');
    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  test('should validate API keys for external access', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        'x-api-key': 'invalid-key',
      },
    });

    const handler = require('@/app/api/campaigns/list/route');
    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
  });

  test('should implement rate limiting', async () => {
    const { createClient } = require('@/lib/supabase/client');
    const mockDb = createClient();
    
    // Mock rate limiting table
    mockDb.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ 
          data: [{ count: 100, window: '1h' }] // At rate limit
        }),
      }),
    });

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        'x-forwarded-for': '192.168.1.1',
      },
    });

    const handler = require('@/app/api/campaigns/list/route');
    await handler(req, res);

    expect(res._getStatusCode()).toBe(429);
    const responseData = JSON.parse(res._getData());
    expect(responseData.error).toMatch(/rate.*limit/i);
  });
});

// API Performance Integration Tests
describe('API Performance Integration Tests', () => {
  test('should respond to campaign list requests within time limit', async () => {
    const { createClient } = require('@/lib/supabase/client');
    const mockDb = createClient();
    mockDb.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ data: [] }),
        }),
      }),
    });

    const { req, res } = createMocks({ method: 'GET' });

    const { duration } = await testUtils.measurePerformance(async () => {
      const handler = require('@/app/api/campaigns/list/route');
      await handler(req, res);
    });

    expect(duration).toBeLessThan(1000); // Should respond within 1 second
    expect(res._getStatusCode()).toBe(200);
  });

  test('should handle concurrent requests efficiently', async () => {
    const { createClient } = require('@/lib/supabase/client');
    const mockDb = createClient();
    mockDb.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ data: [] }),
        }),
      }),
    });

    const promises = Array.from({ length: 10 }, async () => {
      const { req, res } = createMocks({ method: 'GET' });
      const handler = require('@/app/api/campaigns/list/route');
      await handler(req, res);
      return res._getStatusCode();
    });

    const results = await Promise.all(promises);
    
    results.forEach(statusCode => {
      expect(statusCode).toBe(200);
    });
  });
});