'use client';

import { MenuItems as HeadlessMenuItems } from '@headlessui/react';
import React from 'react';

interface BaseMenuItemsProps extends React.ComponentProps<
    typeof HeadlessMenuItems
> {
    children: React.ReactNode;
    className?: string;
}

/**
 * A standardized MenuItems component for Headless UI Menu.
 * Encapsulates common styles, transitions, and animations.
 */
export const BaseMenuItems = ({
    children,
    className = '',
    ...props
}: BaseMenuItemsProps) => {
    return (
        <HeadlessMenuItems
            {...props}
            className={`z-50 mt-2 origin-top bg-white shadow-2xl border border-gray-100 focus:outline-none transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0 ${className}`}>
            {children}
        </HeadlessMenuItems>
    );
};
