'use client';

import { Button } from '@/components/ui/Button';

export function EmptyState({
    title = 'No products found',
    description = 'Try clearing filters or changing your search.',
    onClearFilters,
}: {
    title?: string;
    description?: string;
    onClearFilters?: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-600 min-h-[380px] text-center px-4">
            <div className="text-lg font-semibold text-gray-800">{title}</div>
            <div className="mt-2 text-sm max-w-md">{description}</div>
            {onClearFilters ? (
                <Button className="mt-6" variant="outlineTint" onClick={onClearFilters}>
                    Clear filters
                </Button>
            ) : null}
        </div>
    );
}

