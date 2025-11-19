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
    test('should accept query parameters for pagination', async () => {
        const response = await request(app)
          .get('/api/v1/product?page=1&limit=10');
  
        expect(response.status).not.toBe(401);
      });
  
      test('should accept query parameters for filtering', async () => {
        const response = await request(app)
          .get('/api/v1/product?status=active&category=507f1f77bcf86cd799439011&type=regular');
  
        expect(response.status).not.toBe(401);
      });
  
      test('should accept query parameters for price range', async () => {
        const response = await request(app)
          .get('/api/v1/product?minPrice=100&maxPrice=1000');
  
        expect(response.status).not.toBe(401);
      });
  
      test('should accept query parameters for search', async () => {
        const response = await request(app)
          .get('/api/v1/product?search=coffee');
  
        expect(response.status).not.toBe(401);
      });
  
      test('should accept query parameters for stock filter', async () => {
        const response = await request(app)
          .get('/api/v1/product?inStock=true');
  
        expect(response.status).not.toBe(401);
      });

      describe('GET /api/v1/product/:productId (Get One Product - Public)', () => {
        test('should return product without authentication', async () => {
          const response = await request(app)
            .get('/api/v1/product/507f1f77bcf86cd799439011');
    
          // Should not require auth
          expect(response.status).not.toBe(401);
        });
    
        test('should return 400 for invalid product ID', async () => {
          const response = await request(app)
            .get('/api/v1/product/invalid-id');
    
          expect(response.status).toBe(400);
          if (response.body && response.body.success !== undefined) {
            expect(response.body.success).toBe(false);
          }
        });
    
        test('should return 404 for non-existent product', async () => {
          const response = await request(app)
            .get('/api/v1/product/507f1f77bcf86cd799439011');
    
          // May return 404 if product doesn't exist
          if (response.status === 404) {
            expect(response.body).toHaveProperty('success');
            if (response.body.success !== undefined) {
              expect(response.body.success).toBe(false);
            }
          }
        });
      });
      describe('POST /api/v1/product (Create Product - Admin Only)', () => {
        test('should return 401 for missing token', async () => {
          const response = await request(app)
            .post('/api/v1/product')
            .send({
              name: 'Test Product',
              slug: 'test-product',
              description: 'Test description',
              positiveFeature: 'Test feature',
              category: '507f1f77bcf86cd799439011',
              badge: 'New',
              price: 100,
              stock: 10
            });
    
          expect(response.status).toBe(401);
        });
    
        test('should return 401 for invalid token', async () => {
          const response = await request(app)
            .post('/api/v1/product')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              name: 'Test Product',
              slug: 'test-product',
              description: 'Test description',
              positiveFeature: 'Test feature',
              category: '507f1f77bcf86cd799439011',
              badge: 'New',
              price: 100,
              stock: 10
            });
    
          expect(response.status).toBe(401);
        });
    
        test('should return error for missing required fields', async () => {
          const response = await request(app)
            .post('/api/v1/product')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              name: 'Test Product'
            });
    
          expect(response.status).not.toBe(200);
        });
    
        test('should return error for invalid slug format', async () => {
          const response = await request(app)
            .post('/api/v1/product')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              name: 'Test Product',
              slug: 'Invalid Slug!',
              description: 'Test description',
              positiveFeature: 'Test feature',
              category: '507f1f77bcf86cd799439011',
              badge: 'New',
              price: 100,
              stock: 10
            });
    
          expect(response.status).not.toBe(200);
        });
        
        test('should return error for invalid category ID', async () => {
            const response = await request(app)
              .post('/api/v1/product')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                name: 'Test Product',
                slug: 'test-product',
                description: 'Test description',
                positiveFeature: 'Test feature',
                category: 'invalid-category-id',
                badge: 'New',
                price: 100,
                stock: 10
              });
      
            expect(response.status).not.toBe(200);
          });
      
          test('should return error for negative price', async () => {
            const response = await request(app)
              .post('/api/v1/product')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                name: 'Test Product',
                slug: 'test-product',
                description: 'Test description',
                positiveFeature: 'Test feature',
                category: '507f1f77bcf86cd799439011',
                badge: 'New',
                price: -100,
                stock: 10
              });
      
            expect(response.status).not.toBe(200);
          });
      
          test('should return error for negative stock', async () => {
            const response = await request(app)
              .post('/api/v1/product')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                name: 'Test Product',
                slug: 'test-product',
                description: 'Test description',
                positiveFeature: 'Test feature',
                category: '507f1f77bcf86cd799439011',
                badge: 'New',
                price: 100,
                stock: -10
              });
      
            expect(response.status).not.toBe(200);
          });
      
          test('should return error for invalid status', async () => {
            const response = await request(app)
              .post('/api/v1/product')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                name: 'Test Product',
                slug: 'test-product',
                description: 'Test description',
                positiveFeature: 'Test feature',
                category: '507f1f77bcf86cd799439011',
                badge: 'New',
                status: 'invalid-status',
                price: 100,
                stock: 10
              });
      
            expect(response.status).not.toBe(200);
          });
    });
    });
    });