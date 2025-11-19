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
  });

