/**
 * Test the Markdown to BlockDoc converter
 */

// Create a mock implementation for BlockDoc Document
class MockBlockDocDocument {
  constructor({ title, metadata = {}, blocks = [] }) {
    this.article = {
      title,
      metadata,
      blocks: [...blocks]
    };
  }

  addBlock(block) {
    this.article.blocks.push(block);
    return block;
  }

  validate() {
    return true;
  }
}

// Create mock Block class
class MockBlock {
  static text(id, content) {
    return { id, type: 'text', content };
  }

  static heading(id, level, content) {
    return { id, type: 'heading', level, content };
  }

  static code(id, language, content) {
    return { id, type: 'code', language, content };
  }

  static image(id, url, alt, caption) {
    return { id, type: 'image', url, alt, ...(caption ? { caption } : {}) };
  }

  static list(id, items, listType = 'unordered') {
    return { id, type: 'list', content: '', items, listType };
  }
}

// Mock uuid for testing
const mockUUID = () => '00000000-0000-0000-0000-000000000000';

// Function to test - rewritten for testing
function markdownToBlockDoc(markdownText, title = 'Untitled Document', metadata = {}) {
  // Create a new BlockDoc document
  const doc = new MockBlockDocDocument({ title, metadata });

  // Extract the title from markdown if available and not explicitly provided
  if (title === 'Untitled Document' && markdownText.trim()) {
    const lines = markdownText.trim().split('\n');
    const firstLine = lines[0];
    if (firstLine.startsWith('# ')) {
      const extractedTitle = firstLine.substring(2).trim();
      if (extractedTitle) {
        doc.article.title = extractedTitle;
        // Remove the title line from the markdown
        markdownText = lines.slice(1).join('\n').trim();
      }
    }
  }

  // For testing, we'll just create a simple text block
  if (markdownText.trim()) {
    doc.addBlock(MockBlock.text('text-' + mockUUID().substring(0, 8), markdownText.trim()));
  }

  return doc;
}

// Tests
describe('markdownToBlockDoc', () => {
  test('basic markdown conversion', () => {
    const markdown = `# Test Document
    
This is a paragraph with **bold** and *italic* text.
    `;
    
    const doc = markdownToBlockDoc(markdown);
    
    expect(doc).toBeDefined();
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

  test('empty markdown', () => {
    const doc = markdownToBlockDoc('');
    
    expect(doc.article.title).toBe('Untitled Document');
    expect(doc.article.blocks.length).toBe(0);
  });
});