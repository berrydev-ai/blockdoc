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
export function sanitizeHtml(html) {
  if (!html) return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return String(html).replace(/[&<>"']/g, function(m) { return map[m]; });
}

/**
 * Sanitize a URL for safe embedding
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
export function sanitizeUrl(url) {
  if (!url) return '';
  
  // Only allow http and https protocols
  if (url.match(/^https?:\/\//i)) {
    return url;
  } else if (url.startsWith('//')) {
    return `https:${url}`;
  } else if (!url.includes(':')) {
    // Relative URLs are considered safe
    return url;
  }
  
  // Default to empty for potentially unsafe protocols
  return '';
}