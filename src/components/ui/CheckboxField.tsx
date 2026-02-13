'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, checked, ...props }, ref) => {
        const isChecked = checked ?? false;

        return (
            <div
                className={cn(
                    'relative flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all duration-200 cursor-pointer',
                    isChecked
                        ? 'bg-primary border-primary shadow-lg shadow-primary/20 scale-105'
                        : 'bg-white border-gray-200 hover:border-primary/50',
                    className,
                )}
                onClick={() => onCheckedChange?.(!isChecked)}>
                <input
                    {...props}
                    type="checkbox"
                    ref={ref}
                    className="sr-only"
                    checked={isChecked}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                />
                <Check
                    className={cn(
                        'w-4 h-4 text-white transition-all duration-200 transform',
                        isChecked
                            ? 'scale-100 opacity-100'
                            : 'scale-50 opacity-0',
                    )}
                />
            </div>
        );
    },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
