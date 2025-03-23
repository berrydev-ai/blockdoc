# Contributing to BlockDoc

Thank you for considering contributing to BlockDoc! This document outlines the process for contributing to the project and provides guidelines for writing tests.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies with `npm install`
4. Run tests with `npm test`

## Code Style

Please follow the existing code style in the project:
- Use ES Modules (type: "module" in package.json)
- Follow JavaScript standard practices
- Include JSDoc comments for public API methods

## Development Workflow

1. Create a feature branch from `main`
2. Implement your changes
3. Add tests for new functionality
4. Ensure all tests pass with `npm test`
5. Submit a pull request

## Testing Guidelines

BlockDoc uses Jest for testing. When adding or modifying code, please follow these testing guidelines:

### Test Structure

- Tests should be placed in the `/tests` directory
- The test file structure should match the source file structure
- Use descriptive test names that explain what is being tested

### Testing Components

#### Block Tests (`/tests/core/block.test.js`)
- Test block creation with different types
- Test block validation
- Test update methods
- Test JSON conversion
- Test factory methods

#### Document Tests (`/tests/core/document.test.js`)
- Test document initialization
- Test block operations (add, update, remove, move)
- Test rendering
- Test serialization
- Test schema validation

#### Renderer Tests (`/tests/renderers/*.test.js`)
- Test rendering of all block types
- Test edge cases and error conditions
- Verify output formatting

#### Utility Tests (`/tests/utils/*.test.js`)
- Test utility functions
- Test security-related functionality

#### Integration Tests (`/tests/integration.test.js`)
- Test end-to-end workflows
- Verify components work together correctly

### Testing Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state from other tests.
2. **Mock Dependencies**: Use Jest's mocking capabilities to isolate components.
3. **Test Edge Cases**: Include tests for error conditions and boundary cases.
4. **Descriptive Test Names**: Use descriptive names like `it('should validate block type')`.
5. **Coverage**: Aim for high code coverage. Run `npm test -- --coverage` to see coverage reports.

### Example Test

```javascript
import { Block } from '../../src/core/block.js';

describe('Block', () => {
  describe('constructor', () => {
    it('should create a valid text block', () => {
      const block = new Block({
        id: 'block1',
        type: 'text',
        content: { text: 'Hello World' }
      });
      
      expect(block.id).toBe('block1');
      expect(block.type).toBe('text');
      expect(block.content.text).toBe('Hello World');
    });
    
    it('should throw error for invalid block type', () => {
      expect(() => {
        new Block({
          id: 'block1',
          type: 'invalid-type',
          content: {}
        });
      }).toThrow();
    });
  });
});
```

## Pull Request Process

1. Update documentation if needed
2. Make sure all tests pass
3. Ensure code coverage remains high
4. Request review from maintainers

## License

By contributing to BlockDoc, you agree that your contributions will be licensed under the project's license.