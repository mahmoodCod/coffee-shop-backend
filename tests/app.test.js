const app = require('../app');

describe('Express App Configuration', () => {
  
  // Test that app is exported correctly
  test('app should be exported', () => {
    expect(app).toBeDefined();
    expect(typeof app).toBe('function');
  });

  // Test that app has use method (Express app)
  test('app should be an Express application', () => {
    expect(app.use).toBeDefined();
    expect(typeof app.use).toBe('function');
  });

  // Test that app has listen method (Express app)
  test('app should have listen method', () => {
    expect(app.listen).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });

  // Test that app has get method (Express app)
  test('app should have get method', () => {
    expect(app.get).toBeDefined();
    expect(typeof app.get).toBe('function');
  });

  // Test that app has post method (Express app)
  test('app should have post method', () => {
    expect(app.post).toBeDefined();
    expect(typeof app.post).toBe('function');
  });

  // Test that app has put method (Express app)
  test('app should have put method', () => {
    expect(app.put).toBeDefined();
    expect(typeof app.put).toBe('function');
  });

  // Test that app has delete method (Express app)
  test('app should have delete method', () => {
    expect(app.delete).toBeDefined();
    expect(typeof app.delete).toBe('function');
  });

});
