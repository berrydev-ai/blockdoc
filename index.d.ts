// Type definitions for blockdoc
// TypeScript Version: 4.5

export interface BlockData {
  id: string;
  type: string;
  content?: string;
  [key: string]: any;
}

export class Block {
  id: string;
  type: string;
  content: string;
  [key: string]: any;

  constructor(data: BlockData);
  update(updates: Partial<BlockData>): Block;
  toJSON(): BlockData;

  static text(id: string, content: string): Block;
  static heading(id: string, level: number, content: string): Block;
  static image(id: string, url: string, alt: string, caption?: string): Block;
  static code(id: string, language: string, content: string): Block;
  static list(id: string, items: string[], listType?: 'ordered' | 'unordered'): Block;
}

export interface BlockDocOptions {
  title: string;
  metadata?: Record<string, any>;
  blocks?: BlockData[];
}

export interface Article {
  title: string;
  metadata: Record<string, any>;
  blocks: BlockData[];
}

export class BlockDocDocument {
  article: Article;

  constructor(options: BlockDocOptions);
  validate(): boolean;
  addBlock(blockData: BlockData | Block): Block;
  insertBlock(blockData: BlockData | Block, position: number): Block;
  getBlock(id: string): BlockData | null;
  updateBlock(id: string, updates: Partial<BlockData>): BlockData;
  removeBlock(id: string): boolean;
  moveBlock(id: string, newPosition: number): boolean;
  renderToHTML(): string;
  renderToMarkdown(): string;
  toJSON(): { article: Article };
  toString(): string;

  static fromJSON(json: string | { article: Article }): BlockDocDocument;
}

export function renderToHTML(article: Article): string;
export function renderToMarkdown(article: Article): string;

export const schema: any;
export const version: string;

// Submodule exports
declare module 'blockdoc/renderers/html' {
  export function renderToHTML(article: Article): string;
}

declare module 'blockdoc/renderers/markdown' {
  export function renderToMarkdown(article: Article): string;
}

declare module 'blockdoc/utils/sanitize' {
  export function sanitizeHtml(html: string): string;
  export function sanitizeUrl(url: string): string;
}