import * as React from 'react';

// Define variant types
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'primary';

// Props interface
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    asChild?: boolean;
}

import { cn } from '@/lib/utils';

// Variant styles mapping
const variantStyles: Record<BadgeVariant, string> = {
    default:
        'border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-200 dark:focus:ring-blue-400',
    secondary:
        'border-transparent bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-200 dark:focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-100',
    destructive:
        'border-transparent bg-red-600 text-white hover:bg-red-700 focus:ring-red-200 dark:focus:ring-red-400 dark:bg-red-700',
    outline:
        'text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200 dark:focus:ring-gray-400 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-800',
    primary: 'border-transparent bg-theme-primary text-white hover:bg-theme-primary-hover focus:ring-theme-primary-border'            
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    (
        { className, variant = 'default', asChild = false, children, ...props },
        ref,
    ) => {
        // Base styles
        const baseStyles =
            'inline-flex items-center justify-center rounded-lg border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

        // Combine all styles
        const badgeClasses = cn(baseStyles, variantStyles[variant], className);

        // Handle asChild prop - render children directly if asChild is true
        // Note: Ref forwarding is not supported with asChild due to React's limitations
        if (asChild && React.isValidElement(children)) {
            const child = children as React.ReactElement<
                React.HTMLAttributes<HTMLElement>
            >;
            return React.cloneElement(child, {
                className: cn(badgeClasses, child.props.className),
                ...props,
            } as Partial<React.HTMLAttributes<HTMLElement>>);
        }

        return (
            <span ref={ref} className={badgeClasses} {...props}>
                {children}
            </span>
        );
    },
);

Badge.displayName = 'Badge';

// Export the component and the variant styles for reuse
export { Badge, variantStyles, type BadgeVariant, type BadgeProps };
