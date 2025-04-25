# Markdown to BlockDoc Conversion

> Author: BlockDoc Team
> Published: Fri Apr 25 2025
> Tags: markdown, conversion, example

This is a demonstration of converting **Markdown** content to BlockDoc format.

## Key Features

BlockDoc makes it easy to work with structured content:

- Maintains semantic structure
- Preserves formatting
- Creates meaningful block IDs

### Code Examples

Here's an example of JavaScript code:

```javascript
import { markdownToBlockDoc } from 'blockdoc';

// Convert markdown to BlockDoc
const doc = markdownToBlockDoc(markdownText);

// Export as JSON
const jsonStr = JSON.stringify(doc.toJSON(), null, 2);
console.log(jsonStr);
```

## Images and Media

Images are properly converted:

![Example image](https://placehold.co/600x400?text=Example+Image)
*Example image caption*

## Block Quotes

BlockDoc handles various content types:

> This is a block quote that will be properly converted
> to a BlockDoc quote block, preserving its formatting
> and presentation.
> — Attribution Source

---

## Lists

1. Ordered lists work great
2. With multiple items
3. Preserving the numbering

- Unordered lists too
- With proper nesting
- And formatting

## The End

This example shows how Markdown can be seamlessly converted to BlockDoc format, preserving
the document structure while enabling all the benefits of block-based content.
