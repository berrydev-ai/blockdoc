/**
 * Integration tests for BlockDoc library
 */
import { Block, BlockDocDocument } from '../src/index.js';

// Mock the schema module and renderers
jest.mock('../src/schema-loader.js', () => ({
  schema: {
    type: 'object',
    properties: {
      article: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          blocks: { type: 'array' }
        }
      }
    }
  }
}));

jest.mock('../src/renderers/html.js', () => ({
  renderToHTML: jest.fn().mockReturnValue('<article>Mocked HTML</article>')
}));

jest.mock('../src/renderers/markdown.js', () => ({
  renderToMarkdown: jest.fn().mockReturnValue('# Mocked Markdown')
}));

describe('BlockDoc Integration Tests', () => {
  test('should create a document with multiple block types', () => {
    // Create a document
    const doc = new BlockDocDocument({
      title: 'Test Integration Document',
      metadata: {
        author: 'Test Author',
        publishedDate: new Date().toISOString(),
        tags: ['test', 'integration']
      }
    });

    // Add various block types
    doc.addBlock(Block.heading('heading1', 1, 'Main Heading'));
    doc.addBlock(Block.text('intro', 'This is an *introduction* paragraph with **bold** text.'));
    doc.addBlock(Block.heading('heading2', 2, 'Section Heading'));
    doc.addBlock(Block.list('list1', [
      'Item one',
      'Item two',
      'Item three'
    ], 'unordered'));
    doc.addBlock(Block.code('code1', 'javascript', 'function test() {\n  return true;\n}'));
    doc.addBlock(Block.image('image1', 'https://example.com/image.jpg', 'Example image', 'Example caption'));
    doc.addBlock(Block.text('conclusion', 'This is a conclusion paragraph.'));

    // Verify document structure
    expect(doc.article.blocks.length).toBe(7);
    expect(doc.article.blocks[0].type).toBe('heading');
    expect(doc.article.blocks[1].type).toBe('text');
    expect(doc.article.blocks[2].type).toBe('heading');
    expect(doc.article.blocks[3].type).toBe('list');
    expect(doc.article.blocks[4].type).toBe('code');
    expect(doc.article.blocks[5].type).toBe('image');
    expect(doc.article.blocks[6].type).toBe('text');

    // Verify specific block data
    expect(doc.article.blocks[0].level).toBe(1);
    expect(doc.article.blocks[0].content).toBe('Main Heading');
    expect(doc.article.blocks[3].items.length).toBe(3);
    expect(doc.article.blocks[4].language).toBe('javascript');
    expect(doc.article.blocks[5].url).toBe('https://example.com/image.jpg');
    expect(doc.article.blocks[5].caption).toBe('Example caption');
    
    // Verify JSON serialization and deserialization
    const jsonData = doc.toJSON();
    const recreatedDoc = BlockDocDocument.fromJSON(jsonData);
    
    expect(recreatedDoc.article.title).toBe('Test Integration Document');
    expect(recreatedDoc.article.blocks.length).toBe(7);
    expect(recreatedDoc.article.blocks[0].content).toBe('Main Heading');
    
    // Verify document manipulation
    doc.updateBlock('heading2', { content: 'Updated Section Heading' });
    expect(doc.getBlock('heading2').content).toBe('Updated Section Heading');
    
    doc.removeBlock('list1');
    expect(doc.article.blocks.length).toBe(6);
    expect(doc.getBlock('list1')).toBeNull();
    
    doc.moveBlock('conclusion', 0);
    expect(doc.article.blocks[0].id).toBe('conclusion');
  });
  
  test('should build a simple article and convert to different formats', () => {
    // Create a document
    const doc = new BlockDocDocument({
      title: 'Simple Article'
    });
    
    doc.addBlock(Block.text('intro', 'Introduction text.'));
    doc.addBlock(Block.text('body', 'Body text.'));
    doc.addBlock(Block.text('conclusion', 'Conclusion text.'));
    
    // Get JSON representation
    const json = doc.toJSON();
    expect(json).toHaveProperty('article');
    expect(json.article.title).toBe('Simple Article');
    expect(json.article.blocks.length).toBe(3);
    
    // Get string representation
    const jsonString = doc.toString();
    expect(typeof jsonString).toBe('string');
    expect(JSON.parse(jsonString)).toEqual(json);
    
    // Test HTML and Markdown rendering (mocked)
    doc.renderToHTML();
    doc.renderToMarkdown();
  });
});