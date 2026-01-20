// src/components/ui/Button.tsx
import * as React from 'react';

// Button variant types
export type ButtonVariant =
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';

export type ButtonSize =
    | 'default'
    | 'sm'
    | 'lg'
    | 'icon'
    | 'icon-sm'
    | 'icon-lg';

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    asChild?: boolean;
    children?: React.ReactNode;
}

import { cn } from '@/lib/utils';

// Base styles that are common to all buttons
const baseStyles =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] cursor-pointer';

// Variant styles
const variantStyles: Record<ButtonVariant, string> = {
    default:
        'bg-slate-950 text-white hover:bg-slate-900 focus-visible:ring-slate-400/50 focus-visible:border-slate-400',
    destructive:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400/20 border-0',
    outline:
        'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus-visible:ring-gray-400/50 focus-visible:border-gray-400',
    secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400/50 focus-visible:border-gray-400',
    ghost: 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800/50 focus-visible:ring-gray-400/50 focus-visible:border-gray-400',
    link: 'text-slate-950 underline-offset-4 hover:underline focus-visible:ring-gray-400/50',
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
            .filter((cls) => !cls.startsWith('hover:bg-') && !cls.startsWith('hover:text-'))
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

// Size styles
const sizeStyles: Record<ButtonSize, string> = {
    default: 'h-9 px-4 py-2 has-[>svg]:px-3',
    sm: 'h-9 px-4 rounded-lg gap-2 has-[>svg]:px-3',
    lg: 'h-10 rounded-lg px-6 has-[>svg]:px-4',
    icon: 'size-9 p-0',
    'icon-sm': 'size-8 p-0',
    'icon-lg': 'size-10 p-0',
};

// SVG size styles based on button size
const svgSizeStyles: Record<ButtonSize, string> = {
    default: '[&_svg]:size-4',
    sm: '[&_svg]:size-4',
    lg: '[&_svg]:size-4',
    icon: '[&_svg]:size-4',
    'icon-sm': '[&_svg]:size-3',
    'icon-lg': '[&_svg]:size-5',
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
            const combinedClassName = cn(
                child.props.className,
                className,
            );
            const childVariantStyle = getVariantStylesWithoutHover(variant, combinedClassName);
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
