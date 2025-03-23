'use strict';

/**
 * BlockDoc API Server
 *
 * Express middleware for creating a BlockDoc API server
 * Note: This is a minimal implementation meant for simple use cases.
 * For production, use a proper database and more robust error handling.
 */

function createBlockDocApi(options = {}) {
  // This function returns Express middleware that handles BlockDoc API endpoints
  return function blockDocApiMiddleware(req, res, next) {
    // Skip non-matching routes
    if (!req.path.startsWith('/api/blockdoc/')) {
      return next();
    }
    const path = req.path.replace('/api/blockdoc/', '');
    const pathParts = path.split('/').filter(Boolean);

    // Route handling
    try {
      if (pathParts[0] === 'documents') {
        if (req.method === 'GET' && pathParts.length === 1) {
          // GET /api/blockdoc/documents - List documents
          return handleListDocuments(req, res, options);
        } else if (req.method === 'POST' && pathParts.length === 1) {
          // POST /api/blockdoc/documents - Create document
          return handleCreateDocument(req, res, options);
        } else if (req.method === 'GET' && pathParts.length === 2) {
          // GET /api/blockdoc/documents/:id - Get document
          return handleGetDocument(req, res, pathParts[1], options);
        } else if (req.method === 'PUT' && pathParts.length === 2) {
          // PUT /api/blockdoc/documents/:id - Update document
          return handleUpdateDocument(req, res, pathParts[1], options);
        } else if (req.method === 'DELETE' && pathParts.length === 2) {
          // DELETE /api/blockdoc/documents/:id - Delete document
          return handleDeleteDocument(req, res, pathParts[1], options);
        } else if (req.method === 'PATCH' && pathParts.length === 4 && pathParts[2] === 'blocks') {
          // PATCH /api/blockdoc/documents/:id/blocks/:blockId - Update block
          return handleUpdateBlock(req, res, pathParts[1], pathParts[3], options);
        }
      }

      // Render routes
      if (pathParts[0] === 'render') {
        if (req.method === 'POST' && pathParts.length === 2) {
          if (pathParts[1] === 'html') {
            // POST /api/blockdoc/render/html - Render to HTML
            return handleRenderToHTML(req, res);
          } else if (pathParts[1] === 'markdown') {
            // POST /api/blockdoc/render/markdown - Render to Markdown
            return handleRenderToMarkdown(req, res);
          }
        }
      }

      // No matching route
      res.status(404).json({
        error: 'Not found'
      });
    } catch (error) {
      console.error('BlockDoc API Error:', error);
      res.status(500).json({
        error: error.message || 'Internal server error'
      });
    }
  };
}

// Route handlers
// Note: These functions would typically interact with a database

function handleListDocuments(req, res, options) {
  const {
    storage = {}
  } = options;
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  // In a real implementation, this would query a database
  const documents = Object.values(storage).slice(offset, offset + limit).map(doc => ({
    id: doc.id,
    title: doc.article.title,
    updatedAt: doc.updatedAt
  }));
  res.json({
    documents,
    total: Object.keys(storage).length,
    limit,
    offset
  });
}
function handleCreateDocument(req, res, options) {
  const {
    storage = {},
    onDocumentCreated
  } = options;
  const document = req.body;

  // Validate document
  if (!document || !document.article || !document.article.title) {
    return res.status(400).json({
      error: 'Invalid document format'
    });
  }

  // Generate ID if not provided
  const id = document.id || generateId();

  // Store document
  const storedDocument = {
    ...document,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  storage[id] = storedDocument;

  // Trigger event handler if provided
  if (typeof onDocumentCreated === 'function') {
    onDocumentCreated(storedDocument);
  }
  res.status(201).json({
    id,
    message: 'Document created'
  });
}
function handleGetDocument(req, res, documentId, options) {
  const {
    storage = {}
  } = options;
  if (!storage[documentId]) {
    return res.status(404).json({
      error: 'Document not found'
    });
  }
  res.json(storage[documentId]);
}
function handleUpdateDocument(req, res, documentId, options) {
  const {
    storage = {},
    onDocumentUpdated
  } = options;
  if (!storage[documentId]) {
    return res.status(404).json({
      error: 'Document not found'
    });
  }
  const document = req.body;

  // Validate document
  if (!document || !document.article || !document.article.title) {
    return res.status(400).json({
      error: 'Invalid document format'
    });
  }

  // Update document
  const updatedDocument = {
    ...document,
    id: documentId,
    createdAt: storage[documentId].createdAt,
    updatedAt: new Date().toISOString()
  };
  storage[documentId] = updatedDocument;

  // Trigger event handler if provided
  if (typeof onDocumentUpdated === 'function') {
    onDocumentUpdated(updatedDocument);
  }
  res.json({
    message: 'Document updated'
  });
}
function handleDeleteDocument(req, res, documentId, options) {
  const {
    storage = {},
    onDocumentDeleted
  } = options;
  if (!storage[documentId]) {
    return res.status(404).json({
      error: 'Document not found'
    });
  }
  const deletedDocument = storage[documentId];
  delete storage[documentId];

  // Trigger event handler if provided
  if (typeof onDocumentDeleted === 'function') {
    onDocumentDeleted(deletedDocument);
  }
  res.status(204).end();
}
function handleUpdateBlock(req, res, documentId, blockId, options) {
  const {
    storage = {},
    onBlockUpdated
  } = options;
  if (!storage[documentId]) {
    return res.status(404).json({
      error: 'Document not found'
    });
  }
  const document = storage[documentId];
  const blockIndex = document.article.blocks.findIndex(block => block.id === blockId);
  if (blockIndex === -1) {
    return res.status(404).json({
      error: 'Block not found'
    });
  }

  // Update block
  const updates = req.body;
  const block = document.article.blocks[blockIndex];

  // Cannot change id or type
  const {
    id,
    type,
    ...allowedUpdates
  } = updates;

  // Apply updates
  const updatedBlock = {
    ...block,
    ...allowedUpdates
  };
  document.article.blocks[blockIndex] = updatedBlock;
  document.updatedAt = new Date().toISOString();

  // Trigger event handler if provided
  if (typeof onBlockUpdated === 'function') {
    onBlockUpdated(document, updatedBlock);
  }
  res.json(updatedBlock);
}

// Render handlers
function handleRenderToHTML(req, res) {
  const {
    renderToHTML
  } = require('../renderers/html.js');
  const document = req.body;
  if (!document || !document.article) {
    return res.status(400).json({
      error: 'Invalid document format'
    });
  }
  try {
    const html = renderToHTML(document.article);
    res.send(html);
  } catch (error) {
    res.status(400).json({
      error: `Rendering failed: ${error.message}`
    });
  }
}
function handleRenderToMarkdown(req, res) {
  const {
    renderToMarkdown
  } = require('../renderers/markdown.js');
  const document = req.body;
  if (!document || !document.article) {
    return res.status(400).json({
      error: 'Invalid document format'
    });
  }
  try {
    const markdown = renderToMarkdown(document.article);
    res.send(markdown);
  } catch (error) {
    res.status(400).json({
      error: `Rendering failed: ${error.message}`
    });
  }
}

// Helper function to generate a simple ID
function generateId() {
  return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

exports.createBlockDocApi = createBlockDocApi;
//# sourceMappingURL=server.js.map
