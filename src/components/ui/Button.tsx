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
        // If asChild is true, we need to clone the element with the appropriate classes
        if (asChild && React.isValidElement(children)) {
            const child = children as React.ReactElement<
                React.HTMLAttributes<HTMLElement>
            >;
            return React.cloneElement(child, {
                className: cn(
                    baseStyles,
                    variantStyles[variant],
                    sizeStyles[size],
                    svgSizeStyles[size],
                    child.props.className,
                    className,
                ),
                'data-variant': variant,
                'data-size': size,
                ...props,
            } as Partial<React.HTMLAttributes<HTMLElement>>);
        }

        // Regular button element
        return (
            <button
                ref={ref}
                data-variant={variant}
                data-size={size}
                className={cn(
                    baseStyles,
                    variantStyles[variant],
                    sizeStyles[size],
                    svgSizeStyles[size],
                    className,
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
