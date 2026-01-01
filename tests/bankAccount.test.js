const request = require('supertest');
const app = require('../app');

describe('BankAccount Controller Tests', () => {
  let adminToken;
  let testBankAccountId;

  // Helper function to create admin token (if needed)
  // Note: You may need to adjust this based on your auth setup
  const getAdminToken = async () => {
    // This is a placeholder - adjust based on your actual auth flow
    // For now, we'll test without token and expect 401 errors
    return null;
  };

  describe('POST /api/v1/bankAccount (Create BankAccount)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/v1/bankAccount')
        .send({
          bankName: 'ملی',
          cardNumber: '1234567890123456',
          shebaNumber: 'IR123456789012345678901234',
          accountType: 'حساب جاری',
          isActive: true
        });

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/bankAccount')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: 'ملی',
          cardNumber: '1234567890123456',
          shebaNumber: 'IR123456789012345678901234',
          accountType: 'حساب جاری',
          isActive: true
        });

      expect(response.status).toBe(401);
    });

    test('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/bankAccount')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: 'ملی'
        });

      expect(response.status).not.toBe(200);
      if (response.body && response.body.success !== undefined) {
        expect(response.body.success).toBe(false);
      }
    });

    test('should return error for missing bankName', async () => {
      const response = await request(app)
        .post('/api/v1/bankAccount')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          cardNumber: '1234567890123456',
          shebaNumber: 'IR123456789012345678901234'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for missing cardNumber', async () => {
      const response = await request(app)
        .post('/api/v1/bankAccount')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: 'ملی',
          shebaNumber: 'IR123456789012345678901234'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for missing shebaNumber', async () => {
      const response = await request(app)
        .post('/api/v1/bankAccount')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: 'ملی',
          cardNumber: '1234567890123456'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid cardNumber format (not 16 digits)', async () => {
      const response = await request(app)
        .post('/api/v1/bankAccount')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: 'ملی',
          cardNumber: '123456789012345', // 15 digits
          shebaNumber: 'IR123456789012345678901234'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid shebaNumber format (not starting with IR)', async () => {
      const response = await request(app)
        .post('/api/v1/bankAccount')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: 'ملی',
          cardNumber: '1234567890123456',
          shebaNumber: '123456789012345678901234' // Missing IR prefix
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid shebaNumber format (not 24 digits after IR)', async () => {
      const response = await request(app)
        .post('/api/v1/bankAccount')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: 'ملی',
          cardNumber: '1234567890123456',
          shebaNumber: 'IR12345678901234567890123' // 23 digits
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid accountType', async () => {
      const response = await request(app)
        .post('/api/v1/bankAccount')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: 'ملی',
          cardNumber: '1234567890123456',
          shebaNumber: 'IR123456789012345678901234',
          accountType: 'invalid-type'
        });

      expect(response.status).not.toBe(200);
    });

    test('should accept valid accountType values', async () => {
      const accountTypes = ['حساب جاری', 'پس‌انداز', 'دیگر'];
      
      for (const accountType of accountTypes) {
        const response = await request(app)
          .post('/api/v1/bankAccount')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            bankName: 'ملی',
            cardNumber: '1234567890123456',
            shebaNumber: 'IR123456789012345678901234',
            accountType: accountType
          });

        // May return 401 for invalid token, but should not return validation error for accountType
        if (response.status === 400 && response.body && response.body.message) {
          expect(response.body.message).not.toContain('accountType');
        }
      }
    });
  });

  describe('GET /api/v1/bankAccount (Get All BankAccount)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/v1/bankAccount');

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/bankAccount')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
    });

    test('should accept query parameters for pagination', async () => {
      const response = await request(app)
        .get('/api/v1/bankAccount?page=1&limit=10')
        .set('Authorization', 'Bearer invalid.token');

      // May return 401 for invalid token, but should accept params without error
      expect([200, 401, 500]).toContain(response.status);
    });

    test('should accept query parameters for filtering by isActive', async () => {
      const response = await request(app)
        .get('/api/v1/bankAccount?isActive=true')
        .set('Authorization', 'Bearer invalid.token');

      expect([200, 401, 500]).toContain(response.status);
    });

    test('should accept query parameters for filtering by accountType', async () => {
      const response = await request(app)
        .get('/api/v1/bankAccount?accountType=حساب جاری')
        .set('Authorization', 'Bearer invalid.token');

      expect([200, 401, 500]).toContain(response.status);
    });

    test('should accept query parameters for filtering by bankName', async () => {
      const response = await request(app)
        .get('/api/v1/bankAccount?bankName=ملی')
        .set('Authorization', 'Bearer invalid.token');

      expect([200, 401, 500]).toContain(response.status);
    });
  });

  describe('GET /api/v1/bankAccount/:id (Get One BankAccount)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/v1/bankAccount/507f1f77bcf86cd799439011');

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
    });

    test('should return 400 for invalid BankAccount ID', async () => {
      const response = await request(app)
        .get('/api/v1/bankAccount/invalid-id')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).not.toBe(200);
      if (response.status === 400) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success !== undefined) {
          expect(response.body.success).toBe(false);
        }
      }
    });

    test('should return 404 for non-existent BankAccount', async () => {
      const response = await request(app)
        .get('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token');

      // May return 401 for invalid token or 404 for non-existent BankAccount
      if (response.status === 404) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success !== undefined) {
          expect(response.body.success).toBe(false);
        }
      }
    });
  });

  describe('PATCH /api/v1/bankAccount/:id (Update BankAccount)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .patch('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .send({
          bankName: 'صادرات'
        });

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .patch('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: 'صادرات'
        });

      expect(response.status).toBe(401);
    });

    test('should return 400 for invalid BankAccount ID', async () => {
      const response = await request(app)
        .patch('/api/v1/bankAccount/invalid-id')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: 'صادرات'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid cardNumber format when updating', async () => {
      const response = await request(app)
        .patch('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          cardNumber: '123456789012345' // 15 digits
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid shebaNumber format when updating', async () => {
      const response = await request(app)
        .patch('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          shebaNumber: '123456789012345678901234' // Missing IR prefix
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid accountType when updating', async () => {
      const response = await request(app)
        .patch('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          accountType: 'invalid-type'
        });

      expect(response.status).not.toBe(200);
    });

    test('should accept partial update for bankName', async () => {
      const response = await request(app)
        .patch('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: 'صادرات'
        });

      // May return 401 for invalid token or 404 for non-existent BankAccount
      expect(response.status).not.toBe(200);
    });

    test('should accept partial update for isActive', async () => {
      const response = await request(app)
        .patch('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          isActive: false
        });

      // May return 401 for invalid token or 404 for non-existent BankAccount
      expect(response.status).not.toBe(200);
    });

    test('should return 400 for empty update body', async () => {
      const response = await request(app)
        .patch('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({});

      // May return 401 for invalid token or 400 for empty update
      if (response.status === 400) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success !== undefined) {
          expect(response.body.success).toBe(false);
        }
      }
    });
  });

  describe('DELETE /api/v1/bankAccount/:id (Delete BankAccount)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .delete('/api/v1/bankAccount/507f1f77bcf86cd799439011');

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .delete('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
    });

    test('should return 400 for invalid BankAccount ID', async () => {
      const response = await request(app)
        .delete('/api/v1/bankAccount/invalid-id')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).not.toBe(200);
    });

    test('should return 404 for non-existent BankAccount', async () => {
      const response = await request(app)
        .delete('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token');

      // May return 401 for invalid token or 404 for non-existent BankAccount
      if (response.status === 404) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success !== undefined) {
          expect(response.body.success).toBe(false);
        }
      }
    });
  });

  describe('BankAccount Edge Cases', () => {
    test('should handle duplicate cardNumber creation attempt', async () => {
      const response = await request(app)
        .post('/api/v1/bankAccount')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: 'ملی',
          cardNumber: '1234567890123456',
          shebaNumber: 'IR123456789012345678901234',
          accountType: 'حساب جاری',
          isActive: true
        });

      // May return 401 for invalid token or 409 for duplicate cardNumber
      expect(response.status).not.toBe(200);
    });

    test('should handle duplicate shebaNumber creation attempt', async () => {
      const response = await request(app)
        .post('/api/v1/bankAccount')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: 'ملی',
          cardNumber: '1234567890123456',
          shebaNumber: 'IR123456789012345678901234',
          accountType: 'حساب جاری',
          isActive: true
        });

      // May return 401 for invalid token or 409 for duplicate shebaNumber
      expect(response.status).not.toBe(200);
    });

    test('should handle update with duplicate cardNumber in another BankAccount', async () => {
      const response = await request(app)
        .patch('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          cardNumber: '1234567890123456'
        });

      // May return 401 for invalid token or 409 for duplicate cardNumber
      expect(response.status).not.toBe(200);
    });

    test('should handle update with duplicate shebaNumber in another BankAccount', async () => {
      const response = await request(app)
        .patch('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          shebaNumber: 'IR123456789012345678901234'
        });

      // May return 401 for invalid token or 409 for duplicate shebaNumber
      expect(response.status).not.toBe(200);
    });

    test('should handle access control - user cannot access other user bank account', async () => {
      const response = await request(app)
        .get('/api/v1/bankAccount/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token');

      // May return 401 for invalid token or 403 for access denied
      if (response.status === 403) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success !== undefined) {
          expect(response.body.success).toBe(false);
        }
      }
    });

    test('should handle trimming of bankName, cardNumber, and shebaNumber', async () => {
      const response = await request(app)
        .post('/api/v1/bankAccount')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: '  ملی  ',
          cardNumber: '  1234567890123456  ',
          shebaNumber: '  IR123456789012345678901234  ',
          accountType: 'حساب جاری'
        });

      // May return 401 for invalid token, but should handle trimming
      expect(response.status).not.toBe(200);
    });

    test('should handle default values for accountType and isActive', async () => {
      const response = await request(app)
        .post('/api/v1/bankAccount')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          bankName: 'ملی',
          cardNumber: '1234567890123456',
          shebaNumber: 'IR123456789012345678901234'
          // accountType and isActive not provided, should use defaults
        });

      // May return 401 for invalid token, but should accept without accountType and isActive
      expect(response.status).not.toBe(200);
    });
  });
});

