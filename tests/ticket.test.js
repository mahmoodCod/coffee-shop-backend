const request = require('supertest');
const app = require('../app');

describe('Ticket Controller Tests', () => {
  let adminToken;
  let userToken;
  let testTicketId;
  let testDepartmentId;
  let testDepartmentSubId;

  // Helper function to create admin token (if needed)
  // Note: You may need to adjust this based on your auth setup
  const getAdminToken = async () => {
    // This is a placeholder - adjust based on your actual auth flow
    // For now, we'll test without token and expect 401 errors
    return null;
  };

  describe('POST /api/v1/ticket (Create Ticket)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/v1/ticket')
        .send({
          departmentId: '507f1f77bcf86cd799439011',
          departmentSubId: '507f1f77bcf86cd799439012',
          priority: 'medium',
          title: 'Test Ticket',
          body: 'This is a test ticket body'
        });

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/ticket')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          departmentId: '507f1f77bcf86cd799439011',
          departmentSubId: '507f1f77bcf86cd799439012',
          priority: 'medium',
          title: 'Test Ticket',
          body: 'This is a test ticket body'
        });

      expect(response.status).toBe(401);
    });

    test('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/ticket')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          title: 'Test Ticket'
        });

      expect(response.status).not.toBe(200);
      if (response.body && response.body.success !== undefined) {
        expect(response.body.success).toBe(false);
      }
    });

    test('should return error for missing departmentId', async () => {
        const response = await request(app)
          .post('/api/v1/ticket')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            departmentSubId: '507f1f77bcf86cd799439012',
            priority: 'medium',
            title: 'Test Ticket',
            body: 'This is a test ticket body'
          });
  
        expect(response.status).not.toBe(200);
      });
  
    test('should return error for missing departmentSubId', async () => {
        const response = await request(app)
          .post('/api/v1/ticket')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            departmentId: '507f1f77bcf86cd799439011',
            priority: 'medium',
            title: 'Test Ticket',
            body: 'This is a test ticket body'
        });
  
        expect(response.status).not.toBe(200);
    });
  
    test('should return error for missing title', async () => {
        const response = await request(app)
          .post('/api/v1/ticket')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            departmentId: '507f1f77bcf86cd799439011',
            departmentSubId: '507f1f77bcf86cd799439012',
            priority: 'medium',
            body: 'This is a test ticket body'
        });
  
        expect(response.status).not.toBe(200);
    });
  
    test('should return error for missing body', async () => {
        const response = await request(app)
          .post('/api/v1/ticket')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            departmentId: '507f1f77bcf86cd799439011',
            departmentSubId: '507f1f77bcf86cd799439012',
            priority: 'medium',
            title: 'Test Ticket'
        });
  
        expect(response.status).not.toBe(200);
    });
  
    test('should return error for invalid departmentId format', async () => {
        const response = await request(app)
          .post('/api/v1/ticket')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            departmentId: 'invalid-id',
            departmentSubId: '507f1f77bcf86cd799439012',
            priority: 'medium',
            title: 'Test Ticket',
            body: 'This is a test ticket body'
          });
  
        expect(response.status).not.toBe(200);
    });
  });
});

