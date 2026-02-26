import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, containerClassName, error, ...props }, ref) => {
        return (
            <div
                className={cn(
                    'flex flex-col gap-1 w-full',
                    containerClassName,
                )}>
                <textarea
                    className={cn(
                        'flex min-h-[80px] w-full rounded-2xl bg-gray-50/50 border border-gray-100 px-6 py-4 text-sm focus:border-theme-primary-border focus:ring-4 focus:ring-theme-primary/5 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50 text-start resize-none',
                        error && 'border-red-500 ring-red-500/10',
                        className,
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <span className="text-xs text-red-500 font-medium px-1">
                        {error}
                    </span>
                )}
            </div>
        );
    },
);
Textarea.displayName = 'Textarea';

export { Textarea };
