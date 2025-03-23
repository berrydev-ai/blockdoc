/**
 * Tests for HTML renderer
 */
import { renderToHTML } from '../../src/renderers/html.js';
import { marked } from 'marked';
import hljs from 'highlight.js';

// Mock dependencies
jest.mock('marked', () => ({
  marked: {
    setOptions: jest.fn(),
    parse: jest.fn(content => `<p>${content}</p>`)
  }
}));

jest.mock('highlight.js', () => ({
  __esModule: true,
  default: {
    highlight: jest.fn().mockReturnValue({ value: '<span class="hljs-keyword">highlighted</span>' }),
    highlightAuto: jest.fn().mockReturnValue({ value: '<span class="hljs-keyword">auto-highlighted</span>' }),
    getLanguage: jest.fn(lang => lang === 'javascript')
  }
}));

jest.mock('../../src/utils/sanitize.js', () => ({
  sanitizeHtml: jest.fn(html => `sanitized:${html}`)
}));

describe('HTML Renderer', () => {
  describe('renderToHTML', () => {
    test('should throw error with invalid article structure', () => {
      expect(() => renderToHTML(null)).toThrow(/Invalid article structure/);
      expect(() => renderToHTML({})).toThrow(/Invalid article structure/);
      expect(() => renderToHTML({ blocks: 'not-an-array' })).toThrow(/Invalid article structure/);
    });

    test('should render article with title and blocks', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'block1',
            type: 'text',
            content: 'Hello world'
          },
          {
            id: 'block2',
            type: 'heading',
            level: 2,
            content: 'Section Heading'
          }
        ]
      };

      const html = renderToHTML(article);
      expect(html).toContain('<article class="blockdoc-article">');
      expect(html).toContain('<h1 class="blockdoc-title">sanitized:Test Article</h1>');
      expect(html).toContain('data-block-id="block1"');
      expect(html).toContain('data-block-id="block2"');
    });

    test('should render text block', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'text-block',
            type: 'text',
            content: 'Markdown content'
          }
        ]
      };

      renderToHTML(article);
      expect(marked.parse).toHaveBeenCalledWith('Markdown content');
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

      const html = renderToHTML(article);
      expect(html).toContain('<h2>sanitized:Section Heading</h2>');
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

      const html = renderToHTML(article);
      expect(html).toContain('<h2>sanitized:Too Low</h2>');
      expect(html).toContain('<h6>sanitized:Too High</h6>');
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

      const html = renderToHTML(article);
      expect(html).toContain('<img src="sanitized:https://example.com/image.jpg" alt="sanitized:Example image" class="blockdoc-image" />');
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

      const html = renderToHTML(article);
      expect(html).toContain('<figure class="blockdoc-figure">');
      expect(html).toContain('<figcaption class="blockdoc-caption">sanitized:Image caption</figcaption>');
    });

    test('should render code block with syntax highlighting', () => {
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

      renderToHTML(article);
      expect(hljs.highlight).toHaveBeenCalledWith('const x = 1;', { language: 'javascript' });
    });

    test('should render code block with auto-detection when language is not supported', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'code-block',
            type: 'code',
            content: 'const x = 1;',
            language: 'unsupported'
          }
        ]
      };

      renderToHTML(article);
      expect(hljs.highlightAuto).toHaveBeenCalledWith('const x = 1;');
    });

    test('should handle errors in code highlighting', () => {
      hljs.highlight.mockImplementationOnce(() => {
        throw new Error('Highlighting error');
      });

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

      const html = renderToHTML(article);
      expect(html).toContain('sanitized:const x = 1;');
    });

    test('should render list block', () => {
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

      const html = renderToHTML(article);
      expect(html).toContain('<ul class="blockdoc-list blockdoc-list-unordered">');
      expect(marked.parse).toHaveBeenCalledWith('Item 1');
      expect(marked.parse).toHaveBeenCalledWith('Item 2');
      expect(marked.parse).toHaveBeenCalledWith('Item 3');
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

      const html = renderToHTML(article);
      expect(html).toContain('<ol class="blockdoc-list blockdoc-list-ordered">');
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

      const html = renderToHTML(article);
      expect(html).toContain('<p>Invalid list items</p>');
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

      const html = renderToHTML(article);
      expect(html).toContain('<blockquote class="blockdoc-quote">');
      expect(marked.parse).toHaveBeenCalledWith('Quote content');
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

      const html = renderToHTML(article);
      expect(html).toContain('<cite class="blockdoc-attribution">sanitized:Author Name</cite>');
    });

    test('should render YouTube embed block', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'embed-block',
            type: 'embed',
            content: '',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            embedType: 'youtube'
          }
        ]
      };

      const html = renderToHTML(article);
      expect(html).toContain('src="https://www.youtube.com/embed/dQw4w9WgXcQ"');
    });

    test('should render YouTube embed from youtu.be URL', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'embed-block',
            type: 'embed',
            content: '',
            url: 'https://youtu.be/dQw4w9WgXcQ',
            embedType: 'youtube'
          }
        ]
      };

      const html = renderToHTML(article);
      expect(html).toContain('src="https://www.youtube.com/embed/dQw4w9WgXcQ"');
    });

    test('should handle invalid YouTube URL', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'embed-block',
            type: 'embed',
            content: '',
            url: 'https://example.com/not-a-youtube-video',
            embedType: 'youtube'
          }
        ]
      };

      const html = renderToHTML(article);
      expect(html).toContain('<p>Invalid YouTube URL</p>');
    });

    test('should render Twitter embed block', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'embed-block',
            type: 'embed',
            content: '',
            url: 'https://twitter.com/user/status/123456789',
            embedType: 'twitter'
          }
        ]
      };

      const html = renderToHTML(article);
      expect(html).toContain('<div class="blockdoc-embed blockdoc-twitter">');
      expect(html).toContain('<blockquote class="twitter-tweet">');
      expect(html).toContain('sanitized:https://twitter.com/user/status/123456789');
    });

    test('should render generic embed block', () => {
      const article = {
        title: 'Test Article',
        blocks: [
          {
            id: 'embed-block',
            type: 'embed',
            content: '',
            url: 'https://example.com/embed',
            embedType: 'other'
          }
        ]
      };

      const html = renderToHTML(article);
      expect(html).toContain('<div class="blockdoc-embed">');
      expect(html).toContain('src="sanitized:https://example.com/embed"');
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
            embedType: 'other',
            caption: 'Embed caption'
          }
        ]
      };

      const html = renderToHTML(article);
      expect(html).toContain('<figure class="blockdoc-figure">');
      expect(html).toContain('<figcaption class="blockdoc-caption">sanitized:Embed caption</figcaption>');
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

      const html = renderToHTML(article);
      expect(html).toContain('<hr class="blockdoc-divider" />');
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

      const html = renderToHTML(article);
      expect(html).toContain('<p>Unknown block type: unknown</p>');
    });
  });
});