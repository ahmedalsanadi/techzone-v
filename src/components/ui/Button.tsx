// src/components/ui/Button.tsx
/**
 * Single Button: control look and layout via props; avoid repeating Tailwind at call sites.
 * - Variants: primary, outline, outlineDanger (red outline/hover fill), outlineTint (theme border+fill), secondary, secondaryMuted (card gray), secondaryTint (card theme), ghost, ghostDanger (red hover), iconMuted, stepper (pill +/-), destructive, link.
 * - Sizes: default, sm, lg, xl (48px CTAs), 2xl (hero CTA), card (h-11 card actions); icon, icon-xs (stepper), icon-sm, icon-lg, icon-xl (44px).
 * baseStyles include touch-manipulation; pass className only for unique overrides (e.g. hover:text-red-500).
 */
import * as React from 'react';

// Button variant types
export type ButtonVariant =
    | 'default'
    | 'primary'
    | 'destructive'
    | 'outline'
    | 'outlineDanger'
    | 'outlineTint'
    | 'secondary'
    | 'secondaryMuted'
    | 'secondaryTint'
    | 'ghost'
    | 'ghostDanger'
    | 'iconMuted'
    | 'stepper'
    | 'link';

export type ButtonSize =
    | 'default'
    | 'sm'
    | 'lg'
    | 'xl'
    | '2xl'
    | 'card'
    | 'icon'
    | 'icon-sm'
    | 'icon-xs'
    | 'icon-lg'
    | 'icon-xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    asChild?: boolean;
    children?: React.ReactNode;
}

import { cn } from '@/lib/utils';

// Base styles that are common to all buttons (touch-manipulation for a11y, no repeated classNames at call sites)
const baseStyles =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] cursor-pointer touch-manipulation';

// Variant styles – include default colors so call sites don't repeat text-gray-* for ghost
const variantStyles: Record<ButtonVariant, string> = {
    default:
        'bg-slate-950 text-white hover:bg-slate-900 focus-visible:ring-slate-400/50 focus-visible:border-slate-400 disabled:bg-gray-100 disabled:text-gray-400',
    primary:
        'bg-theme-primary text-white hover:brightness-[0.95] focus-visible:ring-theme-primary/30 shadow-lg shadow-theme-primary/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:brightness-100',
    destructive:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400/20 border-0 disabled:bg-gray-100 disabled:text-gray-400',
    outline:
        'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus-visible:ring-gray-400/50 focus-visible:border-gray-400 disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-200',
    outlineDanger:
        'border border-red-100 bg-white text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 focus-visible:ring-red-400/50 disabled:opacity-50',
    outlineTint:
        'border border-theme-primary bg-theme-primary/10 text-theme-primary hover:bg-theme-primary hover:text-white focus-visible:ring-theme-primary/30 disabled:opacity-50',
    secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400/50 focus-visible:border-gray-400 disabled:opacity-50',
    secondaryMuted:
        'bg-[#F1F3F5] text-gray-600 hover:bg-gray-200 border-0 focus-visible:ring-gray-400/50 disabled:opacity-50',
    secondaryTint:
        'bg-theme-primary/10 text-theme-primary hover:bg-theme-primary/5 border-0 focus-visible:ring-theme-primary/30 disabled:opacity-50',
    ghost: 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400/50 focus-visible:border-gray-400 disabled:opacity-50',
    ghostDanger:
        'text-gray-300 hover:text-red-500 border border-gray-100 hover:border-red-200 bg-transparent hover:bg-red-50/50 focus-visible:ring-red-400/50 rounded-lg disabled:opacity-50',
    iconMuted:
        'bg-gray-50/80 text-gray-400 hover:bg-theme-primary hover:text-white border border-gray-100/50 shadow-sm focus-visible:ring-theme-primary/30 transition-colors disabled:opacity-50',
    stepper:
        'bg-white shadow-sm text-gray-500 hover:bg-gray-100 hover:text-theme-primary focus-visible:ring-gray-400/50 rounded-md disabled:opacity-50',
    link: 'text-slate-950 underline-offset-4 hover:underline focus-visible:ring-gray-400/50 disabled:opacity-50',
};

// Helper function to get variant styles without hover when bg-theme-primary is used
// This prevents conflicting hover states from variant styles
function getVariantStylesWithoutHover(
    variant: ButtonVariant,
    className?: string,
): string {
    const variantStyle = variantStyles[variant];

    // If className contains bg-theme-primary, remove hover states from variant
    // tailwind-merge will handle the rest, but this ensures cleaner merging
    if (className && className.includes('bg-theme-primary')) {
        // Remove hover:bg-* and hover:text-* from variant styles
        return variantStyle
            .split(' ')
            .filter(
                (cls) =>
                    !cls.startsWith('hover:bg-') &&
                    !cls.startsWith('hover:text-'),
            )
            .join(' ');
    }

    return variantStyle;
}

// Helper function to get hover state for theme-primary buttons
function getThemePrimaryHover(className?: string): string {
    if (!className || !className.includes('bg-theme-primary')) {
        return '';
    }

    // Check if custom className already has a hover state
    const hasCustomHover =
        className.includes('hover:brightness') ||
        className.includes('hover:bg-theme-primary') ||
        className.includes('hover:opacity') ||
        className.includes('hover:bg-');

    // If no custom hover is provided and bg-theme-primary is present, add brightness hover
    if (!hasCustomHover) {
        return 'hover:brightness-[0.95]';
    }

    return '';
}

// Size styles – semantic so call sites rarely need layout className
const sizeStyles: Record<ButtonSize, string> = {
    default: 'h-9 px-4 py-2 has-[>svg]:px-3 rounded-lg',
    sm: 'h-9 px-4 rounded-lg gap-2 has-[>svg]:px-3',
    lg: 'h-10 rounded-lg px-6 has-[>svg]:px-4',
    xl: 'min-h-12 px-8 py-3.5 rounded-xl font-bold text-base has-[>svg]:px-6',
    '2xl': 'min-h-12 py-4 px-10 rounded-2xl font-bold text-base has-[>svg]:px-6',
    card: 'h-11 min-h-11 rounded-xl font-bold has-[>svg]:px-4',
    icon: 'size-9 p-0 rounded-lg',
    'icon-sm': 'size-8 p-0 rounded-lg',
    'icon-xs': 'w-7 h-7 min-w-7 min-h-7 p-0 rounded-md shrink-0',
    'icon-lg': 'size-10 p-0 rounded-xl',
    'icon-xl':
        'w-[44px] h-[44px] min-w-[44px] min-h-[44px] p-0 rounded-lg sm:rounded-xl shrink-0',
};

// SVG size styles based on button size (consistent icon scaling, avoids flex issues)
const svgSizeStyles: Record<ButtonSize, string> = {
    default: '[&_svg]:size-4',
    sm: '[&_svg]:size-4',
    lg: '[&_svg]:size-4',
    xl: '[&_svg]:size-5',
    '2xl': '[&_svg]:size-5',
    card: '[&_svg]:size-5',
    icon: '[&_svg]:size-4',
    'icon-sm': '[&_svg]:size-3.5',
    'icon-xs': '[&_svg]:size-3',
    'icon-lg': '[&_svg]:size-5',
    'icon-xl': '[&_svg]:size-5',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'default',
            size = 'default',
            asChild = false,
            children,
            ...props
        },
        ref,
    ) => {
        // Get variant styles (without hover if bg-theme-primary is used)
        const variantStyle = getVariantStylesWithoutHover(variant, className);

        // Get hover state for theme-primary buttons (applied last to ensure precedence)
        const themePrimaryHover = getThemePrimaryHover(className);

        // If asChild is true, we need to clone the element with the appropriate classes
        if (asChild && React.isValidElement(children)) {
            const child = children as React.ReactElement<
                React.HTMLAttributes<HTMLElement>
            >;
            const combinedClassName = cn(child.props.className, className);
            const childVariantStyle = getVariantStylesWithoutHover(
                variant,
                combinedClassName,
            );
            const childThemeHover = getThemePrimaryHover(combinedClassName);

            return React.cloneElement(child, {
                className: cn(
                    baseStyles,
                    childVariantStyle,
                    sizeStyles[size],
                    svgSizeStyles[size],
                    child.props.className,
                    className,
                    childThemeHover,
                ),
                'data-variant': variant,
                'data-size': size,
                ...props,
            } as Partial<React.HTMLAttributes<HTMLElement>>);
        }

        // Regular button element
        // Order matters: className comes before themePrimaryHover so custom hovers take precedence
        // but themePrimaryHover is applied last to ensure it overrides variant hover states
        return (
            <button
                ref={ref}
                data-variant={variant}
                data-size={size}
                className={cn(
                    baseStyles,
                    variantStyle,
                    sizeStyles[size],
                    svgSizeStyles[size],
                    className,
                    themePrimaryHover,
                )}
                {...props}>
                {children}
            </button>
        );
    },
);

Button.displayName = 'Button';

// For backward compatibility - creates variant string for external use
const getButtonVariants = (variant: ButtonVariant, size: ButtonSize) => {
    return cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        svgSizeStyles[size],
    );
};

export { Button, getButtonVariants };
