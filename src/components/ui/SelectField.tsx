'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = ({
    value,
    onValueChange,
    children,
}: {
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
}) => {
    return (
        <div className="relative w-full group">
            <select
                value={value ?? ''}
                onChange={(e) => onValueChange?.(e.target.value)}
                className="w-full h-11 px-4 pr-10 text-sm bg-white border border-gray-200 rounded-xl appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:border-gray-300">
                {children}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 group-hover:translate-y-[-40%]">
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
        </div>
    );
};

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
