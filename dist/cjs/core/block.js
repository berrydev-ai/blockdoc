'use strict';

/**
 * BlockDoc Block
 *
 * Represents a single content block within a BlockDoc document
 */

// Define allowed block types
const ALLOWED_TYPES = ["text", "heading", "image", "code", "list", "quote", "embed", "divider"];

// Define type-specific required properties
const TYPE_REQUIREMENTS = {
  heading: ["level"],
  code: ["language"],
  image: ["url", "alt"],
  list: ["items", "listType"]
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
      throw new Error("Block ID is required");
    }
    if (!data.type || !ALLOWED_TYPES.includes(data.type)) {
      throw new Error(`Invalid block type: ${data.type}. Allowed types are: ${ALLOWED_TYPES.join(", ")}`);
    }

    // Basic properties all blocks have
    this.id = data.id;
    this.type = data.type;
    this.content = data.content || "";

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
      if (!["id", "type", "content"].includes(key) && this[key] === undefined) {
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
      if (!["id", "type", "content"].includes(key)) {
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
      type: "text",
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
      type: "heading",
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
      type: "image",
      content: "",
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
      type: "code",
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
  static list(id, items, listType = "unordered") {
    return new Block({
      id,
      type: "list",
      content: "",
      items,
      listType
    });
  }
}

exports.Block = Block;
//# sourceMappingURL=block.js.map
