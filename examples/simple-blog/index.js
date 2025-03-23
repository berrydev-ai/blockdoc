/**
 * BlockDoc Simple Blog Example
 *
 * This example demonstrates creating and rendering a blog post using BlockDoc
 */

import { Block, BlockDocDocument } from '../../src/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Create a sample blog post
 * @returns {BlockDocDocument} The created document
 */
function createBlogPost() {
  // Create a new document
  const blogPost = new BlockDocDocument({
    title: "Getting Started with BlockDoc",
    metadata: {
      author: "BlockDoc Team",
      publishedDate: new Date().toISOString(),
      tags: ["blockdoc", "tutorial", "content", "structured-data"]
    }
  });

  // Add an introduction
  blogPost.addBlock(Block.text(
    "intro",
    "Welcome to **BlockDoc**, a simple yet powerful format for structured content. " +
    "In this tutorial, we'll explore the basics of creating and working with BlockDoc documents."
  ));

  // Add a heading
  blogPost.addBlock(Block.heading(
    "what-is-blockdoc",
    2,
    "What is BlockDoc?"
  ));

  // Add content explaining BlockDoc
  blogPost.addBlock(Block.text(
    "blockdoc-explanation",
    "BlockDoc is a structured content format designed for:\n\n" +
    "* **LLM-friendly** - Optimized for generation and modification by AI\n" +
    "* **Block-based** - Content is divided into modular blocks with semantic IDs\n" +
    "* **Flexible** - Supports various content types and nested structures\n" +
    "* **Database-ready** - Easy to store in document databases\n" +
    "* **Renderer-agnostic** - Output to HTML, Markdown, or other formats"
  ));

  // Add a code example
  blogPost.addBlock(Block.code(
    "code-example",
    "javascript",
    `// Create a new BlockDoc document
const doc = new BlockDocDocument({
  title: "My First Document",
});

// Add some content blocks
doc.addBlock(Block.heading("intro-heading", 2, "Introduction"));
doc.addBlock(Block.text("intro-text", "This is my **first** BlockDoc document."));

// Render to HTML
const html = doc.renderToHTML();
console.log(html);`
  ));

  // Add an image
  blogPost.addBlock(Block.image(
    "sample-image",
    "https://placehold.co/600x400?text=BlockDoc+Example",
    "A sample BlockDoc document structure",
    "Figure 1: Visual representation of a BlockDoc document"
  ));

  // Add another heading
  blogPost.addBlock(Block.heading(
    "block-types",
    2,
    "Supported Block Types"
  ));

  // Add a list of block types
  blogPost.addBlock(Block.list(
    "block-types-list",
    [
      "**Text**: Markdown-formatted text content",
      "**Heading**: Section headings with levels 1-6",
      "**Image**: Images with URL, alt text, and optional caption",
      "**Code**: Code snippets with language highlighting",
      "**List**: Ordered or unordered lists",
      "**Quote**: Blockquotes with optional attribution",
      "**Embed**: Embedded content like videos or tweets",
      "**Divider**: Horizontal dividers between sections"
    ],
    "unordered"
  ));

  // Add a quote
  blogPost.addBlock(Block.text(
    "quote-intro",
    "BlockDoc was designed with a specific philosophy in mind:"
  ));

  const quoteBlock = new Block({
    id: "philosophy-quote",
    type: "quote",
    content: "Content should be structured in a way that is meaningful to both humans and machines, allowing for precise updates and transformations while maintaining semantic context.",
    attribution: "BlockDoc Design Principles"
  });
  
  blogPost.addBlock(quoteBlock);

  // Add a conclusion
  blogPost.addBlock(Block.heading(
    "conclusion",
    2,
    "Getting Started"
  ));

  blogPost.addBlock(Block.text(
    "conclusion-text",
    "Ready to try BlockDoc for yourself? Check out our [GitHub repository](https://github.com/berrydev-ai/blockdoc) and follow the installation instructions to get started.\n\n" +
    "BlockDoc is perfect for content-heavy applications, CMS systems, documentation sites, and anywhere else you need structured, maintainable content."
  ));

  // Add a divider
  blogPost.addBlock(new Block({
    id: "end-divider",
    type: "divider",
    content: ""
  }));

  // Return the document
  return blogPost;
}

/**
 * Main function to run the example
 */
async function runExample() {
  console.log("Creating a sample BlockDoc blog post...");
  const blogPost = createBlogPost();
  
  // Validate the document against the schema
  console.log("Validating against schema...");
  try {
    blogPost.validate();
    console.log("✓ Document is valid");
  } catch (error) {
    console.error("✗ Validation failed:", error.message);
    return;
  }
  
  // Save the document as JSON
  const outputDir = path.join(__dirname, 'output');
  await fs.mkdir(outputDir, { recursive: true });
  
  console.log("Saving document as JSON...");
  await fs.writeFile(
    path.join(outputDir, 'blog-post.json'),
    blogPost.toString(),
    'utf8'
  );
  
  // Render to HTML
  console.log("Rendering to HTML...");
  const html = blogPost.renderToHTML();
  await fs.writeFile(
    path.join(outputDir, 'blog-post.html'),
    html,
    'utf8'
  );
  
  // Render to Markdown
  console.log("Rendering to Markdown...");
  const markdown = blogPost.renderToMarkdown();
  await fs.writeFile(
    path.join(outputDir, 'blog-post.md'),
    markdown,
    'utf8'
  );
  
  // Example of updating a block
  console.log("Updating a block...");
  blogPost.updateBlock("blockdoc-explanation", {
    content: "BlockDoc is a powerful structured content format designed for:\n\n" +
      "* **LLM-friendly** - Optimized for generation and modification by AI\n" +
      "* **Block-based** - Content is divided into modular blocks with semantic IDs\n" +
      "* **Flexible** - Supports various content types and nested structures\n" +
      "* **Database-ready** - Easy to store in document databases\n" +
      "* **Renderer-agnostic** - Output to HTML, Markdown, or other formats\n" +
      "* **Version control friendly** - Easy to track changes to specific content blocks"
  });
  
  console.log("Saving updated document...");
  await fs.writeFile(
    path.join(outputDir, 'blog-post-updated.json'),
    blogPost.toString(),
    'utf8'
  );
  
  console.log("Example complete! Output files saved to:", outputDir);
  console.log("• blog-post.json - The BlockDoc document in JSON format");
  console.log("• blog-post.html - The document rendered to HTML");
  console.log("• blog-post.md - The document rendered to Markdown");
  console.log("• blog-post-updated.json - The document after updating a block");
}

// Run the example
runExample().catch(error => {
  console.error("Example failed:", error);
  process.exit(1);
});