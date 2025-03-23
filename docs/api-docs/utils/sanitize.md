# HTML Sanitization Utilities

The sanitization utilities provide functions for safely handling HTML content and URLs to prevent security vulnerabilities like XSS attacks.

## Import

```javascript
import { sanitizeHtml, sanitizeUrl } from 'blockdoc/utils/sanitize';
```

## Functions

### sanitizeHtml(html)

Simple HTML sanitizer to prevent XSS by escaping HTML special characters.

#### Parameters

- `html` (string): HTML content to sanitize

#### Returns

- (string): Sanitized HTML with special characters escaped

#### Example

```javascript
import { sanitizeHtml } from 'blockdoc/utils/sanitize';

const userInput = '<script>alert("XSS");</script>';
const safe = sanitizeHtml(userInput);
// Results in: '&lt;script&gt;alert(&quot;XSS&quot;);&lt;/script&gt;'
```

### sanitizeUrl(url)

Sanitize a URL to ensure it uses safe protocols.

#### Parameters

- `url` (string): URL to sanitize

#### Returns

- (string): Sanitized URL or empty string if unsafe

#### Example

```javascript
import { sanitizeUrl } from 'blockdoc/utils/sanitize';

// Safe URL - returns the URL unchanged
sanitizeUrl('https://example.com/image.jpg');

// Protocol-relative URL - adds https:
sanitizeUrl('//example.com/image.jpg');
// Results in: 'https://example.com/image.jpg'

// Unsafe URL - returns empty string
sanitizeUrl('javascript:alert("XSS");');
// Results in: ''
```

## Security Considerations

### XSS Prevention

The `sanitizeHtml` function prevents Cross-Site Scripting (XSS) attacks by escaping the following characters:

- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#039;`

This ensures that any HTML or JavaScript in user-provided content is rendered as text rather than being executed.

### URL Sanitization

The `sanitizeUrl` function prevents JavaScript injection through URLs by:

1. Only allowing HTTP and HTTPS protocols
2. Converting protocol-relative URLs (`//example.com`) to HTTPS
3. Allowing relative URLs that don't include a protocol
4. Returning an empty string for potentially unsafe protocols

## Usage in BlockDoc

These utilities are used internally by the HTML renderer to ensure that content is safely rendered. You can also use them directly when working with user-provided content that will be displayed in HTML contexts.