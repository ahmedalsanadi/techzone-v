//src/lib/sanitize.ts
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

/**
 * Server-side HTML Sanitization Utility
 * Specifically designed for Next.js Server Components
 */
export const sanitizeHTML = (html: string) => {
    // On the server, we need to provide a DOM implementation (jsdom)
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);

    return purify.sanitize(html, {
        ALLOWED_TAGS: [
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
        ALLOWED_ATTR: [
            'href',
            'target',
            'rel',
            'src',
            'alt',
            'class',
            'id',
            'style',
            'title',
        ],
        // Allow rel="nofollow" etc for external links
        ADD_ATTR: ['rel', 'target'],
        FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object'],
        FORBID_ATTR: ['onerror', 'onclick', 'onload'],
    });
};
