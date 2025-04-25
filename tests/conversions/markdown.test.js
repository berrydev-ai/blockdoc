/**
 * Test the Markdown to BlockDoc converter
 */

import { markdownToBlockDoc } from '../../src/conversions/markdown.js';
import { BlockDocDocument } from '../../src/core/document.js';

describe('markdownToBlockDoc', () => {
  test('basic markdown conversion', () => {
    const markdown = `# Test Document
    
This is a paragraph with **bold** and *italic* text.
    `;
    
    const doc = markdownToBlockDoc(markdown);
    
    expect(doc).toBeInstanceOf(BlockDocDocument);
    expect(doc.article.title).toBe('Test Document');
    expect(doc.article.blocks.length).toBe(1);
    expect(doc.article.blocks[0].type).toBe('text');
    expect(doc.article.blocks[0].content).toContain('bold');
  });

  test('markdown conversion with explicit title', () => {
    const markdown = `# Test Document
    
This is a paragraph.
    `;
    
    const doc = markdownToBlockDoc(markdown, 'Explicit Title');
    
    expect(doc.article.title).toBe('Explicit Title');
  });

  test('markdown conversion with metadata', () => {
    const markdown = `# Test Document
    
This is a paragraph.
    `;
    
    const metadata = {
      author: 'Test Author',
      tags: ['test', 'markdown']
    };
    
    const doc = markdownToBlockDoc(markdown, undefined, metadata);
    
    expect(doc.article.metadata.author).toBe('Test Author');
    expect(doc.article.metadata.tags).toContain('test');
  });

  test('conversion of different markdown block types', () => {
    const markdown = `# Heading 1

## Heading 2

This is a paragraph.

- List item 1
- List item 2

1. Ordered item 1
2. Ordered item 2

\`\`\`javascript
function test() {
  return true;
}
\`\`\`

> This is a quote
> Multiple lines
> — Attribution

![Alt text](https://example.com/image.jpg) Caption

---

Final paragraph.
`;
    
    const doc = markdownToBlockDoc(markdown);
    
    // Check that we have the expected number of blocks
    expect(doc.article.blocks.length).toBeGreaterThanOrEqual(9);
    
    // Extract block types
    const blockTypes = doc.article.blocks.map(block => block.type);
    
    // Check that we have all the expected block types
    expect(blockTypes).toContain('heading');
    expect(blockTypes).toContain('text');
    expect(blockTypes).toContain('list');
    expect(blockTypes).toContain('code');
    expect(blockTypes).toContain('quote');
    expect(blockTypes).toContain('image');
    expect(blockTypes).toContain('divider');
    
    // Check heading levels
    const headings = doc.article.blocks.filter(block => block.type === 'heading');
    expect(headings.some(h => h.level === 2)).toBeTruthy();
    
    // Check list types
    const lists = doc.article.blocks.filter(block => block.type === 'list');
    const listTypes = lists.map(l => l.listType);
    expect(listTypes).toContain('ordered');
    expect(listTypes).toContain('unordered');
    
    // Check code block language
    const codeBlocks = doc.article.blocks.filter(block => block.type === 'code');
    expect(codeBlocks[0].language).toBe('javascript');
    
    // Check quote attribution
    const quotes = doc.article.blocks.filter(block => block.type === 'quote');
    expect(quotes[0].attribution).toContain('Attribution');
  });

  test('empty markdown', () => {
    const doc = markdownToBlockDoc('');
    
    expect(doc.article.title).toBe('Untitled Document');
    expect(doc.article.blocks.length).toBe(0);
  });
});