# Getting Started with BlockDoc

This tutorial walks you through the basics of using BlockDoc to create, manipulate, and render structured content.

## Installation

Install BlockDoc via npm:

```bash
npm install blockdoc
```

## Creating Your First Document

Let's create a simple blog post using BlockDoc:

```javascript
import { BlockDocDocument, Block } from 'blockdoc';

// Create a new document
const doc = new BlockDocDocument({
  article: {
    title: "My First BlockDoc Post",
    description: "Learning how to use BlockDoc",
    author: "Your Name",
    date: new Date().toISOString()
  }
});

// Add heading block
doc.addBlock(
  Block.createHeading({
    id: "intro-heading",
    content: "Introduction to BlockDoc",
    level: 1
  })
);

// Add paragraph block
doc.addBlock(
  Block.createParagraph({
    id: "intro-paragraph",
    content: "BlockDoc is a lightweight structured content format designed for creating modular, block-based content that works well with LLMs."
  })
);

// Add code block
doc.addBlock(
  Block.createCode({
    id: "example-code",
    content: "const doc = new BlockDocDocument();",
    language: "javascript"
  })
);

// Add list block
doc.addBlock(
  Block.createList({
    id: "features-list",
    items: [
      "Modular block-based content",
      "Optimized for LLM generation and modification",
      "Simple flat structure with semantic IDs",
      "Easy storage in databases",
      "Targeted updates to specific sections"
    ],
    ordered: false
  })
);

// Export as JSON
const json = doc.toJSON();
console.log(JSON.stringify(json, null, 2));
```

## Rendering Documents

BlockDoc provides renderers for HTML and Markdown:

### HTML Rendering

```javascript
import { HTMLRenderer } from 'blockdoc';

const renderer = new HTMLRenderer();
const html = renderer.render(doc);
console.log(html);
```

### Markdown Rendering

```javascript
import { MarkdownRenderer } from 'blockdoc';

const renderer = new MarkdownRenderer();
const markdown = renderer.render(doc);
console.log(markdown);
```

## Manipulating Documents

BlockDoc documents can be easily manipulated:

```javascript
// Update a block by ID
doc.updateBlock("intro-paragraph", {
  content: "Updated content for this paragraph."
});

// Remove a block
doc.removeBlock("example-code");

// Add a new block at a specific position
doc.addBlockAt(
  1,
  Block.createImage({
    id: "intro-image",
    url: "https://example.com/image.jpg",
    alt: "An example image",
    caption: "Figure 1: BlockDoc Structure"
  })
);
```

## Validating Documents

BlockDoc validates documents against its schema:

```javascript
// Check if document is valid
const isValid = doc.validate();
console.log(`Document is valid: ${isValid}`);

// Get validation errors if any
if (!isValid) {
  console.log(doc.validationErrors);
}
```

## Working with the API

### Client-Side

```javascript
import { BlockDocClient } from 'blockdoc';

const client = new BlockDocClient('https://api.example.com/blockdoc');

// Fetch a document
const doc = await client.getDocument('document-id');

// Update a document
await client.updateDocument('document-id', doc);
```

### Server-Side

```javascript
import express from 'express';
import { blockDocMiddleware } from 'blockdoc';

const app = express();
const documentsPath = './documents';

// Add BlockDoc middleware
app.use('/api/documents', blockDocMiddleware({
  storagePath: documentsPath
}));

app.listen(3000, () => {
  console.log('BlockDoc API server running on port 3000');
});
```

## Using with React

```jsx
import React from 'react';
import { BlockDocRenderer } from 'blockdoc/react';

function App() {
  const documentData = {
    article: {
      title: "My React BlockDoc Example"
    },
    blocks: [
      {
        id: "heading",
        type: "heading",
        content: "Hello from React!",
        level: 1
      },
      {
        id: "paragraph",
        type: "paragraph",
        content: "This is BlockDoc rendered in React."
      }
    ]
  };

  return (
    <div className="app">
      <BlockDocRenderer document={documentData} />
    </div>
  );
}

export default App;
```

## Next Steps

- Explore [advanced block types](../api-docs/block-types.md)
- Learn about [schema customization](../api-docs/schema-customization.md)
- Check out [LLM integration examples](../../examples/llm-integration/llm-integration-example.js)

For more detailed information, refer to the [BlockDoc specification](../spec/blockdoc-specification.md).