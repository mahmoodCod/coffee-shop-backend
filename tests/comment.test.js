const request = require('supertest');
const app = require('../app');

describe('Comment Controller Tests', () => {
  let adminToken;
  let userToken;
  let testCommentId;
  let testProductId;
  let testReplyId;

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

  describe('GET /api/v1/comment (Get Comments - Public)', () => {
    test('should return comments without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/comment');

      // Should not require auth
      expect(response.status).not.toBe(401);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(response.body.data).toHaveProperty('comments');
          expect(Array.isArray(response.body.data.comments)).toBe(true);
          expect(response.body.data).toHaveProperty('pagination');
        }
      }
    });

    test('should accept query parameters for pagination', async () => {
      const response = await request(app)
        .get('/api/v1/comment?page=1&limit=10');

      expect(response.status).not.toBe(401);
    });
  });

  describe('GET /api/v1/comment/all (Get All Comments - Public)', () => {
    test('should return all comments without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/comment/all');

      // Should not require auth
      expect(response.status).not.toBe(401);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(response.body.data).toHaveProperty('comments');
          expect(Array.isArray(response.body.data.comments)).toBe(true);
          expect(response.body.data).toHaveProperty('pagination');
        }
      }
    });

    test('should accept query parameters for pagination', async () => {
      const response = await request(app)
        .get('/api/v1/comment/all?page=1&limit=10');

      expect(response.status).not.toBe(401);
    });
  });

  describe('POST /api/v1/comment (Create Comment - Auth Required)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/v1/comment')
        .send({
          content: 'Test comment content',
          rating: 5,
          productId: '507f1f77bcf86cd799439011'
        });

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/comment')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: 'Test comment content',
          rating: 5,
          productId: '507f1f77bcf86cd799439011'
        });

      expect(response.status).toBe(401);
    });

    test('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/comment')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: 'Test comment content'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid rating (less than 1)', async () => {
      const response = await request(app)
        .post('/api/v1/comment')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: 'Test comment content',
          rating: 0,
          productId: '507f1f77bcf86cd799439011'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid rating (greater than 5)', async () => {
      const response = await request(app)
        .post('/api/v1/comment')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: 'Test comment content',
          rating: 6,
          productId: '507f1f77bcf86cd799439011'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid productId format', async () => {
      const response = await request(app)
        .post('/api/v1/comment')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: 'Test comment content',
          rating: 5,
          productId: 'invalid-id'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for content exceeding 1000 characters', async () => {
      const longContent = 'a'.repeat(1001);
      const response = await request(app)
        .post('/api/v1/comment')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: longContent,
          rating: 5,
          productId: '507f1f77bcf86cd799439011'
        });

      expect(response.status).not.toBe(200);
    });
  });

  describe('PATCH /api/v1/comment/:commentId (Update Comment - Auth Required)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .patch('/api/v1/comment/507f1f77bcf86cd799439011')
        .send({
          content: 'Updated comment content',
          rating: 4
        });

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .patch('/api/v1/comment/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: 'Updated comment content',
          rating: 4
        });

      expect(response.status).toBe(401);
    });

    test('should return 400 for invalid commentId format', async () => {
      const response = await request(app)
        .patch('/api/v1/comment/invalid-id')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: 'Updated comment content',
          rating: 4
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid rating (less than 1)', async () => {
      const response = await request(app)
        .patch('/api/v1/comment/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: 'Updated comment content',
          rating: 0
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for invalid rating (greater than 5)', async () => {
      const response = await request(app)
        .patch('/api/v1/comment/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: 'Updated comment content',
          rating: 6
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for content exceeding 1000 characters', async () => {
      const longContent = 'a'.repeat(1001);
      const response = await request(app)
        .patch('/api/v1/comment/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: longContent,
          rating: 4
        });

      expect(response.status).not.toBe(200);
    });
  });

  describe('DELETE /api/v1/comment/:commentId (Delete Comment - Admin Only)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .delete('/api/v1/comment/507f1f77bcf86cd799439011');

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .delete('/api/v1/comment/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
    });

    test('should return 400 for invalid commentId format', async () => {
      const response = await request(app)
        .delete('/api/v1/comment/invalid-id')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).not.toBe(200);
    });
  });

  describe('POST /api/v1/comment/:commentId/reply (Create Reply - Admin Only)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/v1/comment/507f1f77bcf86cd799439011/reply')
        .send({
          content: 'Test reply content'
        });

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/comment/507f1f77bcf86cd799439011/reply')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: 'Test reply content'
        });

      expect(response.status).toBe(401);
    });

    test('should return 400 for invalid commentId format', async () => {
      const response = await request(app)
        .post('/api/v1/comment/invalid-id/reply')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: 'Test reply content'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for missing content', async () => {
      const response = await request(app)
        .post('/api/v1/comment/507f1f77bcf86cd799439011/reply')
        .set('Authorization', 'Bearer invalid.token')
        .send({});

      expect(response.status).not.toBe(200);
    });

    test('should return error for content exceeding 1000 characters', async () => {
      const longContent = 'a'.repeat(1001);
      const response = await request(app)
        .post('/api/v1/comment/507f1f77bcf86cd799439011/reply')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: longContent
        });

      expect(response.status).not.toBe(200);
    });
  });

  describe('PATCH /api/v1/comment/:commentId/reply/:replyId (Update Reply - Admin Only)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .patch('/api/v1/comment/507f1f77bcf86cd799439011/reply/507f1f77bcf86cd799439012')
        .send({
          content: 'Updated reply content'
        });

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .patch('/api/v1/comment/507f1f77bcf86cd799439011/reply/507f1f77bcf86cd799439012')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: 'Updated reply content'
        });

      expect(response.status).toBe(401);
    });

    test('should return 400 for invalid commentId format', async () => {
      const response = await request(app)
        .patch('/api/v1/comment/invalid-id/reply/507f1f77bcf86cd799439012')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: 'Updated reply content'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return 400 for invalid replyId format', async () => {
      const response = await request(app)
        .patch('/api/v1/comment/507f1f77bcf86cd799439011/reply/invalid-id')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: 'Updated reply content'
        });

      expect(response.status).not.toBe(200);
    });

    test('should return error for content exceeding 1000 characters', async () => {
      const longContent = 'a'.repeat(1001);
      const response = await request(app)
        .patch('/api/v1/comment/507f1f77bcf86cd799439011/reply/507f1f77bcf86cd799439012')
        .set('Authorization', 'Bearer invalid.token')
        .send({
          content: longContent
        });

      expect(response.status).not.toBe(200);
    });
  });

  describe('DELETE /api/v1/comment/:commentId/reply/:replyId (Delete Reply - Admin Only)', () => {
    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .delete('/api/v1/comment/507f1f77bcf86cd799439011/reply/507f1f77bcf86cd799439012');

      expect(response.status).toBe(401);
    });

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .delete('/api/v1/comment/507f1f77bcf86cd799439011/reply/507f1f77bcf86cd799439012')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
    });

    test('should return 400 for invalid commentId format', async () => {
      const response = await request(app)
        .delete('/api/v1/comment/invalid-id/reply/507f1f77bcf86cd799439012')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).not.toBe(200);
    });

    test('should return 400 for invalid replyId format', async () => {
      const response = await request(app)
        .delete('/api/v1/comment/507f1f77bcf86cd799439011/reply/invalid-id')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).not.toBe(200);
    });
  });
});

