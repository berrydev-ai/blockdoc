# BlockDoc Specification

Version: 1.0.0  
Status: Draft  
Date: March 23, 2025

## Overview

BlockDoc is a lightweight, structured format for content that is optimized for:

1. Human readability and editability
2. LLM (Large Language Model) generation and manipulation
3. Programmatic rendering and transformation
4. Storage in databases (relational or document-based)

This specification defines the structure and behavior of BlockDoc documents.

## Core Concepts

### Document Structure

A BlockDoc document is a JSON object with a single root property `article`, which contains:

- A `title` (string)
- An optional `metadata` object
- A `blocks` array containing content blocks

```json
{
  "article": {
    "title": "Example Article",
    "metadata": {
      "author": "Jane Smith",
      "publishedDate": "2025-03-20T12:00:00Z"
    },
    "blocks": [
      // Content blocks go here
    ]
  }
}
```

### Blocks

Each block represents a single content unit and has the following required properties:

- `id`: A unique, semantic identifier (string)
- `type`: The block type (string, from predefined set)
- `content`: The primary content of the block (string, interpreted based on type)

Additional properties may be required or optional depending on the block type.

### Block Types

#### Text Block

A text block represents a paragraph of text content, formatted using Markdown.

```json
{
  "id": "intro",
  "type": "text",
  "content": "This is a paragraph with **bold** and *italic* text."
}
```

#### Heading Block

A heading block represents a section heading.

```json
{
  "id": "section-1",
  "type": "heading",
  "level": 2,
  "content": "Section Heading"
}
```

Required properties:

- `level`: Integer from 1-6 indicating heading level

#### Image Block

An image block embeds an image.

```json
{
  "id": "hero-image",
  "type": "image",
  "url": "https://example.com/image.jpg",
  "alt": "Description of image",
  "caption": "Optional caption text"
}
```

Required properties:

- `url`: Image URL
- `alt`: Alternative text description

Optional properties:

- `caption`: Image caption

#### Code Block

A code block contains programming code with syntax highlighting.

```json
{
  "id": "example-code",
  "type": "code",
  "language": "javascript",
  "content": "function hello() {\n  console.log('Hello world');\n}"
}
```

Required properties:

- `language`: Programming language identifier

#### List Block

A list block contains a series of items.

```json
{
  "id": "key-points",
  "type": "list",
  "listType": "unordered",
  "items": ["First item", "Second item with **bold** text", "Third item"]
}
```

Required properties:

- `listType`: Either "ordered" or "unordered"
- `items`: Array of strings (may contain markdown)

#### Quote Block

A quote block represents a quotation.

```json
{
  "id": "famous-quote",
  "type": "quote",
  "content": "The unexamined life is not worth living.",
  "attribution": "Socrates"
}
```

Optional properties:

- `attribution`: Source of the quote

#### Embed Block

An embed block incorporates external content.

```json
{
  "id": "demo-video",
  "type": "embed",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "embedType": "youtube",
  "caption": "Demo video"
}
```

Required properties:

- `url`: URL of the embedded content
- `embedType`: Type of embed (e.g., "youtube", "twitter", "generic")

Optional properties:

- `caption`: Caption for the embedded content

#### Divider Block

A divider block creates a horizontal rule/separator.

```json
{
  "id": "section-break",
  "type": "divider",
  "content": ""
}
```

## Best Practices

### Block IDs

Block IDs should be:

1. Unique within the document
2. Meaningful and semantic (e.g., "intro", "section-1-overview", "conclusion")
3. Machine and human-readable
4. URL-safe (using only alphanumeric characters, hyphens, and underscores)

Good: `"id": "key-findings"`  
Avoid: `"id": "block-7"` or `"id": "b172ae4f"`

### Markdown Use

When using Markdown in text blocks:

1. Use standard CommonMark syntax
2. Avoid HTML within Markdown when possible
3. Keep links accessible with descriptive text

### LLM Integration

When using BlockDoc with LLMs:

1. Use clear, semantic block IDs that describe content purpose
2. Organize content in a logical hierarchy (intro → sections → conclusion)
3. Use specific prompts when requesting block updates, referencing blocks by ID

## Extensions

The BlockDoc format can be extended with custom block types. Custom types should:

1. Follow the same base structure (id, type, content)
2. Use a prefix for the type name to avoid collisions (e.g., "myapp-gallery")
3. Document their specific properties and rendering behavior

## Version History

- 1.0.0 (2025-03-23): Initial specification

## License

This specification is licensed under MIT License.
