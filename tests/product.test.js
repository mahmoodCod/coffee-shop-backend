const request = require('supertest');
const app = require('../app');

describe('Product Controller Tests', () => {
  let adminToken;
  let testProductId;
  let testCategoryId;

  // Helper function to create admin token (if needed)
  // Note: You may need to adjust this based on your auth setup
  const getAdminToken = async () => {
    // This is a placeholder - adjust based on your actual auth flow
    // For now, we'll test without token and expect 401 errors
    return null;
  };

  describe('GET /api/v1/product (Get All Products - Public)', () => {
    test('should return products without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/product');

      // Should not require auth
      expect(response.status).not.toBe(401);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(response.body.data).toHaveProperty('products');
          expect(Array.isArray(response.body.data.products)).toBe(true);
          expect(response.body.data).toHaveProperty('pagination');
        }
      }
    });
    })
    })