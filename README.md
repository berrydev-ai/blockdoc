# blockdoc

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

blockdoc represents articles as a flat array of blocks, each with:

- A semantic ID (like 'intro', 'section-1')
- A block type ('text', 'heading', 'image', 'code')
- Content (in Markdown for text-based blocks)
- Optional metadata

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

## Getting Started

```bash
npm install blockdoc
```

```javascript
import { blockdocDocument } from "blockdoc"

// Create a new document
const doc = new blockdocDocument({
  title: "My First blockdoc Post",
})

// Add blocks
doc.addBlock({
  id: "intro",
  type: "text",
  content: "Welcome to my first post!",
})

// Render to HTML
const html = doc.renderToHTML()
console.log(html)
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

- [Full Specification](https://blockdoc.dev/docs/spec)
- [API Reference](https://blockdoc.dev/docs/api)
- [Tutorials](https://blockdoc.dev/docs/tutorials)
- [Examples](https://blockdoc.dev/examples)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT © [Berry Development](https://berrydev.com)
