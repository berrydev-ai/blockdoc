# Markdown Renderer API

The Markdown renderer converts BlockDoc documents to Markdown text, preserving the structure and formatting of the original document.

## Import

```javascript
import { renderToMarkdown } from 'blockdoc/renderers/markdown';
```

Or use through the BlockDocDocument class:

```javascript
const markdown = document.renderToMarkdown();
```

## Functions

### renderToMarkdown(article)

Render a BlockDoc document to Markdown.

#### Parameters

- `article` (Object): The article object from a BlockDoc document

#### Returns

- (string): Markdown representation

#### Throws

- `Error`: If invalid article structure

#### Example

```javascript
import { renderToMarkdown } from 'blockdoc/renderers/markdown';

const markdown = renderToMarkdown({
  title: 'My Document',
  blocks: [
    {
      id: 'intro',
      type: 'text',
      content: 'This is my document.'
    }
  ]
});
```

## Markdown Output Format

The Markdown renderer generates Markdown that maintains the structure and formatting of your BlockDoc document.

### Document Structure

```markdown
# Document Title

> Author: Document Author
> Published: Publication Date
> Tags: tag1, tag2, tag3

...
```

### Block Type Rendering

#### Text Block

Text blocks are rendered directly, as they already use Markdown formatting:

```markdown
This is **bold** and *italic* text.
```

#### Heading Block

```markdown
## Section Heading
```

#### Image Block

```markdown
![Image description](image-url.jpg)
*Image caption*
```

#### Code Block

```markdown
```javascript
function example() {
  console.log("Hello");
}
```
```

#### List Block

Ordered list:
```markdown
1. Item one
2. Item two
```

Unordered list:
```markdown
- Item one
- Item two
```

#### Quote Block

```markdown
> Quote text
>
>  Attribution
```

#### Embed Block

```markdown
[Embedded content: https://example.com](https://example.com)
*Caption text*
```

#### Divider Block

```markdown
---
```

## Metadata Handling

The Markdown renderer includes document metadata in the output:

- Author is included as `> Author: [name]`
- Publication date is formatted as `> Published: [date]`
- Tags are listed as `> Tags: tag1, tag2, tag3`

This ensures that the metadata is preserved in a human-readable format when exporting to Markdown.