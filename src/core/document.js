/**
 * BlockDoc Document
 *
 * Core class for creating, manipulating and rendering BlockDoc documents
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { schema } from '../schema-loader.js';
import { renderToHTML } from '../renderers/html.js';
import { renderToMarkdown } from '../renderers/markdown.js';
import { Block } from './block.js';

export class BlockDocDocument {
  /**
   * Create a new BlockDoc document
   * @param {Object} options - Document initialization options
   * @param {string} options.title - Document title
   * @param {Object} [options.metadata] - Optional document metadata
   * @param {Array<Object>} [options.blocks] - Initial blocks to add
   */
  constructor({ title, metadata = {}, blocks = [] }) {
    this.article = {
      title,
      metadata,
      blocks: [],
    };

    // Add initial blocks if provided
    if (blocks && Array.isArray(blocks)) {
      blocks.forEach((block) => this.addBlock(block));
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
    const valid = validate({ article: this.article });

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
    return this.article.blocks.find((block) => block.id === id) || null;
  }

  /**
   * Update a block by ID
   * @param {string} id - Block ID
   * @param {Object} updates - Properties to update
   * @returns {Object} The updated block
   */
  updateBlock(id, updates) {
    const index = this.article.blocks.findIndex((block) => block.id === id);

    if (index === -1) {
      throw new Error(`Block with ID "${id}" not found`);
    }

    // Create a new block with the updates
    const currentBlock = this.article.blocks[index];
    const updatedBlock = { ...currentBlock, ...updates };

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
    const index = this.article.blocks.findIndex((block) => block.id === id);

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
    const index = this.article.blocks.findIndex((block) => block.id === id);

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
    return { article: this.article };
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
      blocks: data.article.blocks || [],
    });
  }
}
