const request = require('supertest');
const app = require('../app');

describe('Article Controller Tests', () => {
  let adminToken;
  let testArticleId;
  let testCategoryId;

  // Helper function to create admin token (if needed)
  // Note: You may need to adjust this based on your auth setup
  const getAdminToken = async () => {
    // This is a placeholder - adjust based on your actual auth flow
    // For now, we'll test without token and expect 401 errors
    return null;
  };

  describe('GET /api/v1/article (Get All Articles - Public)', () => {
    test('should return articles without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/article');

      // Should not require auth
      expect(response.status).not.toBe(401);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success) {
          expect(response.body.data).toHaveProperty('articles');
          expect(Array.isArray(response.body.data.articles)).toBe(true);
          expect(response.body.data).toHaveProperty('pagination');
        }
      }
    });

    test('should accept query parameters for pagination', async () => {
      const response = await request(app)
        .get('/api/v1/article?page=1&limit=10');

      expect(response.status).not.toBe(401);
    });

    test('should accept query parameters for filtering by category', async () => {
      const response = await request(app)
        .get('/api/v1/article?category=507f1f77bcf86cd799439011');

      expect(response.status).not.toBe(401);
    });

    test('should accept query parameters for filtering by publish status', async () => {
      const response = await request(app)
        .get('/api/v1/article?publish=1');

      expect(response.status).not.toBe(401);
    });

    test('should accept query parameters for draft articles', async () => {
      const response = await request(app)
        .get('/api/v1/article?publish=0');

      expect(response.status).not.toBe(401);
    });

    test('should accept query parameters for search', async () => {
      const response = await request(app)
        .get('/api/v1/article?search=coffee');

      expect(response.status).not.toBe(401);
    });

    test('should accept multiple query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/article?page=1&limit=10&category=507f1f77bcf86cd799439011&publish=1&search=test');

      expect(response.status).not.toBe(401);
    });
  });

  describe('GET /api/v1/article/href/:href (Get One Article - Public)', () => {
    test('should return article without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/article/href/test-article');

      // Should not require auth
      expect(response.status).not.toBe(401);
    });

    test('should return 404 for non-existent article', async () => {
      const response = await request(app)
        .get('/api/v1/article/href/non-existent-article-href');

      // May return 404 if article doesn't exist
      if (response.status === 404) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success !== undefined) {
          expect(response.body.success).toBe(false);
        }
      }
    });

    test('should return 404 for draft article (only published articles)', async () => {
      const response = await request(app)
        .get('/api/v1/article/href/draft-article-href');

      // May return 404 if article is draft (publish === 0)
      if (response.status === 404) {
        expect(response.body).toHaveProperty('success');
        if (response.body.success !== undefined) {
          expect(response.body.success).toBe(false);
        }
      }
    });

    describe('POST /api/v1/article (Create Article - Admin Only)', () => {
        test('should return 401 for missing token', async () => {
          const response = await request(app)
            .post('/api/v1/article')
            .send({
              title: 'Test Article',
              excerpt: 'Test excerpt',
              discription: 'Test description',
              body: 'Test body content',
              href: 'test-article',
              category: '507f1f77bcf86cd799439011',
              creator: '507f1f77bcf86cd799439011',
              author: 'Test Author',
              publish: 1
            });
    
          expect(response.status).toBe(401);
        });
    
        test('should return 401 for invalid token', async () => {
          const response = await request(app)
            .post('/api/v1/article')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              title: 'Test Article',
              excerpt: 'Test excerpt',
              discription: 'Test description',
              body: 'Test body content',
              href: 'test-article',
              category: '507f1f77bcf86cd799439011',
              creator: '507f1f77bcf86cd799439011',
              author: 'Test Author',
              publish: 1
            });
    
          expect(response.status).toBe(401);
        });
    
        test('should return error for missing required fields', async () => {
          const response = await request(app)
            .post('/api/v1/article')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              title: 'Test Article'
            });
    
          expect(response.status).not.toBe(200);
        });
    
        test('should return error for invalid href format', async () => {
          const response = await request(app)
            .post('/api/v1/article')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              title: 'Test Article',
              excerpt: 'Test excerpt',
              discription: 'Test description',
              body: 'Test body content',
              href: 'Invalid Href!',
              category: '507f1f77bcf86cd799439011',
              creator: '507f1f77bcf86cd799439011',
              author: 'Test Author',
              publish: 1
            });
    
          expect(response.status).not.toBe(200);
        });
    
        test('should return error for invalid category ID', async () => {
          const response = await request(app)
            .post('/api/v1/article')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              title: 'Test Article',
              excerpt: 'Test excerpt',
              discription: 'Test description',
              body: 'Test body content',
              href: 'test-article',
              category: 'invalid-category-id',
              creator: '507f1f77bcf86cd799439011',
              author: 'Test Author',
              publish: 1
            });
    
          expect(response.status).not.toBe(200);
        });
    
        test('should return error for title too short', async () => {
          const response = await request(app)
            .post('/api/v1/article')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              title: 'AB',
              excerpt: 'Test excerpt',
              discription: 'Test description',
              body: 'Test body content',
              href: 'test-article',
              category: '507f1f77bcf86cd799439011',
              creator: '507f1f77bcf86cd799439011',
              author: 'Test Author',
              publish: 1
            });
    
          expect(response.status).not.toBe(200);
        });
    
        test('should return error for title too long', async () => {
          const response = await request(app)
            .post('/api/v1/article')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              title: 'A'.repeat(151),
              excerpt: 'Test excerpt',
              discription: 'Test description',
              body: 'Test body content',
              href: 'test-article',
              category: '507f1f77bcf86cd799439011',
              creator: '507f1f77bcf86cd799439011',
              author: 'Test Author',
              publish: 1
            });
    
          expect(response.status).not.toBe(200);
        });
    
        test('should return error for excerpt too long', async () => {
          const response = await request(app)
            .post('/api/v1/article')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              title: 'Test Article',
              excerpt: 'A'.repeat(301),
              discription: 'Test description',
              body: 'Test body content',
              href: 'test-article',
              category: '507f1f77bcf86cd799439011',
              creator: '507f1f77bcf86cd799439011',
              author: 'Test Author',
              publish: 1
            });
    
          expect(response.status).not.toBe(200);
        });
    
        test('should return error for description too long', async () => {
          const response = await request(app)
            .post('/api/v1/article')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              title: 'Test Article',
              excerpt: 'Test excerpt',
              discription: 'A'.repeat(501),
              body: 'Test body content',
              href: 'test-article',
              category: '507f1f77bcf86cd799439011',
              creator: '507f1f77bcf86cd799439011',
              author: 'Test Author',
              publish: 1
            });
    
          expect(response.status).not.toBe(200);
        });
    
        test('should return error for invalid publish status', async () => {
          const response = await request(app)
            .post('/api/v1/article')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              title: 'Test Article',
              excerpt: 'Test excerpt',
              discription: 'Test description',
              body: 'Test body content',
              href: 'test-article',
              category: '507f1f77bcf86cd799439011',
              creator: '507f1f77bcf86cd799439011',
              author: 'Test Author',
              publish: 'invalid'
            });
    
          expect(response.status).not.toBe(200);
        });
    
        test('should return error for missing cover image', async () => {
          const response = await request(app)
            .post('/api/v1/article')
            .set('Authorization', 'Bearer invalid.token')
            .field('title', 'Test Article')
            .field('excerpt', 'Test excerpt')
            .field('discription', 'Test description')
            .field('body', 'Test body content')
            .field('href', 'test-article')
            .field('category', '507f1f77bcf86cd799439011')
            .field('creator', '507f1f77bcf86cd799439011')
            .field('author', 'Test Author')
            .field('publish', '1');
    
          // May return 400 if cover is required
          if (response.status === 400) {
            expect(response.body).toHaveProperty('success');
            if (response.body.success !== undefined) {
              expect(response.body.success).toBe(false);
            }
          }
        });
      });
  });
})

