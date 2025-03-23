# BlockDocDocument Class API

The `BlockDocDocument` class is the main entry point for creating and manipulating BlockDoc documents. It provides methods for adding, updating, and removing blocks, as well as rendering the document to different formats.

## Import

```javascript
import { BlockDocDocument } from "blockdoc"
```

## Constructor

```javascript
new BlockDocDocument(options)
```

Creates a new BlockDocDocument instance.

### Parameters

- `options` (Object): Document initialization options
  - `title` (string, required): Document title
  - `metadata` (Object, optional): Optional document metadata
  - `blocks` (Array<Object>, optional): Initial blocks to add

### Example

```javascript
const doc = new BlockDocDocument({
  title: "My First Document",
  metadata: {
    author: "John Doe",
    publishedDate: "2025-03-23T12:00:00Z",
    tags: ["example", "blockdoc"],
  },
  blocks: [
    {
      id: "intro",
      type: "text",
      content: "This is my first BlockDoc document.",
    },
  ],
})
```

## Properties

### article

The article object containing the document's title, metadata, and blocks.

```javascript
doc.article.title // Document title
doc.article.metadata // Document metadata
doc.article.blocks // Array of blocks
```

## Methods

### validate()

Validate the document against the BlockDoc schema.

#### Returns

- (boolean): True if valid

#### Throws

- `Error`: If validation fails

#### Example

```javascript
try {
  doc.validate()
  console.log("Document is valid")
} catch (error) {
  console.error("Validation failed:", error.message)
}
```

### addBlock(blockData)

Add a block to the document.

#### Parameters

- `blockData` (Object): Block data (see Block constructor)

#### Returns

- (Block): The created block

#### Throws

- `Error`: If a block with the same ID already exists

#### Example

```javascript
const block = doc.addBlock({
  id: "section-1",
  type: "heading",
  level: 2,
  content: "Section Title",
})

// Using factory methods
doc.addBlock(Block.text("paragraph-1", "This is a paragraph."))
```

### insertBlock(blockData, position)

Insert a block at a specific position.

#### Parameters

- `blockData` (Object): Block data
- `position` (number): Position to insert at (0-based index)

#### Returns

- (Block): The created block

#### Throws

- `Error`: If a block with the same ID already exists

#### Example

```javascript
const block = doc.insertBlock(
  {
    id: "new-intro",
    type: "text",
    content: "This comes before everything else.",
  },
  0
)
```

### getBlock(id)

Get a block by ID.

#### Parameters

- `id` (string): Block ID

#### Returns

- (Object|null): The block or null if not found

#### Example

```javascript
const block = doc.getBlock("intro")

if (block) {
  console.log(block.content)
}
```

### updateBlock(id, updates)

Update a block by ID.

#### Parameters

- `id` (string): Block ID
- `updates` (Object): Properties to update

#### Returns

- (Object): The updated block

#### Throws

- `Error`: If block with given ID not found

#### Example

```javascript
const updated = doc.updateBlock("intro", {
  content: "This is the updated introduction.",
})
```

### removeBlock(id)

Remove a block by ID.

#### Parameters

- `id` (string): Block ID

#### Returns

- (boolean): True if removed, false if not found

#### Example

```javascript
const removed = doc.removeBlock("unnecessary-section")

if (removed) {
  console.log("Block removed successfully")
}
```

### moveBlock(id, newPosition)

Move a block to a new position.

#### Parameters

- `id` (string): Block ID
- `newPosition` (number): New position (0-based index)

#### Returns

- (boolean): True if moved, false if not found

#### Throws

- `Error`: If invalid position

#### Example

```javascript
const moved = doc.moveBlock("conclusion", 5)

if (moved) {
  console.log("Block moved successfully")
}
```

### renderToHTML()

Render the document to HTML.

#### Returns

- (string): HTML representation

#### Example

```javascript
const html = doc.renderToHTML()

// Use in browser
document.getElementById("content").innerHTML = html

// Or write to file
import fs from "fs/promises"
await fs.writeFile("output.html", html, "utf8")
```

### renderToMarkdown()

Render the document to Markdown.

#### Returns

- (string): Markdown representation

#### Example

```javascript
const markdown = doc.renderToMarkdown()

// Write to file
import fs from "fs/promises"
await fs.writeFile("output.md", markdown, "utf8")
```

### toJSON()

Export the document as a JSON object.

#### Returns

- (Object): Document as JSON object

#### Example

```javascript
const json = doc.toJSON()
// { article: { title: '...', metadata: {...}, blocks: [...] } }
```

### toString()

Export the document as a JSON string.

#### Returns

- (string): Document as JSON string

#### Example

```javascript
const jsonString = doc.toString()

// Write to file
import fs from "fs/promises"
await fs.writeFile("document.json", jsonString, "utf8")
```

## Static Methods

### BlockDocDocument.fromJSON(json)

Create a BlockDoc document from a JSON object or string.

#### Parameters

- `json` (Object|string): JSON object or string

#### Returns

- (BlockDocDocument): New document instance

#### Throws

- `Error`: If invalid JSON or missing required properties

#### Example

```javascript
// From object
const doc1 = BlockDocDocument.fromJSON({
  article: {
    title: 'My Document',
    blocks: [...]
  }
});

// From string
const json = await fs.readFile('document.json', 'utf8');
const doc2 = BlockDocDocument.fromJSON(json);
```
