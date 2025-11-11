# Project Tests

## Installing Dependencies

Before running tests, you need to install Jest and Supertest:

```bash
npm install --save-dev jest supertest
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- `tests/app.test.js` - Express app configuration tests

## Current Tests

### app.test.js
- Test 404 handler for undefined routes
- Test JSON response
- Test JSON body parser
- Test different HTTP methods (GET, POST, PUT, DELETE)

## Test Coverage

Tests cover:
- Express app structure and configuration
- Middleware setup (CORS, body parsers)
- Error handling (404 handler)
- HTTP methods availability

## Adding New Tests

When adding new features, create corresponding test files:
- `tests/[feature-name].test.js` - Unit tests for specific feature
- Follow the existing test structure and naming conventions

## Notes

- All tests should pass before merging to develop
- Tests are automatically run on CI/CD pipeline
- Coverage reports are generated in the `coverage/` directory
