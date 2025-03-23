/**
 * Tests for Block class
 */
import { Block } from '../../src/core/block.js';

describe('Block class', () => {
  describe('Constructor', () => {
    test('should create a valid block with required properties', () => {
      const block = new Block({
        id: 'test-block',
        type: 'text',
        content: 'Hello world'
      });

      expect(block.id).toBe('test-block');
      expect(block.type).toBe('text');
      expect(block.content).toBe('Hello world');
    });

    test('should throw error when ID is missing', () => {
      expect(() => new Block({
        type: 'text',
        content: 'Hello world'
      })).toThrow(/Block ID is required/);
    });

    test('should throw error when type is invalid', () => {
      expect(() => new Block({
        id: 'test-block',
        type: 'invalid-type',
        content: 'Hello world'
      })).toThrow(/Invalid block type/);
    });

    test('should handle empty content', () => {
      const block = new Block({
        id: 'test-block',
        type: 'text'
      });

      expect(block.content).toBe('');
    });

    test('should require type-specific properties for heading', () => {
      expect(() => new Block({
        id: 'heading-block',
        type: 'heading',
        content: 'Heading'
      })).toThrow(/requires property "level"/);

      const block = new Block({
        id: 'heading-block',
        type: 'heading',
        content: 'Heading',
        level: 2
      });

      expect(block.level).toBe(2);
    });

    test('should require type-specific properties for code', () => {
      expect(() => new Block({
        id: 'code-block',
        type: 'code',
        content: 'const x = 1;'
      })).toThrow(/requires property "language"/);

      const block = new Block({
        id: 'code-block',
        type: 'code',
        content: 'const x = 1;',
        language: 'javascript'
      });

      expect(block.language).toBe('javascript');
    });

    test('should require type-specific properties for image', () => {
      expect(() => new Block({
        id: 'image-block',
        type: 'image',
        content: ''
      })).toThrow(/requires property "url"/);

      expect(() => new Block({
        id: 'image-block',
        type: 'image',
        content: '',
        url: 'https://example.com/image.jpg'
      })).toThrow(/requires property "alt"/);

      const block = new Block({
        id: 'image-block',
        type: 'image',
        content: '',
        url: 'https://example.com/image.jpg',
        alt: 'Example image'
      });

      expect(block.url).toBe('https://example.com/image.jpg');
      expect(block.alt).toBe('Example image');
    });

    test('should require type-specific properties for list', () => {
      expect(() => new Block({
        id: 'list-block',
        type: 'list',
        content: ''
      })).toThrow(/requires property "items"/);

      expect(() => new Block({
        id: 'list-block',
        type: 'list',
        content: '',
        items: ['Item 1', 'Item 2']
      })).toThrow(/requires property "listType"/);

      const block = new Block({
        id: 'list-block',
        type: 'list',
        content: '',
        items: ['Item 1', 'Item 2'],
        listType: 'unordered'
      });

      expect(block.items).toEqual(['Item 1', 'Item 2']);
      expect(block.listType).toBe('unordered');
    });

    test('should copy additional properties', () => {
      const block = new Block({
        id: 'test-block',
        type: 'text',
        content: 'Hello world',
        customProp: 'custom value'
      });

      expect(block.customProp).toBe('custom value');
    });
  });

  describe('update()', () => {
    test('should update block properties', () => {
      const block = new Block({
        id: 'test-block',
        type: 'text',
        content: 'Hello world'
      });

      block.update({
        content: 'Updated content',
        customProp: 'custom value'
      });

      expect(block.content).toBe('Updated content');
      expect(block.customProp).toBe('custom value');
    });

    test('should not allow updating id or type', () => {
      const block = new Block({
        id: 'test-block',
        type: 'text',
        content: 'Hello world'
      });

      block.update({
        id: 'new-id',
        type: 'heading',
        content: 'Updated content'
      });

      expect(block.id).toBe('test-block');
      expect(block.type).toBe('text');
      expect(block.content).toBe('Updated content');
    });
  });

  describe('toJSON()', () => {
    test('should convert block to plain object', () => {
      const block = new Block({
        id: 'test-block',
        type: 'text',
        content: 'Hello world',
        customProp: 'custom value'
      });

      const json = block.toJSON();

      expect(json).toEqual({
        id: 'test-block',
        type: 'text',
        content: 'Hello world',
        customProp: 'custom value'
      });
    });
  });

  describe('Factory methods', () => {
    test('Block.text() should create a text block', () => {
      const block = Block.text('text-block', 'Hello world');

      expect(block.id).toBe('text-block');
      expect(block.type).toBe('text');
      expect(block.content).toBe('Hello world');
    });

    test('Block.heading() should create a heading block', () => {
      const block = Block.heading('heading-block', 2, 'Hello world');

      expect(block.id).toBe('heading-block');
      expect(block.type).toBe('heading');
      expect(block.content).toBe('Hello world');
      expect(block.level).toBe(2);
    });

    test('Block.image() should create an image block', () => {
      const block = Block.image(
        'image-block',
        'https://example.com/image.jpg',
        'Example image',
        'Image caption'
      );

      expect(block.id).toBe('image-block');
      expect(block.type).toBe('image');
      expect(block.url).toBe('https://example.com/image.jpg');
      expect(block.alt).toBe('Example image');
      expect(block.caption).toBe('Image caption');
    });

    test('Block.code() should create a code block', () => {
      const block = Block.code('code-block', 'javascript', 'const x = 1;');

      expect(block.id).toBe('code-block');
      expect(block.type).toBe('code');
      expect(block.content).toBe('const x = 1;');
      expect(block.language).toBe('javascript');
    });

    test('Block.list() should create a list block', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const block = Block.list('list-block', items, 'ordered');

      expect(block.id).toBe('list-block');
      expect(block.type).toBe('list');
      expect(block.items).toEqual(items);
      expect(block.listType).toBe('ordered');
    });

    test('Block.list() should default to unordered list type', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const block = Block.list('list-block', items);

      expect(block.listType).toBe('unordered');
    });
  });
});