'use client';

import React from 'react';
import Pagination from '@/components/ui/Pagination';
import type { PaginationMeta } from '@/types/api';
import { cn } from '@/lib/utils';

export function ProductsPaginationBar({
    meta,
    page,
    onPageChange,
    className,
}: {
    meta: PaginationMeta;
    page: number;
    onPageChange: (page: number) => void;
    className?: string;
}) {
    return (
        <div className={cn('mt-4 sm:mt-8', className)}>
            <Pagination
                currentPage={page}
                lastPage={meta.last_page}
                onPageChange={onPageChange}
            />
        </div>
    );
}
