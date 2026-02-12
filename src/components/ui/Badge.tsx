import * as React from 'react';

// Define variant types
type BadgeVariant =
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'primary'
    | 'success'
    | 'warning'
    | 'info'
    | 'plain';

// Props interface
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    asChild?: boolean;
}

import { cn } from '@/lib/utils';

// Variant styles: solid bg + high-contrast text so status badges stay readable
const variantStyles: Record<BadgeVariant, string> = {
    default:
        'border-transparent bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200',
    secondary:
        'border-transparent bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500',
    destructive:
        'border-transparent bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:text-white dark:hover:bg-red-800',
    outline:
        'text-gray-900 border-gray-300 hover:bg-gray-100 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-800',
    primary:
        'border-transparent bg-theme-primary text-white hover:bg-theme-primary/90 shadow-sm shadow-theme-primary/20',
    success:
        'border-transparent bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:text-white dark:hover:bg-emerald-800',
    warning:
        'border-transparent bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-700',
    info:
        'border-transparent bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800',
    plain: 'border-transparent bg-transparent text-current',
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
