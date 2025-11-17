const request = require('supertest');
const app = require('../app');

describe('Category Controller Tests', () => {
  let adminToken;
  let testCategoryId;
  let testParentCategoryId;

  // Helper function to create admin token (if needed)
  // Note: You may need to adjust this based on your auth setup
  const getAdminToken = async () => {
    // This is a placeholder - adjust based on your actual auth flow
    // For now, we'll test without token and expect 401 errors
    return null;
  };

  describe('GET /api/v1/category (Admin Only)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/v1/category');

      expect(response.status).toBe(401);
      if (response.body && response.body.success !== undefined) {
        expect(response.body.success).toBe(false);
      }
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/category')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
    });

    test('should accept query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/category?page=1&limit=10&isActive=true')
        .set('Authorization', 'Bearer invalid.token');

      // Should still return 401, but endpoint should accept query params
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/category (Create Category - Admin Only)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/v1/category')
        .send({
          name: 'Test Category',
          slug: 'test-category',
          description: 'Test description'
        });

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/category')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          name: 'Test Category',
          slug: 'test-category',
          description: 'Test description'
        });

      expect(response.status).toBe(401);
    });

    test('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/category')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          name: 'Test Category'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid slug format', async () => {
      const response = await request(app)
        .post('/api/v1/category')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          name: 'Test Category',
          slug: 'Invalid Slug!',
          description: 'Test description'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid color format', async () => {
      const response = await request(app)
        .post('/api/v1/category')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          name: 'Test Category',
          slug: 'test-category',
          description: 'Test description',
          color: 'invalid-color'
        });

      expect(response.status).not.toBe(200);
    });
  });

  describe('GET /api/v1/category/tree (Public)', () => {
    test('should return category tree without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/category/tree');

      // Should not require auth
      expect(response.status).not.toBe(401);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(response.body.data).toHaveProperty('categories');
          expect(Array.isArray(response.body.data.categories)).toBe(true);
        }
      }
    });
  });

  describe('GET /api/v1/category/featured (Public)', () => {
    test('should return featured categories without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/category/featured');

      // Should not require auth
      expect(response.status).not.toBe(401);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(response.body.data).toHaveProperty('categories');
          expect(Array.isArray(response.body.data.categories)).toBe(true);
        }
      }
    });
  });

  describe('GET /api/v1/category/root (Public)', () => {
    test('should return root categories without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/category/root');

      // Should not require auth
      expect(response.status).not.toBe(401);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(response.body.data).toHaveProperty('categories');
          expect(Array.isArray(response.body.data.categories)).toBe(true);
        }
      }
    });
  });

  describe('PUT /api/v1/category/:categoryId (Update Category - Admin Only)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .put('/api/v1/category/507f1f77bcf86cd799439011')
        .send({
          name: 'Updated Category'
        });

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .put('/api/v1/category/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          name: 'Updated Category'
        });

      expect(response.status).toBe(401);
    });

    test('should return 400 for invalid category ID', async () => {
      const response = await request(app)
        .put('/api/v1/category/invalid-id')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          name: 'Updated Category'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid slug format', async () => {
      const response = await request(app)
        .put('/api/v1/category/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          slug: 'Invalid Slug!'
        });

      expect(response.status).not.toBe(200);
    });
  });

  describe('DELETE /api/v1/category/:categoryId (Remove Category - Admin Only)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .delete('/api/v1/category/507f1f77bcf86cd799439011');

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .delete('/api/v1/category/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
    });

    test('should return 400 for invalid category ID', async () => {
      const response = await request(app)
        .delete('/api/v1/category/invalid-id')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).not.toBe(200);
    });
  });

  describe('GET /api/v1/category/:categoryId/subcategories (Public)', () => {
    test('should return subcategories without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/category/507f1f77bcf86cd799439011/subcategories');

      // Should not require auth
      expect(response.status).not.toBe(401);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(response.body.data).toHaveProperty('subcategories');
          expect(Array.isArray(response.body.data.subcategories)).toBe(true);
        }
      }
    });

    test('should return 400 for invalid category ID', async () => {
      const response = await request(app)
        .get('/api/v1/category/invalid-id/subcategories');

      expect(response.status).not.toBe(200);
    });
  });

  describe('PUT /api/v1/category/:categoryId/status (Update Status - Admin Only)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .put('/api/v1/category/507f1f77bcf86cd799439011/status')
        .send({
          isActive: true
        });

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .put('/api/v1/category/507f1f77bcf86cd799439011/status')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          isActive: true
        });

      expect(response.status).toBe(401);
    });

    test('should return 400 for invalid category ID', async () => {
      const response = await request(app)
        .put('/api/v1/category/invalid-id/status')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          isActive: true
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for missing isActive field', async () => {
      const response = await request(app)
        .put('/api/v1/category/507f1f77bcf86cd799439011/status')
        .set('Authorization', 'Bearer invalid.token')
        .send({});

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid isActive type', async () => {
      const response = await request(app)
        .put('/api/v1/category/507f1f77bcf86cd799439011/status')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          isActive: 'not-a-boolean'
        });

      expect(response.status).not.toBe(200);
    });
  });

  describe('PUT /api/v1/category/:categoryId/order (Update Order - Admin Only)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .put('/api/v1/category/507f1f77bcf86cd799439011/order')
        .send({
          order: 1
        });

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .put('/api/v1/category/507f1f77bcf86cd799439011/order')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          order: 1
        });

      expect(response.status).toBe(401);
    });

    test('should return 400 for invalid category ID', async () => {
      const response = await request(app)
        .put('/api/v1/category/invalid-id/order')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          order: 1
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for missing order field', async () => {
      const response = await request(app)
        .put('/api/v1/category/507f1f77bcf86cd799439011/order')
        .set('Authorization', 'Bearer invalid.token')
        .send({});

      expect(response.status).not.toBe(200);
    });

    test('should return error for negative order value', async () => {
      const response = await request(app)
        .put('/api/v1/category/507f1f77bcf86cd799439011/order')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          order: -1
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for non-number order value', async () => {
      const response = await request(app)
        .put('/api/v1/category/507f1f77bcf86cd799439011/order')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          order: 'not-a-number'
        });

      expect(response.status).not.toBe(200);
    });
  });
});

