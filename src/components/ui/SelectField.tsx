'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = ({
    value,
    onValueChange,
    children,
    leftIcon,
    className,
}: {
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
    leftIcon?: React.ReactNode;
    className?: string;
}) => {
    // We flatten the children to avoid fragments or other components inside the select
    return (
        <div className={cn('relative w-full group', className)}>
            {leftIcon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 z-10">
                    {leftIcon}
                </div>
            )}
            <select
                value={value ?? ''}
                onChange={(e) => onValueChange?.(e.target.value)}
                className={cn(
                    'w-full h-11 px-4 pr-10 text-sm bg-white border border-gray-200 rounded-xl appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:border-gray-300',
                    leftIcon && 'pl-10',
                )}>
                {children}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 group-hover:translate-y-[-40%]">
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
        </div>
    );
};

/**
 * These components are now simple wrappers to maintain API compatibility
 * with Radix-like usage, but they don't render extra DOM nodes inside the select.
 */
const SelectTrigger = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => <>{children}</>;
const SelectValue = ({ placeholder }: { placeholder?: string }) => null;
const SelectContent = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
);

const SelectItem = ({
    value,
    children,
}: {
    value: string;
    children: React.ReactNode;
}) => <option value={value}>{children}</option>;

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
