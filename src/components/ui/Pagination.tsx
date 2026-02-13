'use client';

import React from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    lastPage,
    onPageChange,
}) => {
    const t = useTranslations('Promotions');

    if (lastPage <= 1) return null;

    const renderPageButtons = () => {
        const pages: (number | string)[] = [];

        if (lastPage <= 7) {
            for (let i = 1; i <= lastPage; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(lastPage - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < lastPage - 2) pages.push('...');
            if (!pages.includes(lastPage)) pages.push(lastPage);
        }

        return pages.map((page, i) =>
            page === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-gray-400">
                    ...
                </span>
            ) : (
                <Button
                    key={page}
                    variant={
                        Number(currentPage) === Number(page)
                            ? 'primary'
                            : 'ghost'
                    }
                    size="sm"
                    className={cn(
                        'w-8 h-8 md:w-10 md:h-10 p-0 rounded-xl',
                        Number(currentPage) !== Number(page) &&
                            'hover:bg-theme-primary/10 hover:text-theme-primary focus-visible:ring-theme-primary/30',
                    )}
                    onClick={() => onPageChange(Number(page))}>
                    {page}
                </Button>
            ),
        );
    };

    return (
        <div className="flex items-center justify-center gap-2 pt-8 border-t border-theme-primary/10">
            <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="rounded-xl px-4 hover:bg-theme-primary/10 hover:text-theme-primary focus-visible:ring-theme-primary/30 disabled:hover:bg-transparent disabled:hover:text-gray-500">
                <ChevronLeft className="w-4 h-4 mr-2 rtl:rotate-180" />
                {t('previous')}
            </Button>

            <div className="flex items-center gap-1">{renderPageButtons()}</div>

            <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === lastPage}
                onClick={() => onPageChange(currentPage + 1)}
                className="rounded-xl px-4 hover:bg-theme-primary/10 hover:text-theme-primary focus-visible:ring-theme-primary/30 disabled:hover:bg-transparent disabled:hover:text-gray-500">
                {t('next')}
                <ChevronRight className="w-4 h-4 ml-2 rtl:rotate-180" />
            </Button>
        </div>
    );
};

export default Pagination;
