/**
 * Shared theme color utilities for server and client components.
 * Pure functions with no DOM dependencies.
 */

/**
 * Converts hex color to RGB values
 */
export function hexToRgb(
    hex: string,
): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

/**
 * Darkens a color by a percentage (0-1)
 */
export function darkenColor(hex: string, amount: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const r = Math.max(0, Math.floor(rgb.r * (1 - amount)));
    const g = Math.max(0, Math.floor(rgb.g * (1 - amount)));
    const b = Math.max(0, Math.floor(rgb.b * (1 - amount)));

    return `#${[r, g, b]
        .map((x) => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')}`;
}

/**
 * Creates an rgba color string with opacity
 */
export function colorWithOpacity(hex: string, opacity: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Blends white with a color at a given percentage
 * Used for creating tinted backgrounds (white + X% primary color)
 */
export function blendWithWhite(hex: string, percentage: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    // Blend: result = white * (1 - percentage) + color * percentage
    const r = Math.round(255 * (1 - percentage) + rgb.r * percentage);
    const g = Math.round(255 * (1 - percentage) + rgb.g * percentage);
    const b = Math.round(255 * (1 - percentage) + rgb.b * percentage);

    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Validates if a string is a valid color (hex or rgb)
 */
export function isValidColor(color: string): boolean {
    return (
        /^#([A-Fa-f0-9]{3}){1,2}$/.test(color) ||
        /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color)
    );
}

/**
 * Generates all theme CSS variables from primary and secondary colors.
 * Returns a record of CSS variable names (without --) to their values.
 */
export function generateThemeVariables(
    primary: string | undefined,
    secondary: string | undefined,
): Record<string, string> {
    const variables: Record<string, string> = {};

    // Set base theme colors
    if (primary && isValidColor(primary)) {
        variables['primary'] = primary;
        variables['theme-primary'] = primary;

        // Convert to RGB for Tailwind opacity modifier compatibility
        const rgb = hexToRgb(primary);
        if (rgb) {
            variables['theme-primary-rgb'] = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
        }

        // Hover state (darken by ~4% for conventional, subtle hover)
        const primaryHover = darkenColor(primary, 0.04);
        variables['primary-hover'] = primaryHover;
        variables['theme-primary-hover'] = primaryHover;

        // Light tints with opacity (for backward compatibility)
        variables['primary-light'] = colorWithOpacity(primary, 0.1);
        variables['primary-lighter'] = colorWithOpacity(primary, 0.05);
        variables['primary-border'] = colorWithOpacity(primary, 0.3);

        // Tinted background: white blended with 10% primary color
        variables['theme-primary-tint'] = blendWithWhite(primary, 0.1);
    }

    if (secondary && isValidColor(secondary)) {
        variables['secondary'] = secondary;
        variables['theme-secondary'] = secondary;
    }

    return variables;
}
