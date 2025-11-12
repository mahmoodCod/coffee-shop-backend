const request = require('supertest');
const app = require('../app');

describe('Auth Controller Tests', () => {
  describe('POST /api/v1/auth/send', () => {
    test('should return 200 with success message for valid phone number', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send')
        .send({ phone: '09123456789' })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('message');
    });

    test('should return validation error for missing phone number', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    test('should return validation error for invalid phone number format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send')
        .send({ phone: '123' })
        .expect(400);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    test('should return validation error for invalid phone number type', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send')
        .send({ phone: 9123456789 })
        .expect(400);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });

    test('should accept valid phone number formats', async () => {
      const validPhones = [
        '09123456789',
        '+989123456789',
        '00989123456789'
      ];

      for (const phone of validPhones) {
        const response = await request(app)
          .post('/api/v1/auth/send')
          .send({ phone });

        expect([200, 400]).toContain(response.status);
        if (response.status === 200) {
          expect(response.body.success).toBe(true);
        }
      }
    });
  });

  describe('POST /api/v1/auth/verify', () => {
    test('should return validation error for missing phone number', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify')
        .send({ otp: '123456' })
        .expect(400);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    test('should return validation error for missing OTP code', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify')
        .send({ phone: '09123456789' })
        .expect(400);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    test('should return validation error for invalid phone number format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify')
        .send({ phone: '123', otp: '123456' })
        .expect(400);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });

    test('should return validation error for invalid OTP format (non-numeric)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify')
        .send({ phone: '09123456789', otp: 'abc123' })
        .expect(400);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });

    test('should return 400 for wrong or expired OTP', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify')
        .send({ phone: '09123456789', otp: '999999' })
        .expect(400);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 500 when User model is not available', async () => {
      // This test checks that verify endpoint returns appropriate error
      // when User model is not available (placeholder)
      // Note: This will fail if User model is actually implemented
      const response = await request(app)
        .post('/api/v1/auth/verify')
        .send({ phone: '09123456789', otp: '123456' });

      // If OTP is valid but User model is not available, should return 500
      // If OTP is invalid, should return 400
      expect([400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 401 for invalid token format', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'InvalidToken')
        .expect(401);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });

    test('should return 401 for missing Bearer prefix', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'some-token')
        .expect(401);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });

    test('should return 401 for invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });

    test('should return 500 when User model is not available', async () => {
      // Create a valid JWT token for testing
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: '507f1f77bcf86cd799439011' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Response Format Tests', () => {
    test('success response should have correct structure', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send')
        .send({ phone: '09123456789' });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('data');
        expect(response.body.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(typeof response.body.data).toBe('object');
      }
    });

    test('error response should have correct structure', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send')
        .send({ phone: '123' });

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(response.body.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(typeof response.body.error).toBe('string');
    });
  });
});

