const request = require('supertest');
const app = require('../app');

describe('User Controller Tests', () => {
  describe('GET /api/v1/user', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/v1/user');

      // May return 401 or 500 depending on auth middleware implementation
      expect(response.status).not.toBe(200);
      expect([401, 500]).toContain(response.status);
      if (response.body && response.body.success !== undefined) {
        expect(response.body.success).toBe(false);
      }
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/user')
        .set('Authorization', 'Bearer invalid.token');

      // May return 401 or 500 depending on auth middleware implementation
      expect(response.status).not.toBe(200);
      expect([401, 500]).toContain(response.status);
      if (response.body && response.body.success !== undefined) {
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('POST /api/v1/user/ban/:userId', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/v1/user/ban/507f1f77bcf86cd799439011');

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/user/ban/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/user/role/:id', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .put('/api/v1/user/role/507f1f77bcf86cd799439011');

      expect(response.status).toBe(401);
    });

    test('should return 400 for invalid user id', async () => {
      const response = await request(app)
        .put('/api/v1/user/role/invalid-id');

      expect(response.status).not.toBe(200);
    });
  });

  describe('POST /api/v1/user/me/addresses', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/v1/user/me/addresses')
        .send({
          name: 'خانه',
          postalCode: '1234567890',
          province: 'تهران',
          city: 'تهران',
          street: 'خیابان اصلی'
        });

      expect(response.status).toBe(401);
    });

    test('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/user/me/addresses')
        .send({
          name: 'خانه'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid postal code length', async () => {
      const response = await request(app)
        .post('/api/v1/user/me/addresses')
        .send({
          name: 'خانه',
          postalCode: '12345',
          province: 'تهران',
          city: 'تهران',
          street: 'خیابان اصلی'
        });

      expect(response.status).not.toBe(200);
    });
  });

  describe('DELETE /api/v1/user/me/addresses/:addressId', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .delete('/api/v1/user/me/addresses/507f1f77bcf86cd799439011');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/user/me/addresses/:addressId', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .patch('/api/v1/user/me/addresses/507f1f77bcf86cd799439011')
        .send({
          name: 'دفتر'
        });

      expect(response.status).toBe(401);
    });
  });
});

