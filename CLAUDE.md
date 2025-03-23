# BlockDoc Project Information

## Project Overview
BlockDoc is a lightweight structured content format designed for:
- Creating modular, block-based content (similar to Notion or modern CMS systems)
- Optimizing content for LLM generation and modification
- Providing a simple flat structure with semantic IDs
- Enabling easy storage in databases
- Allowing targeted updates to specific sections
- Representing content as JSON with blocks that have IDs, types, and content

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Generate documentation
npm run docs

# Run linting
npm run lint

# Run examples
npm run examples
```

### Testing
```bash
# Run tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test -- tests/core/block.test.js

# Run tests in watch mode
npm test -- --watch
```

## CI/CD
The project uses GitHub Actions for continuous integration. The workflow:
- Runs on push to main/master and on pull requests
- Tests with Node.js 18.x and 20.x
- Uploads coverage reports to Codecov

## Code Style
- JavaScript ES Modules (type: "module" in package.json)
- Node.js (>= v18.0.0)

## Project Structure
- `/src/core/`: Core functionality (block.js, document.js)
- `/src/renderers/`: Output renderers (HTML, Markdown)
- `/src/api/`: API client and server components
- `/src/schema/`: JSON schema for validation
- `/docs/`: Documentation files
- `/examples/`: Example implementations and use cases
- `/tests/`: Test files
  - `/tests/core/`: Tests for core components
  - `/tests/renderers/`: Tests for renderers
  - `/tests/utils/`: Tests for utility functions
  - `/tests/integration.test.js`: Integration tests
- `/dist/`: Built distribution files
  - `/dist/cjs/`: CommonJS modules
  - `/dist/esm/`: ES modules
  - `/dist/blockdoc.js`: UMD bundle
  - `/dist/blockdoc.min.js`: Minified UMD bundle

## npm Package
The BlockDoc library is published to npm with the following features:
- Supports ESM, CommonJS, and UMD formats
- Includes TypeScript definitions
- Version: 1.0.0
- Entry points:
  - Main: ./dist/cjs/index.js (for CommonJS)
  - Module: ./dist/esm/index.js (for ESM)
  - Browser: ./dist/blockdoc.min.js (for browsers)
- Submodule exports:
  - blockdoc/renderers/html
  - blockdoc/renderers/markdown
  - blockdoc/utils/sanitize

### Publishing
```bash
# Update version in package.json and src/index.js
# Then run:
npm run build
npm publish
```