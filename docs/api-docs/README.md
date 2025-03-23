# BlockDoc API Reference

BlockDoc provides a simple yet powerful API for creating, manipulating, and rendering structured content. This reference documentation covers all the public APIs available in the BlockDoc library.

## Table of Contents

- [Core Components](#core-components)
  - [Block](#block)
  - [BlockDocDocument](#blockdocdocument)
- [Renderers](#renderers)
  - [HTML Renderer](#html-renderer)
  - [Markdown Renderer](#markdown-renderer)
- [Utilities](#utilities)
  - [HTML Sanitization](#html-sanitization)

## Core Components

### Block

The `Block` class represents a single content unit within a BlockDoc document. It provides methods for creating and manipulating different types of content blocks.

[Read full Block documentation](./block.md)

### BlockDocDocument

The `BlockDocDocument` class is the main entry point for creating and manipulating BlockDoc documents. It provides methods for adding, updating, and removing blocks, as well as rendering the document to different formats.

[Read full BlockDocDocument documentation](./document.md)

## Renderers

BlockDoc includes built-in renderers for converting documents to different output formats.

### HTML Renderer

The HTML renderer converts BlockDoc documents to HTML, with support for all block types and appropriate styling.

[Read full HTML Renderer documentation](./renderers/html.md)

### Markdown Renderer

The Markdown renderer converts BlockDoc documents to Markdown text, preserving the structure and formatting of the original document.

[Read full Markdown Renderer documentation](./renderers/markdown.md)

## Utilities

BlockDoc includes various utility functions for common tasks.

### HTML Sanitization

Utilities for sanitizing HTML content and URLs to prevent XSS attacks and ensure security.

[Read full Sanitization utilities documentation](./utils/sanitize.md)