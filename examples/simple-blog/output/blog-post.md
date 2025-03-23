# Getting Started with BlockDoc

> Author: BlockDoc Team
> Published: Sun Mar 23 2025
> Tags: blockdoc, tutorial, content, structured-data

Welcome to **BlockDoc**, a simple yet powerful format for structured content. In this tutorial, we'll explore the basics of creating and working with BlockDoc documents.

## What is BlockDoc?

BlockDoc is a structured content format designed for:

* **LLM-friendly** - Optimized for generation and modification by AI
* **Block-based** - Content is divided into modular blocks with semantic IDs
* **Flexible** - Supports various content types and nested structures
* **Database-ready** - Easy to store in document databases
* **Renderer-agnostic** - Output to HTML, Markdown, or other formats

```javascript
// Create a new BlockDoc document
const doc = new BlockDocDocument({
  title: "My First Document",
});

// Add some content blocks
doc.addBlock(Block.heading("intro-heading", 2, "Introduction"));
doc.addBlock(Block.text("intro-text", "This is my **first** BlockDoc document."));

// Render to HTML
const html = doc.renderToHTML();
console.log(html);
```

![A sample BlockDoc document structure](https://placehold.co/600x400?text=BlockDoc+Example)
*Figure 1: Visual representation of a BlockDoc document*

## Supported Block Types

- **Text**: Markdown-formatted text content
- **Heading**: Section headings with levels 1-6
- **Image**: Images with URL, alt text, and optional caption
- **Code**: Code snippets with language highlighting
- **List**: Ordered or unordered lists
- **Quote**: Blockquotes with optional attribution
- **Embed**: Embedded content like videos or tweets
- **Divider**: Horizontal dividers between sections

BlockDoc was designed with a specific philosophy in mind:

> Content should be structured in a way that is meaningful to both humans and machines, allowing for precise updates and transformations while maintaining semantic context.
>
>  BlockDoc Design Principles

## Getting Started

Ready to try BlockDoc for yourself? Check out our [GitHub repository](https://github.com/berrydev-ai/blockdoc) and follow the installation instructions to get started.

BlockDoc is perfect for content-heavy applications, CMS systems, documentation sites, and anywhere else you need structured, maintainable content.

---
