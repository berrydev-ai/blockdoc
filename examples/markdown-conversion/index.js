/**
 * BlockDoc Markdown Conversion Example
 *
 * This example demonstrates converting Markdown to BlockDoc format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { markdownToBlockDoc } from '../../src/conversions/markdown.js';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Sample markdown content
const SAMPLE_MARKDOWN = `# Markdown to BlockDoc Conversion

This is a demonstration of converting **Markdown** content to BlockDoc format.

## Key Features

BlockDoc makes it easy to work with structured content:

- Maintains semantic structure
- Preserves formatting
- Creates meaningful block IDs

### Code Examples

Here's an example of JavaScript code:

\`\`\`javascript
import { markdownToBlockDoc } from 'blockdoc';

// Convert markdown to BlockDoc
const doc = markdownToBlockDoc(markdownText);

// Export as JSON
const jsonStr = JSON.stringify(doc.toJSON(), null, 2);
console.log(jsonStr);
\`\`\`

## Images and Media

Images are properly converted:

![Example image](https://placehold.co/600x400?text=Example+Image) Example image caption

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

* Unordered lists too
* With proper nesting
* And formatting

## The End

This example shows how Markdown can be seamlessly converted to BlockDoc format, preserving
the document structure while enabling all the benefits of block-based content.
`;

/**
 * Main function to run the example
 */
function main() {
  console.log('Converting Markdown to BlockDoc format...');
  const doc = markdownToBlockDoc(
    SAMPLE_MARKDOWN,
    undefined,
    {
      author: 'BlockDoc Team',
      publishedDate: new Date().toISOString(),
      tags: ['markdown', 'conversion', 'example'],
    }
  );

  // Validate the document against the schema
  console.log('Validating against schema...');
  try {
    doc.validate();
    console.log('✓ Document is valid');
  } catch (error) {
    console.error(`✗ Validation failed: ${error.message}`);
    return;
  }

  // Create output directory
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save the document as JSON
  console.log('Saving document as JSON...');
  fs.writeFileSync(
    path.join(outputDir, 'markdown-converted.json'),
    doc.toString(),
    'utf-8'
  );

  // Render back to Markdown
  console.log('Rendering back to Markdown...');
  const markdown = doc.renderToMarkdown();
  fs.writeFileSync(
    path.join(outputDir, 'markdown-roundtrip.md'),
    markdown,
    'utf-8'
  );

  // Render to HTML
  console.log('Rendering to HTML...');
  const html = doc.renderToHTML();
  fs.writeFileSync(
    path.join(outputDir, 'markdown-converted.html'),
    html,
    'utf-8'
  );

  // Display block structure
  console.log('\nDocument structure:');
  doc.article.blocks.forEach((block, i) => {
    console.log(`${i + 1}. Type: ${block.type}, ID: ${block.id}`);
  });

  console.log('\nExample complete! Output files saved to:', outputDir);
  console.log('• markdown-converted.json - The BlockDoc document in JSON format');
  console.log('• markdown-roundtrip.md - The document rendered back to Markdown');
  console.log('• markdown-converted.html - The document rendered to HTML');
}

// Run the example
main();