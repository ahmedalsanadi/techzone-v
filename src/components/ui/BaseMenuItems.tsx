'use client';

import { MenuItems as HeadlessMenuItems } from '@headlessui/react';
import React from 'react';

interface BaseMenuItemsProps extends React.ComponentProps<typeof HeadlessMenuItems> {
    children: React.ReactNode;
    className?: string;
}

/**
 * Optimized MenuItems with proper radius, shadows, and transitions
 */
export const BaseMenuItems = ({
    children,
    className = '',
    ...props
}: BaseMenuItemsProps) => {
    return (
        <HeadlessMenuItems
            modal={false}
            {...props}
            className={`z-50 mt-2 origin-top bg-white shadow-xl border border-gray-100 focus:outline-none transition duration-200 ease-out data-[closed]:scale-95 data-closed:opacity-0 ${className}`}>
            {children}
        </HeadlessMenuItems>
    );
};