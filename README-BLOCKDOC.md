# BlockDoc: Development and Specification

This document captures the key ideas and design decisions behind BlockDoc, a lightweight structured content format.

## Overview

BlockDoc is a simple, powerful standard for structured content that:
- Works beautifully with LLMs, humans, and modern editors
- Uses a flat, block-based structure with semantic IDs
- Supports targeted modifications of specific content sections
- Stores content in a database-friendly JSON format
- Remains framework-agnostic and extensible

## Core Concepts

### Block-Based Architecture

Content is organized into discrete, individually addressable blocks. Each block has:
- A semantic ID (like 'intro', 'section-1')
- A block type ('text', 'heading', 'image', 'code')
- Content (in Markdown for text-based blocks)
- Optional metadata

This architecture enables:
- Targeted updates to specific sections
- Better organization of content
- Easy integration with LLMs
- Flexible rendering in different formats

### Format Specification

```json
{
  "article": {
    "title": "Example Article",
    "metadata": {
      "author": "Jane Smith",
      "publishedDate": "2025-03-20T12:00:00Z"
    },
    "blocks": [
      {
        "id": "intro",
        "type": "text",
        "content": "This is a paragraph with **bold** and *italic* text."
      },
      {
        "id": "section-1",
        "type": "heading", 
        "level": 2,
        "content": "Section Heading"
      },
      {
        "id": "image-1",
        "type": "image",
        "src": "https://example.com/image.jpg",
        "alt": "Example image",
        "caption": "An example image"
      }
    ]
  }
}
```

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

## Implementation

The JavaScript implementation provides:
- Block creation and validation
- Document operations (add, insert, update, move blocks)
- Rendering to various formats (HTML, Markdown)
- LLM integration helpers
- Schema validation

## Use Cases

- Modern CMS platforms
- Blog systems with structured content
- Documentation sites
- LLM-assisted content creation tools
- Interactive editing environments
- Content that requires targeted updates

## Comparison to Other Formats

BlockDoc sits between simple formats like Markdown and complex formats like Portable Text, offering:
- More structure than plain Markdown
- Less complexity than nested document models
- Better LLM compatibility than most alternatives
- Simple integration with databases
- Easier targeted updates than monolithic formats