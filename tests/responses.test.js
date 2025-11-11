const { errorResponse, successRespons } = require('../helpers/responses');

describe('Response Helpers', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('errorResponse', () => {
    test('should return error response with status code and message', () => {
      errorResponse(mockRes, 400, 'Bad Request');

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 400,
        success: false,
        error: 'Bad Request',
        data: undefined,
      });
    });

    test('should return error response with status code, message, and data', () => {
      const errorData = { field: 'email', message: 'Invalid email format' };
      errorResponse(mockRes, 422, 'Validation Error', errorData);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 422,
        success: false,
        error: 'Validation Error',
        data: errorData,
      });
    });

    test('should handle 401 Unauthorized error', () => {
      errorResponse(mockRes, 401, 'Unauthorized');

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 401,
        success: false,
        error: 'Unauthorized',
        data: undefined,
      });
    });

    test('should handle 404 Not Found error', () => {
      errorResponse(mockRes, 404, 'Not Found');

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 404,
        success: false,
        error: 'Not Found',
        data: undefined,
      });
    });

    test('should handle 500 Internal Server Error', () => {
      errorResponse(mockRes, 500, 'Internal Server Error');

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 500,
        success: false,
        error: 'Internal Server Error',
        data: undefined,
      });
    });
  });

  describe('successRespons', () => {
    test('should return success response with default status code 200', () => {
      const data = { message: 'Success' };
      successRespons(mockRes, 200, data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        success: true,
        data: data,
      });
    });

    test('should return success response with custom status code', () => {
      const data = { id: 1, name: 'Test' };
      successRespons(mockRes, 201, data);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 201,
        success: true,
        data: data,
      });
    });

    test('should return success response without data', () => {
      successRespons(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        success: true,
        data: undefined,
      });
    });

    test('should return success response with array data', () => {
      const data = [{ id: 1 }, { id: 2 }];
      successRespons(mockRes, 200, data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 200,
        success: true,
        data: data,
      });
    });

    test('should handle 201 Created status code', () => {
      const data = { id: 1, created: true };
      successRespons(mockRes, 201, data);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 201,
        success: true,
        data: data,
      });
    });
  });

  describe('Response Format Consistency', () => {
    test('errorResponse should always have success: false', () => {
      errorResponse(mockRes, 400, 'Error');
      
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    test('successRespons should always have success: true', () => {
      successRespons(mockRes, 200, {});
      
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    test('both responses should include status code', () => {
      errorResponse(mockRes, 400, 'Error');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
        })
      );

      successRespons(mockRes, 200, {});
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 200,
        })
      );
    });
  });
});

