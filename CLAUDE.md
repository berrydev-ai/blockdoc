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

# Run tests
npm test

# Build the project
npm run build

# Generate documentation
npm run docs

# Run linting
npm run lint

# Run examples
npm run examples
```

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