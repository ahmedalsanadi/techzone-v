//src/lib/sanitize.ts
import sanitize from 'sanitize-html';

/**
 * Senior-level HTML Sanitization Utility
 *
 * Performance: Uses 'sanitize-html', which is significantly faster and
 * more memory-efficient than JSDOM/DOMPurify in Serverless environments.
 *
 * Safety: Implements a strict whitelist-based approach to prevent XSS.
 */
export const sanitizeHTML = (html: string) => {
    if (!html) return '';

    try {
        return sanitize(html, {
            // White-list of allowed HTML tags
            allowedTags: [
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'p',
                'br',
                'strong',
                'b',
                'em',
                'i',
                'ul',
                'ol',
                'li',
                'a',
                'img',
                'span',
                'div',
                'blockquote',
                'hr',
            ],
            // White-list of allowed attributes per tag
            allowedAttributes: {
                a: ['href', 'target', 'rel', 'title'],
                img: ['src', 'alt', 'width', 'height', 'class', 'style'],
                '*': ['class', 'style', 'id'], // Allow basic styling on any tag
            },
            // Secure link handling
            allowedSchemes: ['http', 'https', 'mailto', 'tel'],
            transformTags: {
                a: sanitize.simpleTransform('a', {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                }),
            },
            // Security: Prevent potential bypasses using uncommon protocols
            allowProtocolRelative: false,
            enforceHtmlBoundary: true,
        });
    } catch (error) {
        console.error('[Sanitize] Critical failure:', error);
        // Senior Safety Fallback: Return empty string on failure rather than raw HTML
        // to prevent any accidental XSS if the sanitizer crashes.
        return '';
    }
};
