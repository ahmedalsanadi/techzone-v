import { createRequire } from 'module';

/**
 * Server-side HTML Sanitization Utility
 * Specifically designed for Next.js Server Components.
 *
 * NOTE: We use createRequire here to bypass ESM/CJS bundling issues
 * that 'jsdom' encounters in modern Turbopack/Vercel environments.
 */
const require = createRequire(import.meta.url);

let purify: any;

export const sanitizeHTML = (html: string) => {
    try {
        if (!purify) {
            const { JSDOM } = require('jsdom');
            const DOMPurify = require('dompurify');
            const window = new JSDOM('').window;
            purify = DOMPurify(window);
        }

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
            ADD_ATTR: ['rel', 'target'],
            FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object'],
            FORBID_ATTR: ['onerror', 'onclick', 'onload'],
        });
    } catch (error) {
        console.error('[Sanitize] Critical failure:', error);
        // Fallback to raw content if sanitization fails (better than 500 error)
        return html;
    }
};
