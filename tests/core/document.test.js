/**
 * Tests for BlockDocDocument class
 */
import { BlockDocDocument } from '../../src/core/document.js';
import { Block } from '../../src/core/block.js';

// Mock the schema module
jest.mock('../../src/schema-loader.js', () => ({
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

// Mock the renderer modules
jest.mock('../../src/renderers/html.js', () => ({
  renderToHTML: jest.fn().mockReturnValue('<article>Mocked HTML</article>')
}));

jest.mock('../../src/renderers/markdown.js', () => ({
  renderToMarkdown: jest.fn().mockReturnValue('# Mocked Markdown')
}));

describe('BlockDocDocument class', () => {
  describe('Constructor', () => {
    test('should create a document with required properties', () => {
      const doc = new BlockDocDocument({
        title: 'Test Document'
      });

      expect(doc.article.title).toBe('Test Document');
      expect(doc.article.blocks).toEqual([]);
      expect(doc.article.metadata).toEqual({});
    });

    test('should create a document with metadata', () => {
      const metadata = {
        author: 'John Doe',
        publishedDate: '2023-09-22T12:00:00Z',
        tags: ['test', 'document']
      };

      const doc = new BlockDocDocument({
        title: 'Test Document',
        metadata
      });

      expect(doc.article.metadata).toEqual(metadata);
    });

    test('should create a document with initial blocks', () => {
      const blocks = [
        {
          id: 'block1',
          type: 'text',
          content: 'Hello world'
        },
        {
          id: 'block2',
          type: 'heading',
          level: 2,
          content: 'Section title'
        }
      ];

      const doc = new BlockDocDocument({
        title: 'Test Document',
        blocks
      });

      expect(doc.article.blocks.length).toBe(2);
      expect(doc.article.blocks[0].id).toBe('block1');
      expect(doc.article.blocks[1].id).toBe('block2');
    });
  });

  describe('Block operations', () => {
    let doc;

    beforeEach(() => {
      doc = new BlockDocDocument({
        title: 'Test Document'
      });
    });

    test('addBlock() should add a block to the document', () => {
      const block = doc.addBlock({
        id: 'block1',
        type: 'text',
        content: 'Hello world'
      });

      expect(block).toBeInstanceOf(Block);
      expect(doc.article.blocks.length).toBe(1);
      expect(doc.article.blocks[0].id).toBe('block1');
    });

    test('addBlock() should throw error if block ID already exists', () => {
      doc.addBlock({
        id: 'block1',
        type: 'text',
        content: 'Hello world'
      });

      expect(() => doc.addBlock({
        id: 'block1',
        type: 'heading',
        level: 2,
        content: 'Section title'
      })).toThrow(/Block with ID "block1" already exists/);
    });

    test('insertBlock() should insert a block at a specific position', () => {
      doc.addBlock({
        id: 'block1',
        type: 'text',
        content: 'Hello world'
      });

      doc.addBlock({
        id: 'block3',
        type: 'text',
        content: 'End of document'
      });

      doc.insertBlock({
        id: 'block2',
        type: 'heading',
        level: 2,
        content: 'Section title'
      }, 1);

      expect(doc.article.blocks.length).toBe(3);
      expect(doc.article.blocks[0].id).toBe('block1');
      expect(doc.article.blocks[1].id).toBe('block2');
      expect(doc.article.blocks[2].id).toBe('block3');
    });

    test('getBlock() should return block by ID', () => {
      doc.addBlock({
        id: 'block1',
        type: 'text',
        content: 'Hello world'
      });

      const block = doc.getBlock('block1');
      expect(block).toBeDefined();
      expect(block.id).toBe('block1');
    });

    test('getBlock() should return null if block not found', () => {
      const block = doc.getBlock('nonexistent');
      expect(block).toBeNull();
    });

    test('updateBlock() should update an existing block', () => {
      doc.addBlock({
        id: 'block1',
        type: 'text',
        content: 'Hello world'
      });

      const updated = doc.updateBlock('block1', {
        content: 'Updated content'
      });

      expect(updated.content).toBe('Updated content');
      expect(doc.article.blocks[0].content).toBe('Updated content');
    });

    test('updateBlock() should throw error if block not found', () => {
      expect(() => doc.updateBlock('nonexistent', {
        content: 'Updated content'
      })).toThrow(/Block with ID "nonexistent" not found/);
    });

    test('removeBlock() should remove a block by ID', () => {
      doc.addBlock({
        id: 'block1',
        type: 'text',
        content: 'Hello world'
      });

      const result = doc.removeBlock('block1');
      expect(result).toBe(true);
      expect(doc.article.blocks.length).toBe(0);
    });

    test('removeBlock() should return false if block not found', () => {
      const result = doc.removeBlock('nonexistent');
      expect(result).toBe(false);
    });

    test('moveBlock() should move a block to a new position', () => {
      doc.addBlock({
        id: 'block1',
        type: 'text',
        content: 'First block'
      });

      doc.addBlock({
        id: 'block2',
        type: 'text',
        content: 'Second block'
      });

      doc.addBlock({
        id: 'block3',
        type: 'text',
        content: 'Third block'
      });

      const result = doc.moveBlock('block3', 0);
      expect(result).toBe(true);
      expect(doc.article.blocks[0].id).toBe('block3');
      expect(doc.article.blocks[1].id).toBe('block1');
      expect(doc.article.blocks[2].id).toBe('block2');
    });

    test('moveBlock() should return false if block not found', () => {
      doc.addBlock({
        id: 'block1',
        type: 'text',
        content: 'First block'
      });

      const result = doc.moveBlock('nonexistent', 0);
      expect(result).toBe(false);
    });

    test('moveBlock() should throw error if position is invalid', () => {
      doc.addBlock({
        id: 'block1',
        type: 'text',
        content: 'First block'
      });

      expect(() => doc.moveBlock('block1', -1)).toThrow(/Invalid position/);
      expect(() => doc.moveBlock('block1', 1)).toThrow(/Invalid position/);
    });
  });

  describe('Rendering and export', () => {
    let doc;

    beforeEach(() => {
      doc = new BlockDocDocument({
        title: 'Test Document',
        blocks: [
          {
            id: 'block1',
            type: 'text',
            content: 'Hello world'
          }
        ]
      });
    });

    test('renderToHTML() should render document to HTML', () => {
      const html = doc.renderToHTML();
      expect(html).toBe('<article>Mocked HTML</article>');
    });

    test('renderToMarkdown() should render document to Markdown', () => {
      const markdown = doc.renderToMarkdown();
      expect(markdown).toBe('# Mocked Markdown');
    });

    test('toJSON() should return document as JSON object', () => {
      const json = doc.toJSON();
      expect(json).toEqual({
        article: {
          title: 'Test Document',
          metadata: {},
          blocks: [
            {
              id: 'block1',
              type: 'text',
              content: 'Hello world'
            }
          ]
        }
      });
    });

    test('toString() should return document as JSON string', () => {
      const jsonString = doc.toString();
      expect(JSON.parse(jsonString)).toEqual({
        article: {
          title: 'Test Document',
          metadata: {},
          blocks: [
            {
              id: 'block1',
              type: 'text',
              content: 'Hello world'
            }
          ]
        }
      });
    });
  });

  describe('Static methods', () => {
    test('fromJSON() should create document from JSON object', () => {
      const json = {
        article: {
          title: 'Test Document',
          metadata: {
            author: 'John Doe'
          },
          blocks: [
            {
              id: 'block1',
              type: 'text',
              content: 'Hello world'
            }
          ]
        }
      };

      const doc = BlockDocDocument.fromJSON(json);
      expect(doc).toBeInstanceOf(BlockDocDocument);
      expect(doc.article.title).toBe('Test Document');
      expect(doc.article.metadata.author).toBe('John Doe');
      expect(doc.article.blocks.length).toBe(1);
    });

    test('fromJSON() should create document from JSON string', () => {
      const jsonString = JSON.stringify({
        article: {
          title: 'Test Document',
          blocks: [
            {
              id: 'block1',
              type: 'text',
              content: 'Hello world'
            }
          ]
        }
      });

      const doc = BlockDocDocument.fromJSON(jsonString);
      expect(doc).toBeInstanceOf(BlockDocDocument);
      expect(doc.article.title).toBe('Test Document');
      expect(doc.article.blocks.length).toBe(1);
    });

    test('fromJSON() should throw error if JSON is invalid', () => {
      expect(() => BlockDocDocument.fromJSON({
        notAnArticle: {}
      })).toThrow(/missing article property/);
    });
  });

  describe('validate()', () => {
    test('should validate a valid document', () => {
      const doc = new BlockDocDocument({
        title: 'Test Document',
        blocks: [{
          id: 'block1',
          type: 'text',
          content: 'Hello world'
        }]
      });
      
      expect(doc.validate()).toBe(true);
    });
  });
});