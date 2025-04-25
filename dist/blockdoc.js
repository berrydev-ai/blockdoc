(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('ajv'), require('ajv-formats'), require('fs'), require('path'), require('url'), require('marked'), require('highlight.js')) :
  typeof define === 'function' && define.amd ? define(['exports', 'ajv', 'ajv-formats', 'fs', 'path', 'url', 'marked', 'highlight.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.BlockDoc = {}, global.Ajv, global.AjvFormats, global.fs, global.path, global.url, global.marked, global.hljs));
})(this, (function (exports, Ajv, addFormats, fs, path, url, marked, hljs) { 'use strict';

  var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
  /**
   * BlockDoc Block
   *
   * Represents a single content block within a BlockDoc document
   */

  // Define allowed block types
  const ALLOWED_TYPES = ['text', 'heading', 'image', 'code', 'list', 'quote', 'embed', 'divider'];

  // Define type-specific required properties
  const TYPE_REQUIREMENTS = {
    heading: ['level'],
    code: ['language'],
    image: ['url', 'alt'],
    list: ['items', 'listType']
  };
  class Block {
    /**
     * Create a new block
     * @param {Object} data - Block data
     * @param {string} data.id - Unique identifier
     * @param {string} data.type - Block type
     * @param {string} data.content - Block content
     * @param {Object} [data.properties] - Additional type-specific properties
     */
    constructor(data) {
      if (!data.id) {
        throw new Error('Block ID is required');
      }
      if (!data.type || !ALLOWED_TYPES.includes(data.type)) {
        throw new Error(`Invalid block type: ${data.type}. Allowed types are: ${ALLOWED_TYPES.join(', ')}`);
      }

      // Basic properties all blocks have
      this.id = data.id;
      this.type = data.type;
      this.content = data.content || '';

      // Check type-specific required properties
      const requiredProps = TYPE_REQUIREMENTS[this.type] || [];
      for (const prop of requiredProps) {
        if (data[prop] === undefined) {
          throw new Error(`Block of type "${this.type}" requires property "${prop}"`);
        }
        this[prop] = data[prop];
      }

      // Copy any additional properties
      Object.keys(data).forEach(key => {
        if (!['id', 'type', 'content'].includes(key) && this[key] === undefined) {
          this[key] = data[key];
        }
      });
    }

    /**
     * Update block properties
     * @param {Object} updates - Properties to update
     * @returns {Block} Updated block instance
     */
    update(updates) {
      // Cannot change block type or ID
      const {
        id,
        type,
        ...allowedUpdates
      } = updates;

      // Apply updates
      Object.keys(allowedUpdates).forEach(key => {
        this[key] = allowedUpdates[key];
      });
      return this;
    }

    /**
     * Convert block to plain object
     * @returns {Object} Block as plain object
     */
    toJSON() {
      const result = {
        id: this.id,
        type: this.type,
        content: this.content
      };

      // Add type-specific properties
      Object.keys(this).forEach(key => {
        if (!['id', 'type', 'content'].includes(key)) {
          result[key] = this[key];
        }
      });
      return result;
    }

    /**
     * Create common block types with simplified APIs
     */

    /**
     * Create a text block
     * @param {string} id - Block ID
     * @param {string} content - Markdown content
     * @returns {Block} New block instance
     */
    static text(id, content) {
      return new Block({
        id,
        type: 'text',
        content
      });
    }

    /**
     * Create a heading block
     * @param {string} id - Block ID
     * @param {number} level - Heading level (1-6)
     * @param {string} content - Heading text
     * @returns {Block} New block instance
     */
    static heading(id, level, content) {
      return new Block({
        id,
        type: 'heading',
        level,
        content
      });
    }

    /**
     * Create an image block
     * @param {string} id - Block ID
     * @param {string} url - Image URL
     * @param {string} alt - Alt text
     * @param {string} [caption] - Optional caption
     * @returns {Block} New block instance
     */
    static image(id, url, alt, caption) {
      return new Block({
        id,
        type: 'image',
        content: '',
        url,
        alt,
        ...(caption ? {
          caption
        } : {})
      });
    }

    /**
     * Create a code block
     * @param {string} id - Block ID
     * @param {string} language - Programming language
     * @param {string} content - Code content
     * @returns {Block} New block instance
     */
    static code(id, language, content) {
      return new Block({
        id,
        type: 'code',
        language,
        content
      });
    }

    /**
     * Create a list block
     * @param {string} id - Block ID
     * @param {Array<string>} items - List items
     * @param {string} [listType='unordered'] - List type (ordered or unordered)
     * @returns {Block} New block instance
     */
    static list(id, items) {
      let listType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'unordered';
      return new Block({
        id,
        type: 'list',
        content: '',
        items,
        listType
      });
    }
  }

  /**
   * BlockDoc Schema Loader
   * 
   * Loads the JSON schema without requiring import assertions
   */


  // Get current directory
  const __dirname = path.dirname(url.fileURLToPath((typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : typeof document === 'undefined' ? location.href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('blockdoc.js', document.baseURI).href))));

  // Load schema
  const schemaPath = path.join(__dirname, 'schema/blockdoc.schema.json');
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const schema = JSON.parse(schemaContent);

  /**
   * BlockDoc HTML Sanitization
   * 
   * Provides utilities for sanitizing HTML content
   */

  /**
   * Simple HTML sanitizer to prevent XSS
   * @param {string} html - HTML content to sanitize
   * @returns {string} Sanitized HTML
   */
  function sanitizeHtml(html) {
    if (!html) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#039;'
    };
    return String(html).replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  }

  /**
   * BlockDoc HTML Renderer
   *
   * Converts BlockDoc documents to HTML
   */


  // Configure marked
  marked.marked.setOptions({
    highlight: function (code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, {
          language: lang
        }).value;
      }
      return hljs.highlightAuto(code).value;
    },
    headerIds: true,
    mangle: false
  });

  /**
   * Render a BlockDoc document to HTML
   * @param {Object} article - The article object from a BlockDoc document
   * @returns {string} HTML representation
   */
  function renderToHTML(article) {
    if (!article || !article.blocks || !Array.isArray(article.blocks)) {
      throw new Error('Invalid article structure');
    }
    const html = ['<article class="blockdoc-article">', `<h1 class="blockdoc-title">${sanitizeHtml(article.title)}</h1>`];

    // Render each block
    article.blocks.forEach(block => {
      html.push(renderBlock(block));
    });
    html.push('</article>');
    return html.join('\n');
  }

  /**
   * Render a single block to HTML
   * @param {Object} block - Block data
   * @returns {string} HTML representation of the block
   */
  function renderBlock(block) {
    const {
      id,
      type
    } = block;

    // Wrapper with block ID and type as data attributes
    const openWrapper = `<div class="blockdoc-block blockdoc-${type}" data-block-id="${id}" data-block-type="${type}">`;
    const closeWrapper = '</div>';
    let content;
    switch (type) {
      case 'text':
        content = renderTextBlock(block);
        break;
      case 'heading':
        content = renderHeadingBlock(block);
        break;
      case 'image':
        content = renderImageBlock(block);
        break;
      case 'code':
        content = renderCodeBlock(block);
        break;
      case 'list':
        content = renderListBlock(block);
        break;
      case 'quote':
        content = renderQuoteBlock(block);
        break;
      case 'embed':
        content = renderEmbedBlock(block);
        break;
      case 'divider':
        content = renderDividerBlock();
        break;
      default:
        content = `<p>Unknown block type: ${type}</p>`;
    }
    return `${openWrapper}${content}${closeWrapper}`;
  }

  /**
   * Render a text block
   * @param {Object} block - Block data
   * @returns {string} HTML representation
   */
  function renderTextBlock(block) {
    // Use marked to convert markdown to HTML
    return marked.marked.parse(block.content);
  }

  /**
   * Render a heading block
   * @param {Object} block - Block data
   * @returns {string} HTML representation
   */
  function renderHeadingBlock(block) {
    const {
      level,
      content
    } = block;
    const validLevel = Math.min(Math.max(parseInt(level) || 2, 1), 6);
    return `<h${validLevel}>${sanitizeHtml(content)}</h${validLevel}>`;
  }

  /**
   * Render an image block
   * @param {Object} block - Block data
   * @returns {string} HTML representation
   */
  function renderImageBlock(block) {
    const {
      url,
      alt,
      caption
    } = block;
    let html = `<img src="${sanitizeHtml(url)}" alt="${sanitizeHtml(alt)}" class="blockdoc-image" />`;
    if (caption) {
      html += `<figcaption class="blockdoc-caption">${sanitizeHtml(caption)}</figcaption>`;
      return `<figure class="blockdoc-figure">${html}</figure>`;
    }
    return html;
  }

  /**
   * Render a code block
   * @param {Object} block - Block data
   * @returns {string} HTML representation
   */
  function renderCodeBlock(block) {
    const {
      language,
      content
    } = block;

    // Use highlight.js for syntax highlighting
    let highlightedCode;
    try {
      if (language && hljs.getLanguage(language)) {
        highlightedCode = hljs.highlight(content, {
          language
        }).value;
      } else {
        highlightedCode = hljs.highlightAuto(content).value;
      }
    } catch (e) {
      highlightedCode = sanitizeHtml(content);
    }
    return `
    <pre class="blockdoc-pre">
      <code class="blockdoc-code ${language ? `language-${language}` : ''}">${highlightedCode}</code>
    </pre>
  `;
  }

  /**
   * Render a list block
   * @param {Object} block - Block data
   * @returns {string} HTML representation
   */
  function renderListBlock(block) {
    const {
      items,
      listType
    } = block;
    if (!items || !Array.isArray(items)) {
      return '<p>Invalid list items</p>';
    }
    const tag = listType === 'ordered' ? 'ol' : 'ul';
    const itemsHtml = items.map(item => `<li>${marked.marked.parse(item)}</li>`).join('');
    return `<${tag} class="blockdoc-list blockdoc-list-${listType}">${itemsHtml}</${tag}>`;
  }

  /**
   * Render a quote block
   * @param {Object} block - Block data
   * @returns {string} HTML representation
   */
  function renderQuoteBlock(block) {
    const {
      content,
      attribution
    } = block;
    let html = `<blockquote class="blockdoc-quote">${marked.marked.parse(content)}</blockquote>`;
    if (attribution) {
      html += `<cite class="blockdoc-attribution">${sanitizeHtml(attribution)}</cite>`;
    }
    return html;
  }

  /**
   * Render an embed block
   * @param {Object} block - Block data
   * @returns {string} HTML representation
   */
  function renderEmbedBlock(block) {
    const {
      url,
      caption,
      embedType
    } = block;
    let embedHtml;
    if (embedType === 'youtube') {
      // Extract YouTube video ID
      const videoId = extractYouTubeId(url);
      if (videoId) {
        embedHtml = `
        <div class="blockdoc-embed-container">
          <iframe 
            width="560" 
            height="315" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `;
      } else {
        embedHtml = '<p>Invalid YouTube URL</p>';
      }
    } else if (embedType === 'twitter') {
      embedHtml = `
      <div class="blockdoc-embed blockdoc-twitter">
        <blockquote class="twitter-tweet">
          <a href="${sanitizeHtml(url)}"></a>
        </blockquote>
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      </div>
    `;
    } else {
      // Generic embed with iframe
      embedHtml = `
      <div class="blockdoc-embed">
        <iframe 
          src="${sanitizeHtml(url)}" 
          frameborder="0" 
          width="100%" 
          height="400"
          allowfullscreen>
        </iframe>
      </div>
    `;
    }
    if (caption) {
      embedHtml += `<figcaption class="blockdoc-caption">${sanitizeHtml(caption)}</figcaption>`;
      return `<figure class="blockdoc-figure">${embedHtml}</figure>`;
    }
    return embedHtml;
  }

  /**
   * Render a divider block
   * @returns {string} HTML representation
   */
  function renderDividerBlock() {
    return '<hr class="blockdoc-divider" />';
  }

  /**
   * Extract YouTube video ID from URL
   * @param {string} url - YouTube URL
   * @returns {string|null} YouTube video ID or null if invalid
   */
  function extractYouTubeId(url) {
    try {
      const parsedUrl = new URL(url);

      // Handle youtu.be format
      if (parsedUrl.hostname === 'youtu.be') {
        return parsedUrl.pathname.slice(1);
      }

      // Handle youtube.com format
      if (parsedUrl.hostname === 'www.youtube.com' || parsedUrl.hostname === 'youtube.com') {
        const params = new URLSearchParams(parsedUrl.search);
        return params.get('v');
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * BlockDoc Markdown Renderer
   *
   * Converts BlockDoc documents to Markdown
   */

  /**
   * Render a BlockDoc document to Markdown
   * @param {Object} article - The article object from a BlockDoc document
   * @returns {string} Markdown representation
   */
  function renderToMarkdown(article) {
    if (!article || !article.blocks || !Array.isArray(article.blocks)) {
      throw new Error('Invalid article structure');
    }
    const markdown = [`# ${article.title}`, ''];

    // Add metadata if present
    if (article.metadata) {
      if (article.metadata.author) {
        markdown.push(`> Author: ${article.metadata.author}`);
      }
      if (article.metadata.publishedDate) {
        const date = new Date(article.metadata.publishedDate);
        markdown.push(`> Published: ${date.toDateString()}`);
      }
      if (article.metadata.tags && Array.isArray(article.metadata.tags) && article.metadata.tags.length > 0) {
        markdown.push(`> Tags: ${article.metadata.tags.join(', ')}`);
      }
      markdown.push('');
    }

    // Render each block
    article.blocks.forEach(block => {
      markdown.push(renderBlockToMarkdown(block));
      markdown.push(''); // Add a blank line after each block
    });
    return markdown.join('\n');
  }

  /**
   * Render a single block to Markdown
   * @param {Object} block - Block data
   * @returns {string} Markdown representation of the block
   */
  function renderBlockToMarkdown(block) {
    const {
      type
    } = block;
    switch (type) {
      case 'text':
        return renderTextBlockToMarkdown(block);
      case 'heading':
        return renderHeadingBlockToMarkdown(block);
      case 'image':
        return renderImageBlockToMarkdown(block);
      case 'code':
        return renderCodeBlockToMarkdown(block);
      case 'list':
        return renderListBlockToMarkdown(block);
      case 'quote':
        return renderQuoteBlockToMarkdown(block);
      case 'embed':
        return renderEmbedBlockToMarkdown(block);
      case 'divider':
        return '---';
      default:
        return `[Unknown block type: ${type}]`;
    }
  }

  /**
   * Render a text block to Markdown
   * @param {Object} block - Block data
   * @returns {string} Markdown representation
   */
  function renderTextBlockToMarkdown(block) {
    // Text content is already in markdown format
    return block.content;
  }

  /**
   * Render a heading block to Markdown
   * @param {Object} block - Block data
   * @returns {string} Markdown representation
   */
  function renderHeadingBlockToMarkdown(block) {
    const {
      level,
      content
    } = block;
    const validLevel = Math.min(Math.max(parseInt(level) || 2, 1), 6);
    const hashtags = '#'.repeat(validLevel);
    return `${hashtags} ${content}`;
  }

  /**
   * Render an image block to Markdown
   * @param {Object} block - Block data
   * @returns {string} Markdown representation
   */
  function renderImageBlockToMarkdown(block) {
    const {
      url,
      alt,
      caption
    } = block;
    let markdown = `![${alt || ''}](${url})`;
    if (caption) {
      markdown += `\n*${caption}*`;
    }
    return markdown;
  }

  /**
   * Render a code block to Markdown
   * @param {Object} block - Block data
   * @returns {string} Markdown representation
   */
  function renderCodeBlockToMarkdown(block) {
    const {
      language,
      content
    } = block;
    return '```' + (language || '') + '\n' + content + '\n```';
  }

  /**
   * Render a list block to Markdown
   * @param {Object} block - Block data
   * @returns {string} Markdown representation
   */
  function renderListBlockToMarkdown(block) {
    const {
      items,
      listType
    } = block;
    if (!items || !Array.isArray(items)) {
      return '[Invalid list items]';
    }
    return items.map((item, index) => {
      if (listType === 'ordered') {
        return `${index + 1}. ${item}`;
      } else {
        return `- ${item}`;
      }
    }).join('\n');
  }

  /**
   * Render a quote block to Markdown
   * @param {Object} block - Block data
   * @returns {string} Markdown representation
   */
  function renderQuoteBlockToMarkdown(block) {
    const {
      content,
      attribution
    } = block;
    let markdown = content.split('\n').map(line => `> ${line}`).join('\n');
    if (attribution) {
      markdown += `\n>\n>  ${attribution}`;
    }
    return markdown;
  }

  /**
   * Render an embed block to Markdown
   * @param {Object} block - Block data
   * @returns {string} Markdown representation
   */
  function renderEmbedBlockToMarkdown(block) {
    const {
      url,
      caption,
      embedType
    } = block;
    let markdown = `[${embedType || 'Embedded content'}: ${url}](${url})`;
    if (caption) {
      markdown += `\n*${caption}*`;
    }
    return markdown;
  }

  /**
   * BlockDoc Document
   *
   * Core class for creating, manipulating and rendering BlockDoc documents
   */

  class BlockDocDocument {
    /**
     * Create a new BlockDoc document
     * @param {Object} options - Document initialization options
     * @param {string} options.title - Document title
     * @param {Object} [options.metadata] - Optional document metadata
     * @param {Array<Object>} [options.blocks] - Initial blocks to add
     */
    constructor(_ref) {
      let {
        title,
        metadata = {},
        blocks = []
      } = _ref;
      this.article = {
        title,
        metadata,
        blocks: []
      };

      // Add initial blocks if provided
      if (blocks && Array.isArray(blocks)) {
        blocks.forEach(block => this.addBlock(block));
      }
    }

    /**
     * Validate the document against the BlockDoc schema
     * @returns {boolean} True if valid
     * @throws {Error} If validation fails
     */
    validate() {
      const ajv = new Ajv();
      addFormats(ajv);
      const validate = ajv.compile(schema);
      const valid = validate({
        article: this.article
      });
      if (!valid) {
        const errors = validate.errors;
        throw new Error(`Invalid BlockDoc document: ${JSON.stringify(errors)}`);
      }
      return true;
    }

    /**
     * Add a block to the document
     * @param {Object} blockData - Block data
     * @returns {Block} The created block
     */
    addBlock(blockData) {
      // Check if ID already exists
      if (this.getBlock(blockData.id)) {
        throw new Error(`Block with ID "${blockData.id}" already exists`);
      }
      const block = new Block(blockData);
      this.article.blocks.push(block.toJSON());
      return block;
    }

    /**
     * Insert a block at a specific position
     * @param {Object} blockData - Block data
     * @param {number} position - Position to insert at
     * @returns {Block} The created block
     */
    insertBlock(blockData, position) {
      // Check if ID already exists
      if (this.getBlock(blockData.id)) {
        throw new Error(`Block with ID "${blockData.id}" already exists`);
      }
      const block = new Block(blockData);
      this.article.blocks.splice(position, 0, block.toJSON());
      return block;
    }

    /**
     * Get a block by ID
     * @param {string} id - Block ID
     * @returns {Object|null} The block or null if not found
     */
    getBlock(id) {
      return this.article.blocks.find(block => block.id === id) || null;
    }

    /**
     * Update a block by ID
     * @param {string} id - Block ID
     * @param {Object} updates - Properties to update
     * @returns {Object} The updated block
     */
    updateBlock(id, updates) {
      const index = this.article.blocks.findIndex(block => block.id === id);
      if (index === -1) {
        throw new Error(`Block with ID "${id}" not found`);
      }

      // Create a new block with the updates
      const currentBlock = this.article.blocks[index];
      const updatedBlock = {
        ...currentBlock,
        ...updates
      };

      // Validate the updated block
      const block = new Block(updatedBlock);

      // Update the block in the document
      this.article.blocks[index] = block.toJSON();
      return this.article.blocks[index];
    }

    /**
     * Remove a block by ID
     * @param {string} id - Block ID
     * @returns {boolean} True if removed
     */
    removeBlock(id) {
      const index = this.article.blocks.findIndex(block => block.id === id);
      if (index === -1) {
        return false;
      }
      this.article.blocks.splice(index, 1);
      return true;
    }

    /**
     * Move a block to a new position
     * @param {string} id - Block ID
     * @param {number} newPosition - New position
     * @returns {boolean} True if moved
     */
    moveBlock(id, newPosition) {
      const index = this.article.blocks.findIndex(block => block.id === id);
      if (index === -1) {
        return false;
      }
      if (newPosition < 0 || newPosition >= this.article.blocks.length) {
        throw new Error(`Invalid position: ${newPosition}`);
      }

      // Remove the block from its current position
      const [block] = this.article.blocks.splice(index, 1);

      // Insert it at the new position
      this.article.blocks.splice(newPosition, 0, block);
      return true;
    }

    /**
     * Render the document to HTML
     * @returns {string} HTML representation
     */
    renderToHTML() {
      return renderToHTML(this.article);
    }

    /**
     * Render the document to Markdown
     * @returns {string} Markdown representation
     */
    renderToMarkdown() {
      return renderToMarkdown(this.article);
    }

    /**
     * Export the document as a JSON object
     * @returns {Object} Document as JSON object
     */
    toJSON() {
      return {
        article: this.article
      };
    }

    /**
     * Export the document as a JSON string
     * @returns {string} Document as JSON string
     */
    toString() {
      return JSON.stringify(this.toJSON(), null, 2);
    }

    /**
     * Create a BlockDoc document from a JSON object
     * @param {Object|string} json - JSON object or string
     * @returns {BlockDocDocument} New document instance
     */
    static fromJSON(json) {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      if (!data.article) {
        throw new Error('Invalid BlockDoc document: missing article property');
      }
      return new BlockDocDocument({
        title: data.article.title,
        metadata: data.article.metadata || {},
        blocks: data.article.blocks || []
      });
    }
  }

  const byteToHex = [];
  for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).slice(1));
  }
  function unsafeStringify(arr, offset = 0) {
      return (byteToHex[arr[offset + 0]] +
          byteToHex[arr[offset + 1]] +
          byteToHex[arr[offset + 2]] +
          byteToHex[arr[offset + 3]] +
          '-' +
          byteToHex[arr[offset + 4]] +
          byteToHex[arr[offset + 5]] +
          '-' +
          byteToHex[arr[offset + 6]] +
          byteToHex[arr[offset + 7]] +
          '-' +
          byteToHex[arr[offset + 8]] +
          byteToHex[arr[offset + 9]] +
          '-' +
          byteToHex[arr[offset + 10]] +
          byteToHex[arr[offset + 11]] +
          byteToHex[arr[offset + 12]] +
          byteToHex[arr[offset + 13]] +
          byteToHex[arr[offset + 14]] +
          byteToHex[arr[offset + 15]]).toLowerCase();
  }

  let getRandomValues;
  const rnds8 = new Uint8Array(16);
  function rng() {
      if (!getRandomValues) {
          if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
              throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
          }
          getRandomValues = crypto.getRandomValues.bind(crypto);
      }
      return getRandomValues(rnds8);
  }

  const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  var native = { randomUUID };

  function v4(options, buf, offset) {
      if (native.randomUUID && true && !options) {
          return native.randomUUID();
      }
      options = options || {};
      const rnds = options.random ?? options.rng?.() ?? rng();
      if (rnds.length < 16) {
          throw new Error('Random bytes length must be >= 16');
      }
      rnds[6] = (rnds[6] & 0x0f) | 0x40;
      rnds[8] = (rnds[8] & 0x3f) | 0x80;
      return unsafeStringify(rnds);
  }

  /**
   * Markdown to BlockDoc Converter
   *
   * Utilities for converting Markdown documents to BlockDoc format
   */


  /**
   * Convert a Markdown document to BlockDoc format
   * 
   * @param {string} markdownText - The markdown content to convert
   * @param {string} [title='Untitled Document'] - Document title
   * @param {Object} [metadata={}] - Optional document metadata
   * @returns {BlockDocDocument} A BlockDoc document generated from the markdown
   */
  function markdownToBlockDoc(markdownText) {
    let title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Untitled Document';
    let metadata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    // Create a new BlockDoc document
    const doc = new BlockDocDocument({
      title,
      metadata
    });

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

    // Split the markdown into blocks
    const blocks = splitMarkdownIntoBlocks(markdownText);

    // Convert each block to a BlockDoc block and add to document
    for (const block of blocks) {
      const blockDocBlock = convertBlockToBlockDoc(block);
      if (blockDocBlock) {
        doc.addBlock(blockDocBlock);
      }
    }
    return doc;
  }

  /**
   * Split a markdown document into discrete blocks for conversion
   * 
   * @param {string} markdownText - Markdown content to split
   * @returns {Array<Object>} - List of block data with type and content
   */
  function splitMarkdownIntoBlocks(markdownText) {
    if (!markdownText.trim()) {
      return [];
    }

    // Parse markdown into tokens using marked
    const tokens = marked.marked.lexer(markdownText);
    const blocks = [];
    let currentListItems = [];
    let currentListType = '';
    let inQuoteBlock = false;
    let quoteLines = [];
    let quoteAttribution = null;

    // Process each token from the lexer
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Process tokens based on their type
      switch (token.type) {
        case 'heading':
          blocks.push({
            type: 'heading',
            content: token.text,
            level: token.depth
          });
          break;
        case 'paragraph':
          // Check if this is an image paragraph
          const imageMatch = token.text.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\s*(.*))?$/);
          if (imageMatch) {
            const altText = imageMatch[1] || '';
            const url = imageMatch[2];
            const caption = imageMatch[3] || null;
            blocks.push({
              type: 'image',
              content: '',
              url,
              alt: altText,
              ...(caption ? {
                caption
              } : {})
            });
          }
          // Check if this is a quote attribution
          else if (inQuoteBlock && token.text.match(/^[\u2014-]\s+(.+)$/)) {
            const attributionMatch = token.text.match(/^[\u2014-]\s+(.+)$/);
            quoteAttribution = attributionMatch[1];
          }
          // Regular paragraph
          else {
            blocks.push({
              type: 'text',
              content: token.text
            });
          }
          break;
        case 'blockquote':
          inQuoteBlock = true;

          // Process the children of the blockquote
          if (token.tokens) {
            for (const childToken of token.tokens) {
              if (childToken.type === 'paragraph') {
                // Check for attribution line in blockquote
                const attributionMatch = childToken.text.match(/^[\u2014-]\s+(.+)$/);
                if (attributionMatch) {
                  quoteAttribution = attributionMatch[1];
                } else {
                  quoteLines.push(childToken.text);
                }
              } else {
                // Handle other types inside blockquote
                quoteLines.push(childToken.raw);
              }
            }
          }

          // Create the quote block
          blocks.push({
            type: 'quote',
            content: quoteLines.join('\n').trim(),
            ...(quoteAttribution ? {
              attribution: quoteAttribution
            } : {})
          });

          // Reset quote state
          inQuoteBlock = false;
          quoteLines = [];
          quoteAttribution = null;
          break;
        case 'list':
          currentListType = token.ordered ? 'ordered' : 'unordered';
          currentListItems = [];

          // Extract list items
          for (const item of token.items) {
            currentListItems.push(item.text);
          }

          // Create the list block
          blocks.push({
            type: 'list',
            content: '',
            items: currentListItems,
            listType: currentListType
          });

          // Reset list state
          currentListItems = [];
          currentListType = '';
          break;
        case 'code':
          blocks.push({
            type: 'code',
            content: token.text,
            language: token.lang || 'plain'
          });
          break;
        case 'hr':
          blocks.push({
            type: 'divider',
            content: ''
          });
          break;
        case 'space':
          // Skip space tokens
          break;
        default:
          // Handle any other token types
          if (token.text && token.text.trim()) {
            blocks.push({
              type: 'text',
              content: token.text
            });
          }
          break;
      }
    }
    return blocks;
  }

  /**
   * Convert a markdown block to a BlockDoc block
   * 
   * @param {Object} block - Block data containing type and content
   * @returns {Object|null} A Block instance or null if conversion fails
   */
  function convertBlockToBlockDoc(block) {
    const blockType = block.type;

    // Generate a semantic ID based on content
    const blockId = generateBlockId(block);
    try {
      switch (blockType) {
        case 'text':
          const textContent = block.content.trim();
          if (!textContent) {
            return null;
          }
          return Block.text(blockId, textContent);
        case 'heading':
          const level = block.level || 2;
          const headingContent = block.content.trim();
          return Block.heading(blockId, level, headingContent);
        case 'code':
          const language = block.language || 'plain';
          const codeContent = block.content.trim();
          return Block.code(blockId, language, codeContent);
        case 'image':
          const url = block.url || '';
          const alt = block.alt || '';
          const caption = block.caption;
          return Block.image(blockId, url, alt, caption);
        case 'list':
          const items = block.items || [];
          const listType = block.listType || 'unordered';
          return Block.list(blockId, items, listType);
        case 'quote':
          const quoteContent = block.content.trim();
          const attribution = block.attribution;
          return {
            id: blockId,
            type: 'quote',
            content: quoteContent,
            ...(attribution ? {
              attribution
            } : {})
          };
        case 'divider':
          return {
            id: blockId,
            type: 'divider',
            content: ''
          };
        default:
          // Unknown block type, convert to text if it has content
          const content = block.content ? block.content.trim() : '';
          return content ? Block.text(blockId, content) : null;
      }
    } catch (error) {
      // If anything goes wrong, return null
      console.error(`Error converting block to BlockDoc: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate a semantic ID for a block based on its content
   * 
   * @param {Object} block - Block data
   * @returns {string} A semantic ID for the block
   */
  function generateBlockId(block) {
    const blockType = block.type;
    const content = block.content ? block.content.trim() : '';

    // For headings, create an ID from the content
    if (blockType === 'heading' && content) {
      // Convert to lowercase, replace spaces with hyphens, remove non-alphanumeric chars
      const slug = content.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s-]+/g, '-').replace(/^-+|-+$/g, '');
      return slug.substring(0, 40); // Limit length of ID
    }

    // For other block types, use the type as a prefix
    if (blockType) {
      let prefix = blockType;

      // For specific block types, enhance the ID
      if (blockType === 'code' && block.language) {
        prefix = `code-${block.language}`;
      } else if (blockType === 'list') {
        prefix = `${block.listType || 'unordered'}-list`;
      }

      // Add a short random suffix to ensure uniqueness
      const suffix = v4().substring(0, 8);
      return `${prefix}-${suffix}`;
    }

    // Fallback to a generic ID
    return `block-${v4().substring(0, 8)}`;
  }

  /**
   * BlockDoc
   * 
   * Main entry point for the BlockDoc library
   */


  // Version
  const version = '1.1.0';

  exports.Block = Block;
  exports.BlockDocDocument = BlockDocDocument;
  exports.markdownToBlockDoc = markdownToBlockDoc;
  exports.renderToHTML = renderToHTML;
  exports.renderToMarkdown = renderToMarkdown;
  exports.schema = schema;
  exports.version = version;

}));
//# sourceMappingURL=blockdoc.js.map
