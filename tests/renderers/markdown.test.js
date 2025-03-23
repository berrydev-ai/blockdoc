/**
 * Tests for Markdown renderer
 */
import { renderToMarkdown } from '../../src/renderers/markdown.js';

describe('Markdown Renderer', () => {
  describe('renderToMarkdown', () => {
    test('should throw error with invalid article structure', () => {
      expect(() => renderToMarkdown(null)).toThrow(/Invalid article structure/);
      expect(() => renderToMarkdown({})).toThrow(/Invalid article structure/);
      expect(() => renderToMarkdown({ blocks: 'not-an-array' })).toThrow(/Invalid article structure/);
    });

    test('should render article with title', () => {
      const article = {
        title: 'Test Article',
        blocks: []
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('# Test Article');
    });

    test('should render article with metadata', () => {
      const article = {
        title: 'Test Article',
        metadata: {
          author: 'John Doe',
          publishedDate: '2023-09-22T12:00:00Z',
          tags: ['test', 'document']
        },
        blocks: []
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('> Author: John Doe');
      expect(markdown).toContain('> Published: ');
      expect(markdown).toContain('> Tags: test, document');
    });

    test('should render text block', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'text-block',
            type: 'text',
            content: 'Markdown content with **bold** and *italic*'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('Markdown content with **bold** and *italic*');
    });

    test('should render heading block', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'heading-block',
            type: 'heading',
            level: 2,
            content: 'Section Heading'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('## Section Heading');
    });

    test('should clamp heading level to valid range', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'heading-block-1',
            type: 'heading',
            level: 0,
            content: 'Too Low'
          },
          {
            id: 'heading-block-2',
            type: 'heading',
            level: 8,
            content: 'Too High'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('# Too Low');
      expect(markdown).toContain('###### Too High');
    });

    test('should render image block', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'image-block',
            type: 'image',
            content: '',
            url: 'https://example.com/image.jpg',
            alt: 'Example image'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('![Example image](https://example.com/image.jpg)');
    });

    test('should render image block with caption', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'image-block',
            type: 'image',
            content: '',
            url: 'https://example.com/image.jpg',
            alt: 'Example image',
            caption: 'Image caption'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('![Example image](https://example.com/image.jpg)\n*Image caption*');
    });

    test('should render code block', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'code-block',
            type: 'code',
            content: 'const x = 1;',
            language: 'javascript'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('```javascript\nconst x = 1;\n```');
    });

    test('should render code block without language', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'code-block',
            type: 'code',
            content: 'const x = 1;'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('```\nconst x = 1;\n```');
    });

    test('should render unordered list block', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'list-block',
            type: 'list',
            content: '',
            items: ['Item 1', 'Item 2', 'Item 3'],
            listType: 'unordered'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('- Item 1\n- Item 2\n- Item 3');
    });

    test('should render ordered list block', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'list-block',
            type: 'list',
            content: '',
            items: ['Item 1', 'Item 2', 'Item 3'],
            listType: 'ordered'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('1. Item 1\n2. Item 2\n3. Item 3');
    });

    test('should handle invalid list items', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'list-block',
            type: 'list',
            content: '',
            listType: 'unordered'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('[Invalid list items]');
    });

    test('should render quote block', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'quote-block',
            type: 'quote',
            content: 'Quote content'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('> Quote content');
    });

    test('should render quote block with attribution', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'quote-block',
            type: 'quote',
            content: 'Quote content',
            attribution: 'Author Name'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('> Quote content');
      expect(markdown).toContain('Author Name');
    });

    test('should render multiline quote block', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'quote-block',
            type: 'quote',
            content: 'Quote line 1\nQuote line 2'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('> Quote line 1\n> Quote line 2');
    });

    test('should render embed block', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'embed-block',
            type: 'embed',
            content: '',
            url: 'https://example.com/embed',
            embedType: 'youtube'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('[youtube: https://example.com/embed](https://example.com/embed)');
    });

    test('should render embed block with caption', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'embed-block',
            type: 'embed',
            content: '',
            url: 'https://example.com/embed',
            embedType: 'youtube',
            caption: 'Embed caption'
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('*Embed caption*');
    });

    test('should render divider block', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'divider-block',
            type: 'divider',
            content: ''
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('---');
    });

    test('should handle unknown block type', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'unknown-block',
            type: 'unknown',
            content: ''
          }
        ]
      };

      const markdown = renderToMarkdown(article);
      expect(markdown).toContain('[Unknown block type: unknown]');
    });
  });
});