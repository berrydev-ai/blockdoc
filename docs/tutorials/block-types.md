# Working with Block Types in BlockDoc

This tutorial explores the different block types available in BlockDoc and how to use them effectively.

## Understanding Block Structure

Every block in BlockDoc has a common structure:

```javascript
{
  "id": "unique-semantic-id",
  "type": "block-type",
  // Type-specific properties go here
}
```

The `id` should be a meaningful identifier for the block that describes its content or purpose, not just a random ID. This makes content more maintainable and easier to update.

## Heading Blocks

Heading blocks represent section titles at different levels.

```javascript
import { Block } from 'blockdoc';

const headingBlock = Block.createHeading({
  id: "introduction-heading",
  content: "Introduction to BlockDoc",
  level: 1 // h1, h2, h3, etc. (1-6)
});
```

### Rendering Considerations
- HTML: Renders as `<h1>` through `<h6>` tags
- Markdown: Renders with `#` symbols equal to the level
- Only use level 1 headings for document titles
- Maintain a logical heading hierarchy (don't skip levels)

## Paragraph Blocks

Paragraph blocks are the most common block type, representing standard text content.

```javascript
const paragraphBlock = Block.createParagraph({
  id: "intro-paragraph",
  content: "BlockDoc is a lightweight structured content format..."
});
```

### Rich Text Support

Paragraphs can contain standard markdown-style formatting:

```javascript
const richTextParagraph = Block.createParagraph({
  id: "rich-text-example",
  content: "This paragraph contains **bold text**, *italics*, and `inline code`."
});
```

When rendered to HTML, the markdown formatting is converted to the appropriate HTML tags.

## List Blocks

List blocks represent ordered (numbered) or unordered (bulleted) lists.

```javascript
const listBlock = Block.createList({
  id: "features-list",
  items: [
    "Block-based content structure",
    "Semantic IDs for each block",
    "Easy conversion to multiple formats"
  ],
  ordered: false // true for numbered lists, false for bullet points
});
```

### Nested Lists

The list item content can include markdown-style sub-lists:

```javascript
const nestedListBlock = Block.createList({
  id: "nested-features-list",
  items: [
    "Content Structure\n  * Block-based design\n  * Flat hierarchy",
    "Developer Experience\n  * Easy to implement\n  * Flexible rendering"
  ],
  ordered: true
});
```

The renderer will interpret the nested list formatting correctly.

## Code Blocks

Code blocks represent code snippets with optional language highlighting.

```javascript
const codeBlock = Block.createCode({
  id: "example-code",
  content: "const doc = new BlockDocDocument();\ndoc.addBlock(Block.createParagraph({ id: 'p1', content: 'Hello' }));",
  language: "javascript" // Optional language for syntax highlighting
});
```

### Language Support

The `language` property should use standard code identifiers:
- `javascript`, `js`
- `python`, `py`
- `html`
- `css`
- `json`
- `bash`, `sh`
- etc.

## Image Blocks

Image blocks represent embedded images with optional captions.

```javascript
const imageBlock = Block.createImage({
  id: "diagram-image",
  url: "https://example.com/blockdoc-structure.png",
  alt: "BlockDoc document structure diagram",
  caption: "Figure 1: BlockDoc document structure" // Optional caption
});
```

### Image Considerations
- Always provide meaningful `alt` text for accessibility
- The `url` can be a relative or absolute URL
- If using local images, ensure the path is correct for your environment
- Captions are optional but recommended for diagrams and figures

## Quote Blocks

Quote blocks represent blockquotes, typically used for citations or highlighted quotes.

```javascript
const quoteBlock = Block.createQuote({
  id: "important-quote",
  content: "Structured content is the foundation of modern content management.",
  attribution: "Content Strategy Experts" // Optional attribution
});
```

Quote blocks render with appropriate styling to distinguish them from regular paragraphs.

## Horizontal Rule Blocks

Horizontal rule blocks create visual dividers between content sections.

```javascript
const hrBlock = Block.createHorizontalRule({
  id: "section-divider"
});
```

This block type has no additional properties beyond the standard `id` and `type`.

## Custom Block Types

You can extend BlockDoc with custom block types for specialized content.

```javascript
// First, create a validation function for your custom type
function validateCalloutBlock(block) {
  return (
    typeof block.content === "string" &&
    ["info", "warning", "danger", "success"].includes(block.calloutType)
  );
}

// Register the custom block type
Block.registerBlockType("callout", validateCalloutBlock);

// Create a custom block
const calloutBlock = new Block({
  id: "important-notice",
  type: "callout",
  content: "This is an important message that requires attention.",
  calloutType: "warning"
});
```

To render custom blocks, you'll need to extend the renderers with custom rendering functions.

## Block Validation

All blocks are validated against the BlockDoc schema:

```javascript
// Check if a single block is valid
const isValid = Block.validate(myBlock);

// Get validation errors if any
if (!isValid) {
  console.log(Block.getValidationErrors(myBlock));
}
```

## Working with Blocks in Documents

BlockDoc documents manage collections of blocks:

```javascript
import { BlockDocDocument, Block } from 'blockdoc';

// Create a document
const doc = new BlockDocDocument();

// Add blocks
doc.addBlock(Block.createHeading({ 
  id: "title",
  content: "Document Title", 
  level: 1 
}));

doc.addBlock(Block.createParagraph({ 
  id: "intro", 
  content: "Introduction paragraph..." 
}));

// Get a specific block by ID
const introBlock = doc.getBlock("intro");

// Update a block
doc.updateBlock("intro", { 
  content: "Updated introduction paragraph..." 
});

// Remove a block
doc.removeBlock("unused-block-id");

// Insert a block at a specific position
doc.addBlockAt(1, Block.createImage({ 
  id: "header-image",
  url: "/images/header.jpg",
  alt: "Header image" 
}));
```

## Block Transformation

Sometimes you may need to convert blocks from one type to another:

```javascript
// Convert a paragraph to a list
const paragraphBlock = doc.getBlock("content-paragraph");
const listItems = paragraphBlock.content.split(". ")
  .map(item => item.trim())
  .filter(item => item.length > 0);

const listBlock = Block.createList({
  id: paragraphBlock.id, // Keep the same ID for consistency
  items: listItems,
  ordered: true
});

// Replace the paragraph with the list
doc.updateBlock(paragraphBlock.id, listBlock);
```

## Practical Example: Building an Article

Here's a complete example of building an article with various block types:

```javascript
import { BlockDocDocument, Block } from 'blockdoc';

function createArticle() {
  const doc = new BlockDocDocument({
    article: {
      title: "Understanding BlockDoc",
      description: "A guide to using the BlockDoc content format",
      author: "Documentation Team",
      date: new Date().toISOString()
    }
  });

  // Title
  doc.addBlock(Block.createHeading({
    id: "title",
    content: "Understanding BlockDoc",
    level: 1
  }));

  // Introduction
  doc.addBlock(Block.createParagraph({
    id: "intro",
    content: "BlockDoc provides a structured way to create content with a block-based approach. This article explains the key concepts and features."
  }));

  // Section: What is BlockDoc
  doc.addBlock(Block.createHeading({
    id: "what-is-blockdoc",
    content: "What is BlockDoc?",
    level: 2
  }));

  doc.addBlock(Block.createParagraph({
    id: "blockdoc-definition",
    content: "BlockDoc is a lightweight structured content format designed for creating modular, block-based content with a focus on simplicity and flexibility."
  }));

  doc.addBlock(Block.createQuote({
    id: "blockdoc-quote",
    content: "BlockDoc makes content creation and management more efficient by breaking down content into logical, semantically named blocks.",
    attribution: "BlockDoc Documentation"
  }));

  // Section: Key Features
  doc.addBlock(Block.createHeading({
    id: "key-features",
    content: "Key Features",
    level: 2
  }));

  doc.addBlock(Block.createList({
    id: "features-list",
    items: [
      "Block-based content structure",
      "Semantic IDs for each block",
      "Multiple output formats (HTML, Markdown)",
      "Easy integration with LLMs",
      "Schema validation"
    ],
    ordered: false
  }));

  // Section: Code Example
  doc.addBlock(Block.createHeading({
    id: "code-example",
    content: "Code Example",
    level: 2
  }));

  doc.addBlock(Block.createParagraph({
    id: "code-intro",
    content: "Here's a simple example of creating a BlockDoc document:"
  }));

  doc.addBlock(Block.createCode({
    id: "sample-code",
    content: `import { BlockDocDocument, Block } from 'blockdoc';

const doc = new BlockDocDocument();
doc.addBlock(Block.createHeading({
  id: "welcome",
  content: "Welcome to BlockDoc",
  level: 1
}));

doc.addBlock(Block.createParagraph({
  id: "description",
  content: "This is a simple example document."
}));`,
    language: "javascript"
  }));

  // Visual divider
  doc.addBlock(Block.createHorizontalRule({
    id: "divider"
  }));

  // Conclusion
  doc.addBlock(Block.createHeading({
    id: "conclusion",
    content: "Conclusion",
    level: 2
  }));

  doc.addBlock(Block.createParagraph({
    id: "conclusion-text",
    content: "BlockDoc provides a flexible foundation for building structured content systems. By leveraging its block-based approach, you can create rich, maintainable content that can be rendered in multiple formats."
  }));

  return doc;
}

const article = createArticle();
console.log(JSON.stringify(article.toJSON(), null, 2));
```

## Best Practices for Block Usage

1. **Use Semantic IDs**: Create meaningful block IDs that describe the content's purpose
2. **Maintain Heading Hierarchy**: Follow proper heading levels (h1 → h2 → h3)
3. **Separate Concerns**: Keep logical content units in separate blocks
4. **Limit Block Size**: Prefer multiple smaller blocks over very large blocks
5. **Use Appropriate Block Types**: Choose the right block type for your content
6. **Balance Block Granularity**: Too many tiny blocks can be as problematic as too few large blocks
7. **Validate Regularly**: Check document validity when making structural changes

## Advanced: Creating Block Collections

For reusable content patterns, you can create block collections:

```javascript
function createFAQBlocks(faqs) {
  const blocks = [];
  
  faqs.forEach((faq, index) => {
    // Question heading
    blocks.push(Block.createHeading({
      id: `faq-q-${index}`,
      content: faq.question,
      level: 3
    }));
    
    // Answer paragraph
    blocks.push(Block.createParagraph({
      id: `faq-a-${index}`,
      content: faq.answer
    }));
  });
  
  return blocks;
}

// Usage
const faqData = [
  { question: "What is BlockDoc?", answer: "BlockDoc is a content structure..." },
  { question: "Why use BlockDoc?", answer: "BlockDoc makes content management..." }
];

const faqBlocks = createFAQBlocks(faqData);
faqBlocks.forEach(block => doc.addBlock(block));
```

## Conclusion

BlockDoc's block types provide a flexible foundation for creating structured content. By understanding each block type's purpose and capabilities, you can build rich, maintainable documents that can be easily rendered in multiple formats and integrated with modern content workflows.

For a complete reference of all block types and their properties, see the [BlockDoc specification](../spec/blockdoc-specification.md).