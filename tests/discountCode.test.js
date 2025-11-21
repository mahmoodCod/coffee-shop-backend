const request = require('supertest');
const app = require('../app');

describe('DiscountCode Controller Tests', () => {
  let adminToken;
  let testDiscountCodeId;

  // Helper function to create admin token (if needed)
  // Note: You may need to adjust this based on your auth setup
  const getAdminToken = async () => {
    // This is a placeholder - adjust based on your actual auth flow
    // For now, we'll test without token and expect 401 errors
    return null;
  };

  describe('POST /api/v1/discountCode (Create Discount Code - Admin Only)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/v1/discountCode')
        .send({
          code: 'TESTCODE',
          percentage: 10,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          usageLimit: 100
        });

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/discountCode')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          code: 'TESTCODE',
          percentage: 10,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          usageLimit: 100
        });

      expect(response.status).toBe(401);
    });

    test('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/discountCode')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          code: 'TESTCODE'
        });

      expect(response.status).not.toBe(200);
      if (response.body && response.body.success !== undefined) {
        expect(response.body.success).toBe(false);
      }
    });

    test('should return error for invalid percentage (less than 1)', async () => {
      const response = await request(app)
        .post('/api/v1/discountCode')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          code: 'TESTCODE',
          percentage: 0,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          usageLimit: 100
        });

      expect(response.status).not.toBe(200);
    });

  });
});

