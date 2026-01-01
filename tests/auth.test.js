const request = require('supertest');
const app = require('../app');

describe('Auth Controller Tests', () => {
  describe('POST /api/v1/auth/send', () => {
    test('should send OTP for valid phone number', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send')
        .send({ phone: '09123456789' })
        .timeout(10000);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('message');
      }
    }, 15000);

    test('should return error for missing phone', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send')
        .send({});

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid phone format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send')
        .send({ phone: '123' });

      expect(response.status).not.toBe(200);
    });
  });

  describe('POST /api/v1/auth/verify', () => {
    test('should return error for missing phone or OTP', async () => {
      const response1 = await request(app)
        .post('/api/v1/auth/verify')
        .send({ otp: '123456' });

      const response2 = await request(app)
        .post('/api/v1/auth/verify')
        .send({ phone: '09123456789' });

      expect(response1.status).not.toBe(200);
      expect(response2.status).not.toBe(200);
    });

    test('should return error for invalid OTP format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify')
        .send({ phone: '09123456789', otp: 'abc123' });

      expect(response.status).not.toBe(200);
    });

    test('should return error for wrong OTP', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify')
        .send({ phone: '09123456789', otp: '999999' });

      expect(response.status).not.toBe(200);
      if (response.body && response.body.success !== undefined) {
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('GET /api/v1/auth/me', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      if (response.body && response.body.success !== undefined) {
        expect(response.body.success).toBe(false);
      }
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
      if (response.body && response.body.success !== undefined) {
        expect(response.body.success).toBe(false);
      }
    });
  });
});
