# HTML Renderer API

The HTML renderer converts BlockDoc documents to HTML, with support for all block types and appropriate styling.

## Import

```javascript
import { renderToHTML } from 'blockdoc/renderers/html';
```

Or use through the BlockDocDocument class:

```javascript
const html = document.renderToHTML();
```

## Functions

### renderToHTML(article)

Render a BlockDoc document to HTML.

#### Parameters

- `article` (Object): The article object from a BlockDoc document

#### Returns

- (string): HTML representation

#### Throws

- `Error`: If invalid article structure

#### Example

```javascript
import { renderToHTML } from 'blockdoc/renderers/html';

const html = renderToHTML({
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

## HTML Output Structure

The HTML renderer generates semantic HTML that maintains the structure of your BlockDoc document.

### Document Structure

```html
<article class="blockdoc-article">
  <h1 class="blockdoc-title">Document Title</h1>
  <!-- Blocks go here -->
</article>
```

### Block Wrapper

Each block is wrapped in a div with appropriate classes and data attributes:

```html
<div class="blockdoc-block blockdoc-[type]" data-block-id="[id]" data-block-type="[type]">
  <!-- Block content -->
</div>
```

### Block Type Rendering

#### Text Block

Text blocks are rendered as HTML paragraphs, with Markdown converted to HTML:

```html
<p>This is <strong>bold</strong> and <em>italic</em> text.</p>
```

#### Heading Block

```html
<h2>Section Heading</h2>
```

#### Image Block

```html
<figure class="blockdoc-figure">
  <img src="image-url.jpg" alt="Image description" class="blockdoc-image" />
  <figcaption class="blockdoc-caption">Image caption</figcaption>
</figure>
```

#### Code Block

Code blocks include syntax highlighting via highlight.js:

```html
<pre class="blockdoc-pre">
  <code class="blockdoc-code language-javascript">function example() {
  console.log("Hello");
}</code>
</pre>
```

#### List Block

```html
<ul class="blockdoc-list blockdoc-list-unordered">
  <li>Item one</li>
  <li>Item two</li>
</ul>
```

#### Quote Block

```html
<blockquote class="blockdoc-quote">
  <p>Quote text</p>
</blockquote>
<cite class="blockdoc-attribution">Attribution</cite>
```

#### Embed Block

Embed blocks have special handling for common embed types like YouTube:

```html
<div class="blockdoc-embed-container">
  <iframe 
    width="560" 
    height="315" 
    src="https://www.youtube.com/embed/videoId" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>
```

#### Divider Block

```html
<hr class="blockdoc-divider" />
```

## CSS Classes

The HTML renderer adds CSS classes to all elements for styling:

- `blockdoc-article`: Wrapper for the entire document
- `blockdoc-title`: Document title
- `blockdoc-block`: Wrapper for each block
- `blockdoc-[type]`: Class specific to the block type
- `blockdoc-image`: Image element
- `blockdoc-figure`: Figure wrapper for images with captions
- `blockdoc-caption`: Caption for images or embeds
- `blockdoc-pre`: Pre element for code blocks
- `blockdoc-code`: Code element for code blocks
- `blockdoc-list`: List element
- `blockdoc-list-[type]`: Class for list type (ordered/unordered)
- `blockdoc-quote`: Blockquote element
- `blockdoc-attribution`: Citation for quotes
- `blockdoc-embed`: Wrapper for embedded content
- `blockdoc-divider`: Horizontal rule

## Security

The HTML renderer uses the `sanitizeHtml` function to prevent XSS attacks by escaping HTML special characters in content. Additionally, URLs are validated to ensure they use safe protocols.