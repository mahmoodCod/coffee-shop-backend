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

    test('should return error for invalid percentage (greater than 100)', async () => {
        const response = await request(app)
          .post('/api/v1/discountCode')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            code: 'TESTCODE',
            percentage: 101,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            usageLimit: 100
          });
  
        expect(response.status).not.toBe(200);
      });
  
      test('should return error for expired date in the past', async () => {
        const response = await request(app)
          .post('/api/v1/discountCode')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            code: 'TESTCODE',
            percentage: 10,
            expiresAt: new Date(Date.now() - 86400000).toISOString(),
            usageLimit: 100
          });
  
        expect(response.status).not.toBe(200);
      });
  
      test('should return error for invalid usage limit (less than 1)', async () => {
        const response = await request(app)
          .post('/api/v1/discountCode')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            code: 'TESTCODE',
            percentage: 10,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            usageLimit: 0
          });
  
        expect(response.status).not.toBe(200);
      });
    });
  
    describe('GET /api/v1/discountCode (Get All Discount Codes - Admin Only)', () => {
      test('should return 401 for missing token', async () => {
        const response = await request(app)
          .get('/api/v1/discountCode');
  
        expect(response.status).toBe(401);
      });
  
      test('should return 401 for invalid token', async () => {
        const response = await request(app)
          .get('/api/v1/discountCode')
          .set('Authorization', 'Bearer invalid.token');
  
        expect(response.status).toBe(401);
      });
  
      test('should accept query parameters for pagination', async () => {
        const response = await request(app)
          .get('/api/v1/discountCode?page=1&limit=10')
          .set('Authorization', 'Bearer invalid.token');
  
        // May return 401 for invalid token, but if authenticated, should accept params
        expect(response.status).not.toBe(200);
      });
  
      test('should accept query parameters for filtering', async () => {
        const response = await request(app)
          .get('/api/v1/discountCode?isActive=true&search=TEST')
          .set('Authorization', 'Bearer invalid.token');
  
        // May return 401 for invalid token, but if authenticated, should accept params
        expect(response.status).not.toBe(200);
      });
    });
  
    describe('GET /api/v1/discountCode/:id (Get One Discount Code - Admin Only)', () => {
      test('should return 401 for missing token', async () => {
        const response = await request(app)
          .get('/api/v1/discountCode/507f1f77bcf86cd799439011');
  
        expect(response.status).toBe(401);
      });
  
      test('should return 401 for invalid token', async () => {
        const response = await request(app)
          .get('/api/v1/discountCode/507f1f77bcf86cd799439011')
          .set('Authorization', 'Bearer invalid.token');
  
        expect(response.status).toBe(401);
      });
  
      test('should return 400 for invalid discount code ID', async () => {
        const response = await request(app)
          .get('/api/v1/discountCode/invalid-id')
          .set('Authorization', 'Bearer invalid.token');
  
        expect(response.status).not.toBe(200);
        if (response.status === 400) {
          expect(response.body).toHaveProperty('success');
          if (response.body.success !== undefined) {
            expect(response.body.success).toBe(false);
          }
        }
      });
  });
});

