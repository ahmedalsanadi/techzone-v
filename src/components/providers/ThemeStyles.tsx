/**
 * Server component that injects theme CSS variables into the HTML head.
 * This ensures theme colors are available before first paint, eliminating FOUC.
 *
 * ⚠️ SERVER COMPONENT - No client-side code
 */
import { StoreConfig } from '@/services/types';
import { generateThemeVariables } from '@/lib/theme-utils';

interface ThemeStylesProps {
    config: StoreConfig | null;
}

export function ThemeStyles({ config }: ThemeStylesProps) {
    if (!config?.theme) {
        return null;
    }

    const { primary_color: primary, secondary_color: secondary } = config.theme;
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
