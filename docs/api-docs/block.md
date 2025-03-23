# Block Class API

The `Block` class represents a single content block within a BlockDoc document. Each block has a unique ID, a type, content, and optional additional properties depending on the block type.

## Import

```javascript
import { Block } from 'blockdoc';
```

## Constructor

```javascript
new Block(data)
```

Creates a new Block instance.

### Parameters

- `data` (Object): Block data with the following properties:
  - `id` (string, required): Unique identifier for the block
  - `type` (string, required): Block type (must be one of the allowed types)
  - `content` (string): Primary content of the block
  - Additional type-specific properties (see below)

### Throws

- `Error`: If required properties are missing or invalid

### Example

```javascript
const textBlock = new Block({
  id: 'intro',
  type: 'text',
  content: 'This is **important** text.'
});

const headingBlock = new Block({
  id: 'section-1',
  type: 'heading',
  level: 2,
  content: 'Section Title'
});
```

## Block Types

The following block types are supported:

| Type | Description | Required Properties | Optional Properties |
|------|-------------|---------------------|--------------------|
| `text` | Text paragraph with Markdown | none | none |
| `heading` | Section heading | `level` (1-6) | none |
| `image` | Image | `url`, `alt` | `caption` |
| `code` | Code block | `language` | none |
| `list` | List of items | `items`, `listType` | none |
| `quote` | Blockquote | none | `attribution` |
| `embed` | Embedded content | none | `embedType`, `caption` |
| `divider` | Horizontal rule | none | none |

## Methods

### update(updates)

Update block properties.

#### Parameters

- `updates` (Object): Properties to update

#### Returns

- (Block): The updated block instance

#### Example

```javascript
const block = new Block({
  id: 'intro',
  type: 'text',
  content: 'Original content'
});

block.update({ content: 'Updated content' });
```

### toJSON()

Convert block to a plain object.

#### Returns

- (Object): Block as a plain object

#### Example

```javascript
const block = new Block({
  id: 'intro',
  type: 'text',
  content: 'Some content'
});

const json = block.toJSON();
// { id: 'intro', type: 'text', content: 'Some content' }
```

## Static Factory Methods

The Block class provides static factory methods for creating common block types with a simplified API.

### Block.text(id, content)

Create a text block.

#### Parameters

- `id` (string): Block ID
- `content` (string): Markdown content

#### Returns

- (Block): New text block instance

#### Example

```javascript
const block = Block.text('intro', 'This is **bold** text.');
```

### Block.heading(id, level, content)

Create a heading block.

#### Parameters

- `id` (string): Block ID
- `level` (number): Heading level (1-6)
- `content` (string): Heading text

#### Returns

- (Block): New heading block instance

#### Example

```javascript
const block = Block.heading('section-1', 2, 'Section Title');
```

### Block.image(id, url, alt, caption)

Create an image block.

#### Parameters

- `id` (string): Block ID
- `url` (string): Image URL
- `alt` (string): Alt text
- `caption` (string, optional): Image caption

#### Returns

- (Block): New image block instance

#### Example

```javascript
const block = Block.image(
  'hero-image',
  'https://example.com/image.jpg',
  'Example image',
  'Figure 1: Example caption'
);
```

### Block.code(id, language, content)

Create a code block.

#### Parameters

- `id` (string): Block ID
- `language` (string): Programming language
- `content` (string): Code content

#### Returns

- (Block): New code block instance

#### Example

```javascript
const block = Block.code(
  'example-code',
  'javascript',
  'function hello() {\n  console.log("Hello world");\n}'
);
```

### Block.list(id, items, listType)

Create a list block.

#### Parameters

- `id` (string): Block ID
- `items` (Array<string>): List items
- `listType` (string, optional): List type ('ordered' or 'unordered', defaults to 'unordered')

#### Returns

- (Block): New list block instance

#### Example

```javascript
const block = Block.list(
  'key-points',
  ['First item', 'Second item', 'Third item'],
  'unordered'
);
```