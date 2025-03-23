'use strict';

var Ajv = require('ajv');
var addFormats = require('ajv-formats');
var fs = require('fs');
var path = require('path');
var url = require('url');
var marked = require('marked');
var hljs = require('highlight.js');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
/**
 * BlockDoc Schema Loader
 * 
 * Loads the JSON schema without requiring import assertions
 */


// Get current directory
const __dirname$1 = path.dirname(url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('client.js', document.baseURI).href))));

// Load schema
const schemaPath = path.join(__dirname$1, 'schema/blockdoc.schema.json');
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
  static list(id, items, listType = 'unordered') {
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
  constructor({
    title,
    metadata = {},
    blocks = []
  }) {
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

/**
 * BlockDoc API Client
 *
 * Client for interacting with a BlockDoc API server
 */

class BlockDocClient {
  /**
   * Create a new BlockDoc client
   * @param {string} baseUrl - API base URL
   * @param {Object} options - Client options
   * @param {Object} options.headers - Custom headers to include in requests
   */
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };
  }

  /**
   * Make an API request
   * @param {string} path - API path
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   * @private
   */
  async _request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      headers: this.headers,
      ...options
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${response.status} ${error}`);
    }

    // Return JSON response or null for 204 No Content
    return response.status === 204 ? null : await response.json();
  }

  /**
   * Get a document by ID
   * @param {string} documentId - Document ID
   * @returns {Promise<BlockDocDocument>} The document
   */
  async getDocument(documentId) {
    const data = await this._request(`documents/${documentId}`);
    return BlockDocDocument.fromJSON(data);
  }

  /**
   * Create a new document
   * @param {BlockDocDocument} document - The document to create
   * @returns {Promise<Object>} Creation result with ID
   */
  async createDocument(document) {
    return this._request('documents', {
      method: 'POST',
      body: JSON.stringify(document.toJSON())
    });
  }

  /**
   * Update an existing document
   * @param {string} documentId - Document ID
   * @param {BlockDocDocument} document - Updated document
   * @returns {Promise<Object>} Update result
   */
  async updateDocument(documentId, document) {
    return this._request(`documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify(document.toJSON())
    });
  }

  /**
   * Delete a document
   * @param {string} documentId - Document ID
   * @returns {Promise<void>}
   */
  async deleteDocument(documentId) {
    await this._request(`documents/${documentId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Update a specific block in a document
   * @param {string} documentId - Document ID
   * @param {string} blockId - Block ID
   * @param {Object} updates - Properties to update
   * @returns {Promise<Object>} Updated block
   */
  async updateBlock(documentId, blockId, updates) {
    return this._request(`documents/${documentId}/blocks/${blockId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Get a list of documents
   * @param {Object} query - Query parameters
   * @param {number} query.limit - Maximum number of documents to return
   * @param {number} query.offset - Offset for pagination
   * @returns {Promise<Array<Object>>} List of document summaries
   */
  async listDocuments(query = {}) {
    const queryParams = new URLSearchParams();
    if (query.limit) queryParams.append('limit', query.limit);
    if (query.offset) queryParams.append('offset', query.offset);
    const path = `documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this._request(path);
  }
}

exports.BlockDocClient = BlockDocClient;
//# sourceMappingURL=client.js.map
