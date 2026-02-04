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

// Variant styles mapping
const variantStyles: Record<BadgeVariant, string> = {
    default:
        'border-transparent bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200',
    secondary:
        'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
    destructive:
        'border-transparent bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400',
    outline:
        'text-gray-900 border-gray-300 hover:bg-gray-100 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-800',
    primary:
        'border-transparent bg-theme-primary text-white hover:bg-theme-primary/90 shadow-sm shadow-theme-primary/20',
    success:
        'border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning:
        'border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
    info: 'border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
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
