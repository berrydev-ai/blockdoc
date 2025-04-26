/**
 * Markdown to BlockDoc Converter
 *
 * Utilities for converting Markdown documents to BlockDoc format
 */

import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';
import { Block } from '../core/block.js';
import { BlockDocDocument } from '../core/document.js';

/**
 * Convert a Markdown document to BlockDoc format
 * 
 * @param {string} markdownText - The markdown content to convert
 * @param {string} [title='Untitled Document'] - Document title
 * @param {Object} [metadata={}] - Optional document metadata
 * @returns {BlockDocDocument} A BlockDoc document generated from the markdown
 */
export function markdownToBlockDoc(markdownText, title = 'Untitled Document', metadata = {}) {
  // Create a new BlockDoc document
  const doc = new BlockDocDocument({ title, metadata });

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
  const tokens = marked.lexer(markdownText);
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
            ...(caption ? { caption } : {})
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
          ...(quoteAttribution ? { attribution: quoteAttribution } : {})
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
          ...(attribution ? { attribution } : {})
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
    const slug = content.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
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
    const suffix = uuidv4().substring(0, 8);
    return `${prefix}-${suffix}`;
  }

  // Fallback to a generic ID
  return `block-${uuidv4().substring(0, 8)}`;
}