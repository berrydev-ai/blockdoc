# BlockDoc

![][BlockDoc Logo](https://raw.githubusercontent.com/berrydev-ai/blockdoc/main/logo.png)

A simple, powerful standard for structured content that works beautifully with LLMs, humans, and modern editors.

[![npm version](https://img.shields.io/npm/v/blockdoc.svg)](https://www.npmjs.com/package/blockdoc)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Why blockdoc?

blockdoc provides a lightweight, flexible format for structured content that is:

- **LLM-friendly**: Optimized for AI generation and targeted modifications
- **Simple**: Flat structure with semantic IDs and minimal nesting
- **Extensible**: Core block types with room for custom extensions
- **Framework-agnostic**: Works with any frontend or backend technology
- **Database-ready**: Easy to store and query in SQL or NoSQL databases

## Core Concepts

BlockDoc is based on a block-based architecture where content is organized into discrete, individually addressable blocks. Each block has:

- A semantic ID (like 'intro', 'section-1')
- A block type ('text', 'heading', 'image', 'code')
- Content (in Markdown for text-based blocks)
- Optional metadata

This architecture enables:

- Targeted updates to specific sections
- Better organization of content
- Easy integration with LLMs
- Flexible rendering in different formats

### Core Block Types

1. **Text** - Standard paragraphs with Markdown support
2. **Heading** - Section headers with configurable levels
3. **Image** - Pictures with src, alt text, and optional caption
4. **Code** - Code blocks with syntax highlighting
5. **List** - Ordered or unordered lists
6. **Quote** - Blockquote content
7. **Embed** - Embedded content (videos, social media posts)
8. **Divider** - Horizontal rule/separator

### Design Principles

1. **Simplicity**: Minimal structure with only necessary properties
2. **LLM-Friendly**: Optimized for AI content generation and modification
3. **Human-Editable**: Clear, readable format for direct editing
4. **Database-Ready**: Easily stored in SQL or NoSQL databases
5. **Extensible**: Core types with support for custom block types
6. **Semantic**: Meaningful IDs for blocks rather than auto-generated IDs
7. **Portable**: Framework-agnostic with multiple render targets

```json
{
  "article": {
    "title": "Getting Started with blockdoc",
    "blocks": [
      {
        "id": "intro",
        "type": "text",
        "content": "blockdoc makes structured content **simple**."
      },
      {
        "id": "first-steps",
        "type": "heading",
        "level": 2,
        "content": "First Steps"
      },
      {
        "id": "step-one",
        "type": "text",
        "content": "Install blockdoc using npm: `npm install blockdoc`"
      }
    ]
  }
}
```

## Installation

Install BlockDoc from npm:

```bash
# Using npm
npm install blockdoc

# Using yarn
yarn add blockdoc

# Using pnpm
pnpm add blockdoc
```

## Usage

BlockDoc supports multiple import formats:

### ESM (ES Modules)

```javascript
import { BlockDocDocument, Block } from "blockdoc"

// Create a new document
const doc = new BlockDocDocument({
  title: "My First BlockDoc Post",
})

// Add blocks using factory methods
doc.addBlock(Block.text("intro", "Welcome to my first post!"))

// Render to HTML
const html = doc.renderToHTML()
console.log(html)
```

### CommonJS

```javascript
const { BlockDocDocument, Block } = require("blockdoc")

// Create a new document
const doc = new BlockDocDocument({
  title: "My First BlockDoc Post",
})

// Add blocks
doc.addBlock(Block.text("intro", "Welcome to my first post!"))

// Render to HTML
const html = doc.renderToHTML()
console.log(html)
```

### Browser (UMD)

```html
<script src="https://unpkg.com/blockdoc/dist/blockdoc.min.js"></script>
<script>
  // BlockDoc is available as a global variable
  const doc = new BlockDoc.BlockDocDocument({
    title: "My First BlockDoc Post",
  })

  doc.addBlock(BlockDoc.Block.text("intro", "Welcome to my first post!"))

  // Render to HTML
  const html = doc.renderToHTML()
  document.getElementById("content").innerHTML = html
</script>
```

### TypeScript Support

BlockDoc includes TypeScript type definitions:

```typescript
import { BlockDocDocument, Block, BlockData } from "blockdoc"

// Create a typed document
const doc = new BlockDocDocument({
  title: "My First BlockDoc Post",
  metadata: {
    author: "John Doe",
    publishedDate: new Date().toISOString(),
  },
})

// Add blocks with proper typing
doc.addBlock(Block.text("intro", "Welcome to my first post!"))
```

## Working with LLMs

blockdoc shines when generating or modifying content with LLMs:

```javascript
import { blockdocDocument } from "blockdoc"
import { OpenAI } from "openai"

const openai = new OpenAI()

// Update a specific section using an LLM
async function updateSection(document, blockId, prompt) {
  const block = document.getBlock(blockId)

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Update the following content to ${prompt}. Return only the updated content.`,
      },
      {
        role: "user",
        content: block.content,
      },
    ],
  })

  document.updateBlock(blockId, {
    content: response.choices[0].message.content,
  })

  return document
}
```

## Documentation

- [Full Specification](docs/spec/blockdoc-specification.md)
- [API Reference](docs/api-docs/)
- [Tutorials](docs/tutorials/)
  - [Getting Started](docs/tutorials/getting-started.md)
  - [Block Types](docs/tutorials/block-types.md)
  - [LLM Integration](docs/tutorials/llm-integration.md)
- [Examples](examples/README.md)
  - [Simple Blog](examples/simple-blog/)
  - [React Demo](examples/react-demo/)
  - [LLM Integration](examples/llm-integration/)

## Development

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/blockdoc.git
cd blockdoc

# Install dependencies
npm install
```

### Testing

BlockDoc uses Jest for testing. To run the tests:

```bash
# Run tests
npm test

# Run tests with coverage report
npm test -- --coverage
```

Current test coverage: 97%+ statement coverage across all components.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute, including our testing guidelines.

## License

MIT
