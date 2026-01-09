'use client';

import * as React from 'react';

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
        <div className="relative inline-block w-full">
            <select
                value={value ?? ''}
                onChange={(e) => onValueChange?.(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                {children}
            </select>
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
