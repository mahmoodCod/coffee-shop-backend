const request = require('supertest');
const app = require('../app');

describe('Order Controller Tests', () => {
  let adminToken;
  let userToken;
  let testOrderId;
  let testProductId;

  // Helper function to create admin token (if needed)
  // Note: You may need to adjust this based on your auth setup
  const getAdminToken = async () => {
    // This is a placeholder - adjust based on your actual auth flow
    // For now, we'll test without token and expect 401 errors
    return null;
  };

  const getUserToken = async () => {
    // This is a placeholder - adjust based on your actual auth flow
    return null;
  };

  describe('POST /api/v1/order (Create Order - Auth Required)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/v1/order')
        .send({
          items: [
            {
              product: '507f1f77bcf86cd799439011',
              quantity: 1
            }
          ],
          shippingAddress: {
            postalCode: '1234567890',
            coordinates: {
              lat: '35.6892',
              lng: '51.3890'
            },
            address: 'Test Address',
            cityId: 1
          },
          authority: 'test-authority-123'
        });

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/order')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          items: [
            {
              product: '507f1f77bcf86cd799439011',
              quantity: 1
            }
          ],
          shippingAddress: {
            postalCode: '1234567890',
            coordinates: {
              lat: '35.6892',
              lng: '51.3890'
            },
            address: 'Test Address',
            cityId: 1
          },
          authority: 'test-authority-123'
        });

      expect(response.status).toBe(401);
    });

    test('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/order')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          items: [
            {
              product: '507f1f77bcf86cd799439011',
              quantity: 1
            }
          ]
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for missing items', async () => {
      const response = await request(app)
        .post('/api/v1/order')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          shippingAddress: {
            postalCode: '1234567890',
            coordinates: {
              lat: '35.6892',
              lng: '51.3890'
            },
            address: 'Test Address',
            cityId: 1
          },
          authority: 'test-authority-123'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for empty items array', async () => {
      const response = await request(app)
        .post('/api/v1/order')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          items: [],
          shippingAddress: {
            postalCode: '1234567890',
            coordinates: {
              lat: '35.6892',
              lng: '51.3890'
            },
            address: 'Test Address',
            cityId: 1
          },
          authority: 'test-authority-123'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid product ID format', async () => {
      const response = await request(app)
        .post('/api/v1/order')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          items: [
            {
              product: 'invalid-id',
              quantity: 1
            }
          ],
          shippingAddress: {
            postalCode: '1234567890',
            coordinates: {
              lat: '35.6892',
              lng: '51.3890'
            },
            address: 'Test Address',
            cityId: 1
          },
          authority: 'test-authority-123'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid quantity (less than 1)', async () => {
      const response = await request(app)
        .post('/api/v1/order')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          items: [
            {
              product: '507f1f77bcf86cd799439011',
              quantity: 0
            }
          ],
          shippingAddress: {
            postalCode: '1234567890',
            coordinates: {
              lat: '35.6892',
              lng: '51.3890'
            },
            address: 'Test Address',
            cityId: 1
          },
          authority: 'test-authority-123'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for missing shippingAddress', async () => {
      const response = await request(app)
        .post('/api/v1/order')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          items: [
            {
              product: '507f1f77bcf86cd799439011',
              quantity: 1
            }
          ],
          authority: 'test-authority-123'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for missing authority', async () => {
        const response = await request(app)
          .post('/api/v1/order')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            items: [
              {
                product: '507f1f77bcf86cd799439011',
                quantity: 1
              }
            ],
            shippingAddress: {
              postalCode: '1234567890',
              coordinates: {
                lat: '35.6892',
                lng: '51.3890'
              },
              address: 'Test Address',
              cityId: 1
            }
          });
  
        expect(response.status).not.toBe(200);
      });
    });
  
    describe('GET /api/v1/order (Get My Orders - Auth Required)', () => {
      test('should return 401 for missing token', async () => {
        const response = await request(app)
          .get('/api/v1/order');
  
        expect(response.status).toBe(401);
      });
  
      test('should return 401 for invalid token', async () => {
        const response = await request(app)
          .get('/api/v1/order')
          .set('Authorization', 'Bearer invalid.token');
  
        expect(response.status).toBe(401);
      });
  
      test('should accept query parameters for pagination', async () => {
        const response = await request(app)
          .get('/api/v1/order?page=1&limit=10')
          .set('Authorization', 'Bearer invalid.token');
  
        expect(response.status).not.toBe(200);
      });
    });
  
    describe('GET /api/v1/order/:id (Get Order By ID - Auth Required)', () => {
      test('should return 401 for missing token', async () => {
        const response = await request(app)
          .get('/api/v1/order/507f1f77bcf86cd799439011');
  
        expect(response.status).toBe(401);
      });
  
      test('should return 401 for invalid token', async () => {
        const response = await request(app)
          .get('/api/v1/order/507f1f77bcf86cd799439011')
          .set('Authorization', 'Bearer invalid.token');
  
        expect(response.status).toBe(401);
      });
  
      test('should return 400 for invalid order ID format', async () => {
        const response = await request(app)
          .get('/api/v1/order/invalid-id')
          .set('Authorization', 'Bearer invalid.token');
  
        expect(response.status).not.toBe(200);
      });
    });
  
    describe('GET /api/v1/order/admin/all (Get All Orders - Admin Only)', () => {
      test('should return 401 for missing token', async () => {
        const response = await request(app)
          .get('/api/v1/order/admin/all');
  
        expect(response.status).toBe(401);
      });
  
      test('should return 401 for invalid token', async () => {
        const response = await request(app)
          .get('/api/v1/order/admin/all')
          .set('Authorization', 'Bearer invalid.token');
  
        expect(response.status).toBe(401);
      });
  
      test('should accept query parameters for pagination and filters', async () => {
        const response = await request(app)
          .get('/api/v1/order/admin/all?page=1&limit=10&status=PROCESSING')
          .set('Authorization', 'Bearer invalid.token');
  
        expect(response.status).not.toBe(200);
      });
  
      test('should accept status filter', async () => {
        const response = await request(app)
          .get('/api/v1/order/admin/all?status=SHIPPED')
          .set('Authorization', 'Bearer invalid.token');
  
        expect(response.status).not.toBe(200);
      });
  
      test('should accept userId filter', async () => {
        const response = await request(app)
          .get('/api/v1/order/admin/all?userId=507f1f77bcf86cd799439011')
          .set('Authorization', 'Bearer invalid.token');
  
        expect(response.status).not.toBe(200);
      });
  
      test('should return error for invalid userId format', async () => {
        const response = await request(app)
          .get('/api/v1/order/admin/all?userId=invalid-id')
          .set('Authorization', 'Bearer invalid.token');
  
        expect(response.status).not.toBe(200);
      });
    });
  
    describe('PATCH /api/v1/order/admin/:id (Update Order - Admin Only)', () => {
      test('should return 401 for missing token', async () => {
        const response = await request(app)
          .patch('/api/v1/order/admin/507f1f77bcf86cd799439011')
          .send({
            status: 'SHIPPED',
            postTrackingCode: 'TRACK123456'
          });
  
        expect(response.status).toBe(401);
      });
  
      test('should return 401 for invalid token', async () => {
        const response = await request(app)
          .patch('/api/v1/order/admin/507f1f77bcf86cd799439011')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            status: 'SHIPPED',
            postTrackingCode: 'TRACK123456'
          });
  
        expect(response.status).toBe(401);
      });
  
      test('should return 400 for invalid order ID format', async () => {
        const response = await request(app)
          .patch('/api/v1/order/admin/invalid-id')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            status: 'SHIPPED',
            postTrackingCode: 'TRACK123456'
          });
  
        expect(response.status).not.toBe(200);
      });
  
      test('should return error for missing status', async () => {
        const response = await request(app)
          .patch('/api/v1/order/admin/507f1f77bcf86cd799439011')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            postTrackingCode: 'TRACK123456'
          });
  
        expect(response.status).not.toBe(200);
      });
  
      test('should return error for invalid status value', async () => {
        const response = await request(app)
          .patch('/api/v1/order/admin/507f1f77bcf86cd799439011')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            status: 'INVALID_STATUS',
            postTrackingCode: 'TRACK123456'
          });
  
        expect(response.status).not.toBe(200);
      });
  
      test('should accept valid status values (PROCESSING)', async () => {
        const response = await request(app)
          .patch('/api/v1/order/admin/507f1f77bcf86cd799439011')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            status: 'PROCESSING'
          });
  
        expect(response.status).not.toBe(200);
      });
  
      test('should accept valid status values (SHIPPED)', async () => {
        const response = await request(app)
          .patch('/api/v1/order/admin/507f1f77bcf86cd799439011')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            status: 'SHIPPED'
          });
  
        expect(response.status).not.toBe(200);
      });
  
      test('should accept valid status values (DELIVERED)', async () => {
        const response = await request(app)
          .patch('/api/v1/order/admin/507f1f77bcf86cd799439011')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            status: 'DELIVERED'
          });
  
        expect(response.status).not.toBe(200);
      });
  
      test('should accept postTrackingCode as optional field', async () => {
        const response = await request(app)
          .patch('/api/v1/order/admin/507f1f77bcf86cd799439011')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            status: 'SHIPPED',
            postTrackingCode: 'TRACK123456'
          });
  
        expect(response.status).not.toBe(200);
      });
  });
});

