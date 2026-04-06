'use client';

import { Button } from '@/components/ui/Button';

export function ErrorState({
    title = 'Something went wrong',
    description = 'Please try again.',
    onRetry,
    onReset,
}: {
    title?: string;
    description?: string;
    onRetry?: () => void;
    onReset?: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-600 min-h-[380px] text-center px-4">
            <div className="text-lg font-semibold text-gray-800">{title}</div>
            <div className="mt-2 text-sm max-w-md">{description}</div>
            <div className="mt-6 flex items-center gap-3">
                {onRetry ? (
                    <Button variant="primary" onClick={onRetry}>
                        Retry
                    </Button>
                ) : null}
                {onReset ? (
                    <Button variant="outlineTint" onClick={onReset}>
                        Reset filters
                    </Button>
                ) : null}
            </div>
        </div>
    );
}

