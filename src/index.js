/**
 * BlockDoc
 * 
 * Main entry point for the BlockDoc library
 */

// Core classes
export { Block } from './core/block.js';
export { BlockDocDocument } from './core/document.js';

// Renderers
export { renderToHTML } from './renderers/html.js';
export { renderToMarkdown } from './renderers/markdown.js';

// Conversions
export { markdownToBlockDoc } from './conversions/markdown.js';

// Schema
import { schema } from './schema-loader.js';
export { schema };

// Version
export const version = '1.1.0';