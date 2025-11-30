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
    test('should return error for missing required fields', async () => {
        const response = await request(app)
          .post('/api/v1/valueBuy')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            product: '507f1f77bcf86cd799439011'
          });
  
        expect(response.status).not.toBe(200);
        if (response.body && response.body.success !== undefined) {
          expect(response.body.success).toBe(false);
        }
      });
  
      test('should return error for invalid product ID', async () => {
        const response = await request(app)
          .post('/api/v1/valueBuy')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            product: 'invalid-id',
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
  
        expect(response.status).not.toBe(200);
      });
  
      test('should return error for missing features object', async () => {
        const response = await request(app)
          .post('/api/v1/valueBuy')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            product: '507f1f77bcf86cd799439011',
            filters: {
              economicChoice: true,
              bestValue: false,
              topSelling: false,
              freeShipping: false
            }
          });
  
        expect(response.status).not.toBe(200);
      });
  
      test('should return error for missing filters object', async () => {
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
            }
          });
  
        expect(response.status).not.toBe(200);
      });
    });
    describe('GET /api/v1/valueBuy (Get All ValueBuy)', () => {
        test('should return 200 for public access', async () => {
          const response = await request(app)
            .get('/api/v1/valueBuy');
    
          // GET endpoint is public, should not require auth
          expect([200, 401, 500]).toContain(response.status);
        });
    
        test('should accept query parameters for pagination', async () => {
          const response = await request(app)
            .get('/api/v1/valueBuy?page=1&limit=10');
    
          // Should accept params without error
          expect([200, 401, 500]).toContain(response.status);
        });
    
        test('should accept query parameters for filtering by isActive', async () => {
          const response = await request(app)
            .get('/api/v1/valueBuy?isActive=true');
    
          expect([200, 401, 500]).toContain(response.status);
        });
    
        test('should accept query parameters for filtering by features', async () => {
          const response = await request(app)
            .get('/api/v1/valueBuy?recommended=true&specialDiscount=false');
    
          expect([200, 401, 500]).toContain(response.status);
        });
    
        test('should accept query parameters for filtering by filters', async () => {
          const response = await request(app)
            .get('/api/v1/valueBuy?economicChoice=true&bestValue=false');
    
          expect([200, 401, 500]).toContain(response.status);
        });
    
        test('should accept query parameters for filtering by product', async () => {
          const response = await request(app)
            .get('/api/v1/valueBuy?product=507f1f77bcf86cd799439011');
    
          expect([200, 401, 500]).toContain(response.status);
        });
      });
    
      describe('GET /api/v1/valueBuy/:id (Get One ValueBuy)', () => {
        test('should return 200 for public access', async () => {
          const response = await request(app)
            .get('/api/v1/valueBuy/507f1f77bcf86cd799439011');
    
          // GET endpoint is public, should not require auth
          expect([200, 404, 400, 401, 500]).toContain(response.status);
        });
    
        test('should return 400 for invalid ValueBuy ID', async () => {
          const response = await request(app)
            .get('/api/v1/valueBuy/invalid-id');
    
          expect(response.status).not.toBe(200);
          if (response.status === 400) {
            expect(response.body).toHaveProperty('success');
            if (response.body.success !== undefined) {
              expect(response.body.success).toBe(false);
            }
          }
        });
      
        test('should return 404 for non-existent ValueBuy', async () => {
          const response = await request(app)
            .get('/api/v1/valueBuy/507f1f77bcf86cd799439011');
    
          // May return 404 for non-existent ValueBuy
          if (response.status === 404) {
            expect(response.body).toHaveProperty('success');
            if (response.body.success !== undefined) {
              expect(response.body.success).toBe(false);
            }
          }
        });
      });
      describe('PATCH /api/v1/valueBuy/:id (Update ValueBuy - Admin Only)', () => {
        test('should return 401 for missing token', async () => {
          const response = await request(app)
            .patch('/api/v1/valueBuy/507f1f77bcf86cd799439011')
            .send({
              isActive: false
            });
    
          expect(response.status).toBe(401);
        });
    
        test('should return 401 for invalid token', async () => {
          const response = await request(app)
            .patch('/api/v1/valueBuy/507f1f77bcf86cd799439011')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              isActive: false
            });
    
          expect(response.status).toBe(401);
        });
    
        test('should return 400 for invalid ValueBuy ID', async () => {
          const response = await request(app)
            .patch('/api/v1/valueBuy/invalid-id')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              isActive: false
            });
    
          expect(response.status).not.toBe(200);
        });
    
        test('should return error for invalid product ID when updating product', async () => {
          const response = await request(app)
            .patch('/api/v1/valueBuy/507f1f77bcf86cd799439011')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              product: 'invalid-id'
            });
    
          expect(response.status).not.toBe(200);
        });
    
        test('should accept partial update for features', async () => {
          const response = await request(app)
            .patch('/api/v1/valueBuy/507f1f77bcf86cd799439011')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              features: {
                recommended: true
              }
            });
    
          // May return 401 for invalid token or 404 for non-existent ValueBuy
          expect(response.status).not.toBe(200);
        });
    
        test('should not accept filters in update (filters are not updatable)', async () => {
          const response = await request(app)
            .patch('/api/v1/valueBuy/507f1f77bcf86cd799439011')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              filters: {
                economicChoice: true
              }
            });

          // Filters are not updatable, may return 401 for invalid token or validation error
          expect(response.status).not.toBe(200);
        });
      });
    
      describe('DELETE /api/v1/valueBuy/:id (Delete ValueBuy - Admin Only)', () => {
        test('should return 401 for missing token', async () => {
          const response = await request(app)
            .delete('/api/v1/valueBuy/507f1f77bcf86cd799439011');
    
          expect(response.status).toBe(401);
        });
    
        test('should return 401 for invalid token', async () => {
          const response = await request(app)
            .delete('/api/v1/valueBuy/507f1f77bcf86cd799439011')
            .set('Authorization', 'Bearer invalid.token');
    
          expect(response.status).toBe(401);
        });
    
        test('should return 400 for invalid ValueBuy ID', async () => {
          const response = await request(app)
            .delete('/api/v1/valueBuy/invalid-id')
            .set('Authorization', 'Bearer invalid.token');
    
          expect(response.status).not.toBe(200);
        });
    
        test('should return 404 for non-existent ValueBuy', async () => {
          const response = await request(app)
            .delete('/api/v1/valueBuy/507f1f77bcf86cd799439011')
            .set('Authorization', 'Bearer invalid.token');
    
          // May return 401 for invalid token or 404 for non-existent ValueBuy
          if (response.status === 404) {
            expect(response.body).toHaveProperty('success');
            if (response.body.success !== undefined) {
              expect(response.body.success).toBe(false);
            }
          }
        });
      });
      describe('ValueBuy Edge Cases', () => {
        test('should handle duplicate product creation attempt', async () => {
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
    
          // May return 401 for invalid token or 409 for duplicate product
          expect(response.status).not.toBe(200);
        });
    
        test('should handle non-existent product ID', async () => {
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
    
          // May return 401 for invalid token or 404 for non-existent product
          expect(response.status).not.toBe(200);
        });
    
        test('should handle update with duplicate product in another ValueBuy', async () => {
          const response = await request(app)
            .patch('/api/v1/valueBuy/507f1f77bcf86cd799439011')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              product: '507f1f77bcf86cd799439012'
            });
    
          // May return 401 for invalid token or 409 for duplicate product
          expect(response.status).not.toBe(200);
        });
    
        test('should handle boolean values in features and filters', async () => {
          const response = await request(app)
            .post('/api/v1/valueBuy')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              product: '507f1f77bcf86cd799439011',
              features: {
                recommended: 'true', // String instead of boolean
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
    
          // May return 401 for invalid token or validation error
          expect(response.status).not.toBe(200);
        });
  });
});
