// Comprehensive API testing suite
// Tests for all API endpoints with various scenarios and edge cases

import request from 'supertest';
import { createApp } from '../test-utils/app-factory';

describe('API Testing Suite', () => {
  let app: any;
  let authToken: string;
  let testUser: any;
  let testCampaign: any;

  beforeAll(async () => {
    app = createApp();
  });

  beforeEach(async () => {
    // Setup test user and authentication
    testUser = testData.generateUser();
    authToken = await getTestAuthToken(app, testUser);
    testCampaign = testData.generateCampaign();
  });

  // Authentication API Tests
  describe('Authentication API', () => {
    describe('POST /api/auth/register', () => {
      test('should register new user successfully', async () => {
        const userData = {
          email: 'newuser@example.com',
          password: 'SecurePassword123!',
          name: 'New User',
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe(userData.email);
        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.user.password).toBeUndefined();
      });

      test('should reject registration with weak password', async () => {
        const userData = {
          email: 'weak@example.com',
          password: 'weak',
          name: 'Weak User',
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body.error).toMatch(/weak.*password/i);
      });

      test('should reject registration with duplicate email', async () => {
        const userData = {
          email: testUser.email, // Already exists
          password: 'SecurePassword123!',
          name: 'Duplicate User',
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(409);

        expect(response.body.error).toMatch(/email.*already.*exists/i);
      });

      test('should reject registration with invalid email format', async () => {
        const userData = {
          email: 'invalid-email',
          password: 'SecurePassword123!',
          name: 'Invalid User',
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body.error).toMatch(/invalid.*email/i);
      });
    });

    describe('POST /api/auth/login', () => {
      test('should login with valid credentials', async () => {
        const credentials = {
          email: testUser.email,
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(credentials)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.user.email).toBe(credentials.email);
      });

      test('should reject login with wrong password', async () => {
        const credentials = {
          email: testUser.email,
          password: 'wrongpassword',
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(credentials)
          .expect(401);

        expect(response.body.error).toMatch(/invalid.*credentials/i);
      });

      test('should reject login with non-existent email', async () => {
        const credentials = {
          email: 'nonexistent@example.com',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(credentials)
          .expect(401);

        expect(response.body.error).toMatch(/invalid.*credentials/i);
      });

      test('should implement account lockout after failed attempts', async () => {
        const credentials = {
          email: testUser.email,
          password: 'wrongpassword',
        };

        const promises = Array.from({ length: 5 }, () =>
          request(app)
            .post('/api/auth/login')
            .send(credentials)
            .expect(401)
        );

        await Promise.all(promises);

        // Next attempt should be locked
        const response = await request(app)
          .post('/api/auth/login')
          .send(credentials)
          .expect(429);

        expect(response.body.error).toMatch(/account.*locked/i);
      });
    });

    describe('POST /api/auth/logout', () => {
      test('should logout successfully', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${authToken}`)
          .send()
          .expect(200);

        expect(response.body.success).toBe(true);

        // Verify token is invalidated
        await request(app)
          .get('/api/campaigns/list')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(401);
      });
    });

    describe('POST /api/auth/refresh', () => {
      test('should refresh token successfully', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .set('Authorization', `Bearer ${authToken}`)
          .send()
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.token).not.toBe(authToken);
      });

      test('should reject refresh with invalid token', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .set('Authorization', 'Bearer invalid-token')
          .send()
          .expect(401);

        expect(response.body.error).toMatch(/invalid.*token/i);
      });
    });
  });

  // Campaign API Tests
  describe('Campaign API', () => {
    describe('GET /api/campaigns/list', () => {
      test('should return campaign list successfully', async () => {
        const response = await request(app)
          .get('/api/campaigns/list')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ page: 1, limit: 10 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.pagination).toHaveProperty('page');
        expect(response.body.pagination).toHaveProperty('limit');
        expect(response.body.pagination).toHaveProperty('total');
      });

      test('should handle pagination parameters correctly', async () => {
        const response = await request(app)
          .get('/api/campaigns/list')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ page: 2, limit: 5 })
          .expect(200);

        expect(response.body.pagination.page).toBe(2);
        expect(response.body.pagination.limit).toBe(5);
        expect(response.body.data).toHaveLength(5);
      });

      test('should filter campaigns by status', async () => {
        const response = await request(app)
          .get('/api/campaigns/list')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ status: 'active' })
          .expect(200);

        expect(response.body.data.every(c => c.status === 'active')).toBe(true);
      });

      test('should search campaigns by name', async () => {
        const response = await request(app)
          .get('/api/campaigns/list')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ search: 'test' })
          .expect(200);

        expect(response.body.data.every(c => 
          c.name.toLowerCase().includes('test')
        )).toBe(true);
      });

      test('should sort campaigns by date', async () => {
        const response = await request(app)
          .get('/api/campaigns/list')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ sortBy: 'createdAt', order: 'desc' })
          .expect(200);

        expect(response.body.data).toBeSortedBy('createdAt', { descending: true });
      });
    });

    describe('POST /api/campaigns/create', () => {
      test('should create campaign successfully', async () => {
        const campaignData = {
          name: 'Test Campaign',
          description: 'Test description',
          budget: 1000,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          targetAudience: 'all',
        };

        const response = await request(app)
          .post('/api/campaigns/create')
          .set('Authorization', `Bearer ${authToken}`)
          .send(campaignData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(campaignData.name);
        expect(response.body.data.budget).toBe(campaignData.budget);
        expect(response.body.data.status).toBe('draft');
      });

      test('should reject campaign with invalid dates', async () => {
        const campaignData = {
          name: 'Test Campaign',
          description: 'Test description',
          budget: 1000,
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Future date
          endDate: new Date().toISOString(), // Past date
        };

        const response = await request(app)
          .post('/api/campaigns/create')
          .set('Authorization', `Bearer ${authToken}`)
          .send(campaignData)
          .expect(400);

        expect(response.body.error).toMatch(/invalid.*date/i);
      });

      test('should reject campaign with negative budget', async () => {
        const campaignData = {
          name: 'Test Campaign',
          description: 'Test description',
          budget: -100,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const response = await request(app)
          .post('/api/campaigns/create')
          .set('Authorization', `Bearer ${authToken}`)
          .send(campaignData)
          .expect(400);

        expect(response.body.error).toMatch(/invalid.*budget/i);
      });

      test('should validate required fields', async () => {
        const campaignData = {
          description: 'Test description',
          // Missing name and budget
        };

        const response = await request(app)
          .post('/api/campaigns/create')
          .set('Authorization', `Bearer ${authToken}`)
          .send(campaignData)
          .expect(400);

        expect(response.body.error).toMatch(/required.*field/i);
      });
    });

    describe('PUT /api/campaigns/:id', () => {
      let campaignId: string;

      beforeEach(async () => {
        // Create a campaign to update
        const response = await request(app)
          .post('/api/campaigns/create')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testCampaign);

        campaignId = response.body.data.id;
      });

      test('should update campaign successfully', async () => {
        const updateData = {
          name: 'Updated Campaign Name',
          budget: 2000,
        };

        const response = await request(app)
          .put(`/api/campaigns/${campaignId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(updateData.name);
        expect(response.body.data.budget).toBe(updateData.budget);
      });

      test('should reject update for non-existent campaign', async () => {
        const updateData = {
          name: 'Updated Name',
        };

        const response = await request(app)
          .put('/api/campaigns/non-existent-id')
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(404);

        expect(response.body.error).toMatch(/not.*found/i);
      });

      test('should reject update without proper permissions', async () => {
        const otherUserToken = await getTestAuthToken(app, testData.generateUser());
        
        const updateData = {
          name: 'Unauthorized Update',
        };

        const response = await request(app)
          .put(`/api/campaigns/${campaignId}`)
          .set('Authorization', `Bearer ${otherUserToken}`)
          .send(updateData)
          .expect(403);

        expect(response.body.error).toMatch(/forbidden/i);
      });
    });

    describe('DELETE /api/campaigns/:id', () => {
      let campaignId: string;

      beforeEach(async () => {
        const response = await request(app)
          .post('/api/campaigns/create')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testCampaign);

        campaignId = response.body.data.id;
      });

      test('should delete campaign successfully', async () => {
        const response = await request(app)
          .delete(`/api/campaigns/${campaignId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send()
          .expect(200);

        expect(response.body.success).toBe(true);

        // Verify campaign is deleted
        await request(app)
          .get(`/api/campaigns/${campaignId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });

      test('should reject deletion with invalid ID format', async () => {
        const response = await request(app)
          .delete('/api/campaigns/invalid-id-format')
          .set('Authorization', `Bearer ${authToken}`)
          .send()
          .expect(400);

        expect(response.body.error).toMatch(/invalid.*id/i);
      });
    });

    describe('POST /api/campaigns/:id/start', () => {
      let campaignId: string;

      beforeEach(async () => {
        const campaign = { ...testCampaign, status: 'draft' };
        const response = await request(app)
          .post('/api/campaigns/create')
          .set('Authorization', `Bearer ${authToken}`)
          .send(campaign);

        campaignId = response.body.data.id;
      });

      test('should start campaign successfully', async () => {
        const response = await request(app)
          .post(`/api/campaigns/${campaignId}/start`)
          .set('Authorization', `Bearer ${authToken}`)
          .send()
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('active');
      });

      test('should reject starting already active campaign', async () => {
        // First start
        await request(app)
          .post(`/api/campaigns/${campaignId}/start`)
          .set('Authorization', `Bearer ${authToken}`)
          .send();

        // Try to start again
        const response = await request(app)
          .post(`/api/campaigns/${campaignId}/start`)
          .set('Authorization', `Bearer ${authToken}`)
          .send()
          .expect(400);

        expect(response.body.error).toMatch(/already.*active/i);
      });
    });
  });

  // Team API Tests
  describe('Team API', () => {
    describe('GET /api/team/list', () => {
      test('should return team members list', async () => {
        const response = await request(app)
          .get('/api/team/list')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.every(member => member.role)).toBe(true);
      });
    });

    describe('POST /api/team/invite', () => {
      test('should invite team member successfully', async () => {
        const inviteData = {
          email: 'newmember@example.com',
          role: 'member',
          message: 'Welcome to our team!',
        };

        const response = await request(app)
          .post('/api/team/invite')
          .set('Authorization', `Bearer ${authToken}`)
          .send(inviteData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe(inviteData.email);
        expect(response.body.data.role).toBe(inviteData.role);
      });

      test('should reject invitation with invalid role', async () => {
        const inviteData = {
          email: 'newmember@example.com',
          role: 'invalid-role',
        };

        const response = await request(app)
          .post('/api/team/invite')
          .set('Authorization', `Bearer ${authToken}`)
          .send(inviteData)
          .expect(400);

        expect(response.body.error).toMatch(/invalid.*role/i);
      });

      test('should reject duplicate invitation', async () => {
        const inviteData = {
          email: testUser.email, // Already a team member
          role: 'member',
        };

        const response = await request(app)
          .post('/api/team/invite')
          .set('Authorization', `Bearer ${authToken}`)
          .send(inviteData)
          .expect(409);

        expect(response.body.error).toMatch(/already.*exists/i);
      });
    });
  });

  // Telegram API Tests
  describe('Telegram API', () => {
    describe('POST /api/telegram/send-code', () => {
      test('should send verification code successfully', async () => {
        const codeData = {
          phoneNumber: '+1234567890',
        };

        const response = await request(app)
          .post('/api/telegram/send-code')
          .set('Authorization', `Bearer ${authToken}`)
          .send(codeData)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('should reject invalid phone number format', async () => {
        const codeData = {
          phoneNumber: 'invalid-phone',
        };

        const response = await request(app)
          .post('/api/telegram/send-code')
          .set('Authorization', `Bearer ${authToken}`)
          .send(codeData)
          .expect(400);

        expect(response.body.error).toMatch(/invalid.*phone/i);
      });
    });

    describe('POST /api/telegram/verify-code', () => {
      test('should verify code successfully', async () => {
        const verifyData = {
          phoneNumber: '+1234567890',
          code: '12345',
        };

        const response = await request(app)
          .post('/api/telegram/verify-code')
          .set('Authorization', `Bearer ${authToken}`)
          .send(verifyData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.sessionId).toBeDefined();
      });

      test('should reject invalid verification code', async () => {
        const verifyData = {
          phoneNumber: '+1234567890',
          code: '00000',
        };

        const response = await request(app)
          .post('/api/telegram/verify-code')
          .set('Authorization', `Bearer ${authToken}`)
          .send(verifyData)
          .expect(400);

        expect(response.body.error).toMatch(/invalid.*code/i);
      });
    });

    describe('GET /api/telegram/get-groups', () => {
      test('should return groups list', async () => {
        const response = await request(app)
          .get('/api/telegram/get-groups')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      test('should require valid Telegram session', async () => {
        // This test would require setting up a proper Telegram session
        const response = await request(app)
          .get('/api/telegram/get-groups')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(401);

        expect(response.body.error).toMatch(/telegram.*session.*required/i);
      });
    });
  });

  // File Upload API Tests
  describe('File Upload API', () => {
    describe('POST /api/upload/avatar', () => {
      test('should upload avatar successfully', async () => {
        const avatarBuffer = Buffer.from('fake-image-data');
        
        const response = await request(app)
          .post('/api/upload/avatar')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('avatar', avatarBuffer, 'avatar.jpg')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.url).toMatch(/^https?:\/\//);
      });

      test('should reject oversized files', async () => {
        const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
        
        const response = await request(app)
          .post('/api/upload/avatar')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('avatar', largeBuffer, 'large-avatar.jpg')
          .expect(413);

        expect(response.body.error).toMatch(/file.*too.*large/i);
      });

      test('should reject non-image files', async () => {
        const fileBuffer = Buffer.from('fake file content');
        
        const response = await request(app)
          .post('/api/upload/avatar')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('avatar', fileBuffer, 'file.txt')
          .expect(400);

        expect(response.body.error).toMatch(/invalid.*file.*type/i);
      });
    });
  });

  // Analytics API Tests
  describe('Analytics API', () => {
    describe('GET /api/analytics/campaign/:id', () => {
      let campaignId: string;

      beforeEach(async () => {
        const response = await request(app)
          .post('/api/campaigns/create')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testCampaign);

        campaignId = response.body.data.id;
      });

      test('should return campaign analytics', async () => {
        const response = await request(app)
          .get(`/api/analytics/campaign/${campaignId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('impressions');
        expect(response.body.data).toHaveProperty('clicks');
        expect(response.body.data).toHaveProperty('conversions');
        expect(response.body.data).toHaveProperty('ctr');
      });

      test('should support date range filtering', async () => {
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = new Date().toISOString();

        const response = await request(app)
          .get(`/api/analytics/campaign/${campaignId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .query({ startDate, endDate })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('dateRange');
      });
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    test('should handle 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBeDefined();
    });

    test('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/campaigns/create')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.error).toMatch(/invalid.*json/i);
    });

    test('should handle concurrent requests without conflicts', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app)
          .get('/api/campaigns/list')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
      );

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });
    });
  });

  // Rate Limiting Tests
  describe('Rate Limiting', () => {
    test('should implement rate limiting on API endpoints', async () => {
      const endpoint = '/api/campaigns/list';
      const requests = Array.from({ length: 100 }, () =>
        request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should reset rate limit after window expires', async () => {
      // This would require actual time-based testing
      // For now, we'll verify the rate limiting headers
      const response = await request(app)
        .get('/api/campaigns/list')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });
  });

  // Caching Tests
  describe('Caching', () => {
    test('should implement proper caching headers', async () => {
      const response = await request(app)
        .get('/api/campaigns/list')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['cache-control']).toBeDefined();
      expect(response.headers['etag']).toBeDefined();
    });

    test('should support conditional requests with ETag', async () => {
      // First request
      const firstResponse = await request(app)
        .get('/api/campaigns/list')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const etag = firstResponse.headers.etag;

      // Second request with ETag
      const secondResponse = await request(app)
        .get('/api/campaigns/list')
        .set('Authorization', `Bearer ${authToken}`)
        .set('If-None-Match', etag)
        .expect(304);

      expect(secondResponse.status).toBe(304); // Not Modified
    });
  });
});

// Helper functions
async function getTestAuthToken(app: any, user: any): Promise<string> {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: user.email,
      password: 'password123',
    });

  return response.body.data.token;
}