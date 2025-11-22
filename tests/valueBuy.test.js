const request = require('supertest');
const app = require('../app');

describe('ValueBuy Controller Tests', () => {
  let adminToken;
  let testValueBuyId;

  // Helper function to create admin token (if needed)
  // Note: You may need to adjust this based on your auth setup
  const getAdminToken = async () => {
    // This is a placeholder - adjust based on your actual auth flow
    // For now, we'll test without token and expect 401 errors
    return null;
  };

  describe('POST /api/v1/valueBuy (Create ValueBuy - Admin Only)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/v1/valueBuy')
        .send({
          product: '507f1f77bcf86cd799439011',
          features: {
            recommended: true,
            specialDiscount: false,
            lowStock: false,
            rareDeal: false
          },
          filters: {
            economicChoice: true,
            bestValue: false,
            topSelling: false,
            freeShipping: false
          }
        });

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/valueBuy')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          product: '507f1f77bcf86cd799439011',
          features: {
            recommended: true,
            specialDiscount: false,
            lowStock: false,
            rareDeal: false
          },
          filters: {
            economicChoice: true,
            bestValue: false,
            topSelling: false,
            freeShipping: false
          }
        });

      expect(response.status).toBe(401);
    });
  
  });
});

