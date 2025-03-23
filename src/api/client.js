/**
 * BlockDoc API Client
 *
 * Client for interacting with a BlockDoc API server
 */

import { BlockDocDocument } from '../core/document.js';

export class BlockDocClient {
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