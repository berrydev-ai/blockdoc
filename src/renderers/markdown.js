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
export function renderToMarkdown(article) {
  if (!article || !article.blocks || !Array.isArray(article.blocks)) {
    throw new Error("Invalid article structure");
  }

  const markdown = [
    `# ${article.title}`,
    ''
  ];

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
  article.blocks.forEach((block) => {
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
  const { type } = block;

  switch (type) {
    case "text":
      return renderTextBlockToMarkdown(block);
    case "heading":
      return renderHeadingBlockToMarkdown(block);
    case "image":
      return renderImageBlockToMarkdown(block);
    case "code":
      return renderCodeBlockToMarkdown(block);
    case "list":
      return renderListBlockToMarkdown(block);
    case "quote":
      return renderQuoteBlockToMarkdown(block);
    case "embed":
      return renderEmbedBlockToMarkdown(block);
    case "divider":
      return "---";
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
  const { level, content } = block;
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
  const { url, alt, caption } = block;
  
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
  const { language, content } = block;
  
  return "```" + (language || '') + "\n" + content + "\n```";
}

/**
 * Render a list block to Markdown
 * @param {Object} block - Block data
 * @returns {string} Markdown representation
 */
function renderListBlockToMarkdown(block) {
  const { items, listType } = block;
  
  if (!items || !Array.isArray(items)) {
    return "[Invalid list items]";
  }
  
  return items.map((item, index) => {
    if (listType === "ordered") {
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
  const { content, attribution } = block;
  
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
  const { url, caption, embedType } = block;
  
  let markdown = `[${embedType || 'Embedded content'}: ${url}](${url})`;
  
  if (caption) {
    markdown += `\n*${caption}*`;
  }
  
  return markdown;
}