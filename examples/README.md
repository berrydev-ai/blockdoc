# BlockDoc Examples

This directory contains example implementations demonstrating how to use BlockDoc in different scenarios.

## Available Examples

### 1. Simple Blog (`simple-blog/`)

A basic example showing how to create, validate, and render a blog post using BlockDoc.

**Features demonstrated:**

- Creating a BlockDoc document with metadata
- Adding different types of blocks (text, heading, code, image, list, quote, divider)
- Validating against the schema
- Rendering to HTML and Markdown
- Updating blocks
- Saving to JSON

**How to run:**

```bash
# From the project root
npm run examples

# Or run directly
node examples/simple-blog/index.js
```

**Output:**
The example will create four files in the `examples/simple-blog/output/` directory:

- `blog-post.json` - The original BlockDoc document in JSON format
- `blog-post.html` - The document rendered to HTML
- `blog-post.md` - The document rendered to Markdown
- `blog-post-updated.json` - The document after updating a block

### 2. React Demo (`react-demo/`)

Demonstrates how to use BlockDoc with React, rendering different block types as React components.

**Features demonstrated:**

- Creating a sample BlockDoc document
- Rendering blocks as React components
- Displaying the document's JSON structure

**How to run:**
Typically used within a React application. This example provides the components you would
import into your React project.

```bash
# For a full React demo, you would import these components into your React app
import { BlockDocRenderer } from './BlockDocRenderer';

# Then use in your components
<BlockDocRenderer document={myDocument} />
```

### 3. LLM Integration (`llm-integration/`)

Shows how to integrate BlockDoc with Large Language Models (LLMs) for content generation and manipulation.

**Features demonstrated:**

- Generating complete articles with structured blocks using an LLM
- Updating specific sections of content
- Extracting keywords and metadata from existing content
- Converting BlockDoc to/from JSON for API interactions

**How to run:**

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your_api_key_here

# From the project root
node examples/llm-integration/llm-integration-example.js
```

**Note:** Requires an OpenAI API key to run. The example uses GPT-4 for optimal results.

## Creating Your Own Examples

Feel free to create your own examples using BlockDoc. The general pattern is:

1. Import the BlockDoc components

   ```javascript
   import { BlockDocDocument, Block } from "blockdoc"
   ```

2. Create a document and add blocks

   ```javascript
   const doc = new BlockDocDocument({
     title: "My Document",
     metadata: {
       /* optional metadata */
     },
   })

   doc.addBlock(Block.text("intro", "This is my document."))
   ```

3. Render or manipulate the document

   ```javascript
   // Render to HTML
   const html = doc.renderToHTML()

   // Render to Markdown
   const markdown = doc.renderToMarkdown()

   // Convert to JSON
   const json = doc.toString()
   ```

For more information, see the [documentation](../docs/tutorials/getting-started.md).
