/**
 * BlockDoc React Renderer Component
 *
 * This is a simple React component for rendering BlockDoc documents
 * Note: This is just a basic example and doesn't include styles
 */

import React from 'react';
import { marked } from 'marked';

/**
 * Render a BlockDoc document as React components
 * @param {Object} props - Component props
 * @param {Object} props.document - BlockDoc document object
 * @returns {React.Component} Rendered document
 */
export function BlockDocRenderer({ document }) {
  if (!document || !document.article) {
    return <div className="blockdoc-error">Invalid document</div>;
  }

  const { title, metadata, blocks } = document.article;

  return (
    <article className="blockdoc-article">
      <header className="blockdoc-header">
        <h1 className="blockdoc-title">{title}</h1>
        {metadata && <DocumentMeta metadata={metadata} />}
      </header>

      <div className="blockdoc-content">
        {blocks.map(block => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </article>
  );
}

/**
 * Render document metadata
 */
function DocumentMeta({ metadata }) {
  return (
    <div className="blockdoc-metadata">
      {metadata.author && (
        <div className="blockdoc-author">By {metadata.author}</div>
      )}
      
      {metadata.publishedDate && (
        <div className="blockdoc-date">
          {new Date(metadata.publishedDate).toLocaleDateString()}
        </div>
      )}
      
      {metadata.tags && metadata.tags.length > 0 && (
        <div className="blockdoc-tags">
          {metadata.tags.map(tag => (
            <span key={tag} className="blockdoc-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Render a single block based on its type
 */
function BlockRenderer({ block }) {
  const { id, type } = block;
  
  // Wrapper with data attributes
  const blockClass = `blockdoc-block blockdoc-${type}`;
  const blockProps = {
    className: blockClass,
    'data-block-id': id,
    'data-block-type': type,
  };
  
  // Render based on block type
  switch (type) {
    case 'text':
      return <TextBlock block={block} blockProps={blockProps} />;
    case 'heading':
      return <HeadingBlock block={block} blockProps={blockProps} />;
    case 'image':
      return <ImageBlock block={block} blockProps={blockProps} />;
    case 'code':
      return <CodeBlock block={block} blockProps={blockProps} />;
    case 'list':
      return <ListBlock block={block} blockProps={blockProps} />;
    case 'quote':
      return <QuoteBlock block={block} blockProps={blockProps} />;
    case 'embed':
      return <EmbedBlock block={block} blockProps={blockProps} />;
    case 'divider':
      return <div {...blockProps}><hr className="blockdoc-divider" /></div>;
    default:
      return (
        <div {...blockProps}>
          <p>Unknown block type: {type}</p>
        </div>
      );
  }
}

/**
 * Render a text block (with markdown)
 */
function TextBlock({ block, blockProps }) {
  return (
    <div {...blockProps}>
      <div 
        className="blockdoc-text-content"
        dangerouslySetInnerHTML={{ __html: marked.parse(block.content) }} 
      />
    </div>
  );
}

/**
 * Render a heading block
 */
function HeadingBlock({ block, blockProps }) {
  const { level, content } = block;
  const validLevel = Math.min(Math.max(parseInt(level) || 2, 1), 6);
  
  const HeadingTag = `h${validLevel}`;
  
  return (
    <div {...blockProps}>
      <HeadingTag className="blockdoc-heading">{content}</HeadingTag>
    </div>
  );
}

/**
 * Render an image block
 */
function ImageBlock({ block, blockProps }) {
  const { url, alt, caption } = block;
  
  if (caption) {
    return (
      <figure {...blockProps} className={`${blockProps.className} blockdoc-figure`}>
        <img src={url} alt={alt} className="blockdoc-image" />
        <figcaption className="blockdoc-caption">{caption}</figcaption>
      </figure>
    );
  }
  
  return (
    <div {...blockProps}>
      <img src={url} alt={alt} className="blockdoc-image" />
    </div>
  );
}

/**
 * Render a code block
 */
function CodeBlock({ block, blockProps }) {
  const { language, content } = block;
  
  return (
    <div {...blockProps}>
      <pre className="blockdoc-pre">
        <code className={`blockdoc-code ${language ? `language-${language}` : ''}`}>
          {content}
        </code>
      </pre>
    </div>
  );
}

/**
 * Render a list block
 */
function ListBlock({ block, blockProps }) {
  const { items, listType } = block;
  
  if (!items || !Array.isArray(items)) {
    return (
      <div {...blockProps}>
        <p>Invalid list items</p>
      </div>
    );
  }
  
  const ListTag = listType === 'ordered' ? 'ol' : 'ul';
  const listClass = `blockdoc-list blockdoc-list-${listType}`;
  
  return (
    <div {...blockProps}>
      <ListTag className={listClass}>
        {items.map((item, index) => (
          <li 
            key={index} 
            dangerouslySetInnerHTML={{ __html: marked.parse(item) }} 
          />
        ))}
      </ListTag>
    </div>
  );
}

/**
 * Render a quote block
 */
function QuoteBlock({ block, blockProps }) {
  const { content, attribution } = block;
  
  return (
    <div {...blockProps}>
      <blockquote 
        className="blockdoc-quote"
        dangerouslySetInnerHTML={{ __html: marked.parse(content) }} 
      />
      {attribution && (
        <cite className="blockdoc-attribution">{attribution}</cite>
      )}
    </div>
  );
}

/**
 * Render an embed block
 */
function EmbedBlock({ block, blockProps }) {
  const { url, caption, embedType } = block;
  
  let embedContent;
  
  if (embedType === 'youtube') {
    const videoId = extractYouTubeId(url);
    
    if (videoId) {
      embedContent = (
        <div className="blockdoc-embed-container">
          <iframe 
            width="560" 
            height="315" 
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            title={caption || 'YouTube video'}
          />
        </div>
      );
    } else {
      embedContent = <p>Invalid YouTube URL</p>;
    }
  } else {
    // Generic embed
    embedContent = (
      <div className="blockdoc-embed">
        <iframe 
          src={url} 
          frameBorder="0" 
          width="100%" 
          height="400"
          allowFullScreen
          title={caption || 'Embedded content'}
        />
      </div>
    );
  }
  
  if (caption) {
    return (
      <figure {...blockProps} className={`${blockProps.className} blockdoc-figure`}>
        {embedContent}
        <figcaption className="blockdoc-caption">{caption}</figcaption>
      </figure>
    );
  }
  
  return <div {...blockProps}>{embedContent}</div>;
}

/**
 * Extract YouTube video ID from URL
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