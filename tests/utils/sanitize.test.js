/**
 * Tests for HTML sanitization utilities
 */
import { sanitizeHtml, sanitizeUrl } from '../../src/utils/sanitize.js';

describe('HTML Sanitization', () => {
  describe('sanitizeHtml', () => {
    test('should escape HTML special characters', () => {
      const input = '<script>alert("XSS");</script>';
      const expected = '&lt;script&gt;alert(&quot;XSS&quot;);&lt;/script&gt;';
      expect(sanitizeHtml(input)).toBe(expected);
    });

    test('should handle empty input', () => {
      expect(sanitizeHtml('')).toBe('');
      expect(sanitizeHtml(null)).toBe('');
      expect(sanitizeHtml(undefined)).toBe('');
    });

    test('should preserve normal text', () => {
      const input = 'Hello world!';
      expect(sanitizeHtml(input)).toBe(input);
    });

    test('should convert non-string input to string', () => {
      expect(sanitizeHtml(123)).toBe('123');
      expect(sanitizeHtml(true)).toBe('true');
    });

    test('should escape all special characters', () => {
      const input = '<div class="test" data-attr=\'value\'>Hello & goodbye</div>';
      const expected = '&lt;div class=&quot;test&quot; data-attr=&#039;value&#039;&gt;Hello &amp; goodbye&lt;/div&gt;';
      expect(sanitizeHtml(input)).toBe(expected);
    });
  });

  describe('sanitizeUrl', () => {
    test('should allow http URLs', () => {
      const url = 'http://example.com';
      expect(sanitizeUrl(url)).toBe(url);
    });

    test('should allow https URLs', () => {
      const url = 'https://example.com';
      expect(sanitizeUrl(url)).toBe(url);
    });

    test('should convert protocol-relative URLs to https', () => {
      const url = '//example.com/page';
      expect(sanitizeUrl(url)).toBe('https://example.com/page');
    });

    test('should allow relative URLs', () => {
      const url = '/path/to/resource';
      expect(sanitizeUrl(url)).toBe(url);
    });

    test('should reject javascript URLs', () => {
      const url = 'javascript:alert("XSS")';
      expect(sanitizeUrl(url)).toBe('');
    });

    test('should reject data URLs', () => {
      const url = 'data:text/html,<script>alert("XSS")</script>';
      expect(sanitizeUrl(url)).toBe('');
    });

    test('should handle empty input', () => {
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeUrl(null)).toBe('');
      expect(sanitizeUrl(undefined)).toBe('');
    });
  });
});