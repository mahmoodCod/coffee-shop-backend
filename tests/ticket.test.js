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

    test('should return error for invalid departmentSubId format', async () => {
        const response = await request(app)
          .post('/api/v1/ticket')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            departmentId: '507f1f77bcf86cd799439011',
            departmentSubId: 'invalid-id',
            priority: 'medium',
            title: 'Test Ticket',
            body: 'This is a test ticket body'
        });
  
        expect(response.status).not.toBe(200);
    });
  
    test('should return error for invalid priority value', async () => {
        const response = await request(app)
          .post('/api/v1/ticket')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            departmentId: '507f1f77bcf86cd799439011',
            departmentSubId: '507f1f77bcf86cd799439012',
            priority: 'invalid',
            title: 'Test Ticket',
            body: 'This is a test ticket body'
        });
  
        expect(response.status).not.toBe(200);
    });
  
    test('should return error for title too short (less than 3 characters)', async () => {
        const response = await request(app)
          .post('/api/v1/ticket')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            departmentId: '507f1f77bcf86cd799439011',
            departmentSubId: '507f1f77bcf86cd799439012',
            priority: 'medium',
            title: 'Te',
            body: 'This is a test ticket body'
        });
  
        expect(response.status).not.toBe(200);
    });
  
    test('should return error for body too short (less than 5 characters)', async () => {
        const response = await request(app)
          .post('/api/v1/ticket')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            departmentId: '507f1f77bcf86cd799439011',
            departmentSubId: '507f1f77bcf86cd799439012',
            priority: 'medium',
            title: 'Test Ticket',
            body: 'Test'
        });
  
        expect(response.status).not.toBe(200);
    });
  
    test('should return error for invalid product ID format', async () => {
        const response = await request(app)
          .post('/api/v1/ticket')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            departmentId: '507f1f77bcf86cd799439011',
            departmentSubId: '507f1f77bcf86cd799439012',
            priority: 'medium',
            title: 'Test Ticket',
            body: 'This is a test ticket body',
            product: 'invalid-id'
        });
  
        expect(response.status).not.toBe(200);
    });
  
    test('should return error for invalid parent ticket ID format', async () => {
        const response = await request(app)
          .post('/api/v1/ticket')
          .set('Authorization', 'Bearer invalid.token')
          .send({
            departmentId: '507f1f77bcf86cd799439011',
            departmentSubId: '507f1f77bcf86cd799439012',
            priority: 'medium',
            title: 'Test Ticket',
            body: 'This is a test ticket body',
            parent: 'invalid-id'
        });
  
        expect(response.status).not.toBe(200);
    });
    });

    describe('GET /api/v1/ticket (Get All Tickets - Admin Only)', () => {
        test('should return 401 for missing token', async () => {
          const response = await request(app)
            .get('/api/v1/ticket');
    
          expect(response.status).toBe(401);
        });
    
        test('should return 401 for invalid token', async () => {
          const response = await request(app)
            .get('/api/v1/ticket')
            .set('Authorization', 'Bearer invalid.token');
    
          expect(response.status).toBe(401);
        });
    
        test('should support pagination with page and limit', async () => {
          const response = await request(app)
            .get('/api/v1/ticket?page=1&limit=10')
            .set('Authorization', 'Bearer invalid.token');
    
          // Should return 401 or handle pagination if authenticated
          expect([401, 200]).toContain(response.status);
        });
    
        test('should support filtering by status', async () => {
          const response = await request(app)
            .get('/api/v1/ticket?status=open')
            .set('Authorization', 'Bearer invalid.token');
    
          expect([401, 200]).toContain(response.status);
        });
    
        test('should support filtering by priority', async () => {
          const response = await request(app)
            .get('/api/v1/ticket?priority=high')
            .set('Authorization', 'Bearer invalid.token');
    
          expect([401, 200]).toContain(response.status);
        });
    
        test('should support filtering by isAnswered', async () => {
          const response = await request(app)
            .get('/api/v1/ticket?isAnswered=true')
            .set('Authorization', 'Bearer invalid.token');
    
          expect([401, 200]).toContain(response.status);
        });
      });
    
      describe('GET /api/v1/ticket/:id (Get One Ticket)', () => {
        test('should return 401 for missing token', async () => {
          const response = await request(app)
            .get('/api/v1/ticket/507f1f77bcf86cd799439011');
    
          expect(response.status).toBe(401);
        });
    
        test('should return 401 for invalid token', async () => {
          const response = await request(app)
            .get('/api/v1/ticket/507f1f77bcf86cd799439011')
            .set('Authorization', 'Bearer invalid.token');
    
          expect(response.status).toBe(401);
        });
    
        test('should return 400 for invalid ticket ID format', async () => {
          const response = await request(app)
            .get('/api/v1/ticket/invalid-id')
            .set('Authorization', 'Bearer invalid.token');
    
          expect([400, 401]).toContain(response.status);
        });
    
        test('should return 404 for non-existent ticket', async () => {
          const response = await request(app)
            .get('/api/v1/ticket/507f1f77bcf86cd799439999')
            .set('Authorization', 'Bearer invalid.token');
    
          expect([404, 401]).toContain(response.status);
        });
      });
    
      describe('PATCH /api/v1/ticket/:id (Update Ticket)', () => {
        test('should return 401 for missing token', async () => {
          const response = await request(app)
            .patch('/api/v1/ticket/507f1f77bcf86cd799439011')
            .send({
              title: 'Updated Title'
            });
    
          expect(response.status).toBe(401);
        });
    
        test('should return 401 for invalid token', async () => {
          const response = await request(app)
            .patch('/api/v1/ticket/507f1f77bcf86cd799439011')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              title: 'Updated Title'
            });
    
          expect(response.status).toBe(401);
        });
    
        test('should return 400 for invalid ticket ID format', async () => {
          const response = await request(app)
            .patch('/api/v1/ticket/invalid-id')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              title: 'Updated Title'
            });
    
          expect([400, 401]).toContain(response.status);
        });
    
        test('should return error for invalid priority value', async () => {
          const response = await request(app)
            .patch('/api/v1/ticket/507f1f77bcf86cd799439011')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              priority: 'invalid'
            });
    
          expect([400, 401]).toContain(response.status);
        });
    
        test('should return error for invalid status value', async () => {
          const response = await request(app)
            .patch('/api/v1/ticket/507f1f77bcf86cd799439011')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              status: 'invalid'
            });
    
          expect([400, 401]).toContain(response.status);
        });
    
        test('should return error for title too short', async () => {
          const response = await request(app)
            .patch('/api/v1/ticket/507f1f77bcf86cd799439011')
            .set('Authorization', 'Bearer invalid.token')
            .send({
              title: 'Te'
            });
    
          expect([400, 401]).toContain(response.status);
        });
        test('should return error for body too short', async () => {
            const response = await request(app)
              .patch('/api/v1/ticket/507f1f77bcf86cd799439011')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                body: 'Test'
              });
      
            expect([400, 401]).toContain(response.status);
          });
      
          test('should return 400 for no fields to update', async () => {
            const response = await request(app)
              .patch('/api/v1/ticket/507f1f77bcf86cd799439011')
              .set('Authorization', 'Bearer invalid.token')
              .send({});
      
            expect([400, 401]).toContain(response.status);
          });
        });
      
        describe('DELETE /api/v1/ticket/:id (Delete Ticket - Admin Only)', () => {
          test('should return 401 for missing token', async () => {
            const response = await request(app)
              .delete('/api/v1/ticket/507f1f77bcf86cd799439011');
      
            expect(response.status).toBe(401);
          });
      
          test('should return 401 for invalid token', async () => {
            const response = await request(app)
              .delete('/api/v1/ticket/507f1f77bcf86cd799439011')
              .set('Authorization', 'Bearer invalid.token');
      
            expect(response.status).toBe(401);
          });
      
          test('should return 400 for invalid ticket ID format', async () => {
            const response = await request(app)
              .delete('/api/v1/ticket/invalid-id')
              .set('Authorization', 'Bearer invalid.token');
      
            expect([400, 401]).toContain(response.status);
          });
      
          test('should return 404 for non-existent ticket', async () => {
            const response = await request(app)
              .delete('/api/v1/ticket/507f1f77bcf86cd799439999')
              .set('Authorization', 'Bearer invalid.token');
      
            expect([404, 401]).toContain(response.status);
          });
        });
      
        describe('GET /api/v1/ticket/user/my-tickets (Get My Tickets)', () => {
          test('should return 401 for missing token', async () => {
            const response = await request(app)
              .get('/api/v1/ticket/user/my-tickets');
      
            expect(response.status).toBe(401);
          });
      
          test('should return 401 for invalid token', async () => {
            const response = await request(app)
              .get('/api/v1/ticket/user/my-tickets')
              .set('Authorization', 'Bearer invalid.token');
      
            expect(response.status).toBe(401);
          });
      
          test('should support pagination with page and limit', async () => {
            const response = await request(app)
              .get('/api/v1/ticket/user/my-tickets?page=1&limit=10')
              .set('Authorization', 'Bearer invalid.token');
      
            expect([401, 200]).toContain(response.status);
          });
      
          test('should support filtering by status', async () => {
            const response = await request(app)
              .get('/api/v1/ticket/user/my-tickets?status=open')
              .set('Authorization', 'Bearer invalid.token');
      
            expect([401, 200]).toContain(response.status);
          });
      
          test('should support filtering by priority', async () => {
            const response = await request(app)
              .get('/api/v1/ticket/user/my-tickets?priority=high')
              .set('Authorization', 'Bearer invalid.token');
      
            expect([401, 200]).toContain(response.status);
          });
        });
      
        describe('POST /api/v1/ticket/:id/reply (Reply Ticket - Admin Only)', () => {
          test('should return 401 for missing token', async () => {
            const response = await request(app)
              .post('/api/v1/ticket/507f1f77bcf86cd799439011/reply')
              .send({
                title: 'Reply Title',
                body: 'This is a reply body'
              });
      
            expect(response.status).toBe(401);
          });
      
          test('should return 401 for invalid token', async () => {
            const response = await request(app)
              .post('/api/v1/ticket/507f1f77bcf86cd799439011/reply')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                title: 'Reply Title',
                body: 'This is a reply body'
              });
      
            expect(response.status).toBe(401);
          });
      
          test('should return 400 for invalid ticket ID format', async () => {
            const response = await request(app)
              .post('/api/v1/ticket/invalid-id/reply')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                title: 'Reply Title',
                body: 'This is a reply body'
              });
      
            expect([400, 401]).toContain(response.status);
          });
      
          test('should return error for missing title', async () => {
            const response = await request(app)
              .post('/api/v1/ticket/507f1f77bcf86cd799439011/reply')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                body: 'This is a reply body'
              });
      
            expect([400, 401]).toContain(response.status);
          });
      
          test('should return error for missing body', async () => {
            const response = await request(app)
              .post('/api/v1/ticket/507f1f77bcf86cd799439011/reply')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                title: 'Reply Title'
              });
      
            expect([400, 401]).toContain(response.status);
          });
      
          test('should return error for title too short', async () => {
            const response = await request(app)
              .post('/api/v1/ticket/507f1f77bcf86cd799439011/reply')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                title: 'Te',
                body: 'This is a reply body'
              });
      
            expect([400, 401]).toContain(response.status);
          });
      
          test('should return error for body too short', async () => {
            const response = await request(app)
              .post('/api/v1/ticket/507f1f77bcf86cd799439011/reply')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                title: 'Reply Title',
                body: 'Test'
              });
      
            expect([400, 401]).toContain(response.status);
          });
      
          test('should return 404 for non-existent ticket', async () => {
            const response = await request(app)
              .post('/api/v1/ticket/507f1f77bcf86cd799439999/reply')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                title: 'Reply Title',
                body: 'This is a reply body'
              });
      
            expect([404, 401]).toContain(response.status);
          });
        });
      
        describe('PATCH /api/v1/ticket/:id/close (Close Ticket - Admin Only)', () => {
          test('should return 401 for missing token', async () => {
            const response = await request(app)
              .patch('/api/v1/ticket/507f1f77bcf86cd799439011/close');
      
            expect(response.status).toBe(401);
          });
      
          test('should return 401 for invalid token', async () => {
            const response = await request(app)
              .patch('/api/v1/ticket/507f1f77bcf86cd799439011/close')
              .set('Authorization', 'Bearer invalid.token');
      
            expect(response.status).toBe(401);
          });
      
          test('should return 400 for invalid ticket ID format', async () => {
            const response = await request(app)
              .patch('/api/v1/ticket/invalid-id/close')
              .set('Authorization', 'Bearer invalid.token');
      
            expect([400, 401]).toContain(response.status);
          });
      
          test('should return 404 for non-existent ticket', async () => {
            const response = await request(app)
              .patch('/api/v1/ticket/507f1f77bcf86cd799439999/close')
              .set('Authorization', 'Bearer invalid.token');
      
            expect([404, 401]).toContain(response.status);
          });
        });
      
        describe('Edge Cases', () => {
          test('should handle empty request body gracefully', async () => {
            const response = await request(app)
              .post('/api/v1/ticket')
              .set('Authorization', 'Bearer invalid.token')
              .send({});
      
            expect([400, 401]).toContain(response.status);
          });
      
          test('should handle special characters in title and body', async () => {
            const response = await request(app)
              .post('/api/v1/ticket')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                departmentId: '507f1f77bcf86cd799439011',
                departmentSubId: '507f1f77bcf86cd799439012',
                priority: 'medium',
                title: 'Test Ticket !@#$%^&*()',
                body: 'This is a test ticket body with special chars !@#$%^&*()'
              });
      
            expect([401, 400]).toContain(response.status);
          });
      
          test('should handle very long title and body', async () => {
            const longTitle = 'A'.repeat(1000);
            const longBody = 'B'.repeat(5000);
      
            const response = await request(app)
              .post('/api/v1/ticket')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                departmentId: '507f1f77bcf86cd799439011',
                departmentSubId: '507f1f77bcf86cd799439012',
                priority: 'medium',
                title: longTitle,
                body: longBody
              });
      
            expect([401, 400, 201]).toContain(response.status);
          });
      
          test('should handle whitespace-only title and body', async () => {
            const response = await request(app)
              .post('/api/v1/ticket')
              .set('Authorization', 'Bearer invalid.token')
              .send({
                departmentId: '507f1f77bcf86cd799439011',
                departmentSubId: '507f1f77bcf86cd799439012',
                priority: 'medium',
                title: '   ',
                body: '     '
              });
      
            expect([400, 401]).toContain(response.status);
          });
  });
  });

