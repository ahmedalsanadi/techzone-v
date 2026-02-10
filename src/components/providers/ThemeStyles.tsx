/**
 * Server component that injects theme CSS variables into the HTML head.
 * This ensures theme colors are available before first paint, eliminating FOUC.
 *
 * ⚠️ SERVER COMPONENT - No client-side code
 * 
 * Edge/CDN Compatibility:
 * - Uses pure, synchronous functions (no async/await)
 * - No Node.js-specific APIs
 * - Works on Edge Runtime, Vercel Edge, Cloudflare Workers
 * - Theme generation is stateless and cacheable
 */
import { StoreConfig } from '@/types/store';
import {
    generateThemeVariables,
    isValidColorStrict,
} from '@/lib/theme-utils';

interface ThemeStylesProps {
    config: StoreConfig | null;
}

export function ThemeStyles({ config }: ThemeStylesProps) {
    if (!config?.theme) {
        return null;
    }

    const { primary_color: primary, secondary_color: secondary } = config.theme;

    // Strict validation on server (security best practice)
    // Only process if colors are valid 6-digit hex
    if (primary && !isValidColorStrict(primary)) {
        console.warn(
            `[ThemeStyles] Invalid primary color format (expected #RRGGBB): ${primary}`,
        );
        return null;
    }

    if (secondary && !isValidColorStrict(secondary)) {
        console.warn(
            `[ThemeStyles] Invalid secondary color format (expected #RRGGBB): ${secondary}`,
        );
        // Secondary is optional, so we continue with primary only
    }

    const variables = generateThemeVariables(primary, secondary);

    // Generate CSS string with all theme variables
    const css = `:root { ${Object.entries(variables)
        .map(([key, value]) => `--${key}: ${value};`)
        .join(' ')} }`;

    return (
        <style
            dangerouslySetInnerHTML={{ __html: css }}
            data-theme-styles="true"
        />
    );
}
