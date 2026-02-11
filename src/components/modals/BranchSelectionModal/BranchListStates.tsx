/**
 * Branch list state components (loading, error, empty)
 */

import React from 'react';
import { Building2, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface LoadingStateProps {
    count?: number;
}

const LoadingStateComponent: React.FC<LoadingStateProps> = ({ count = 4 }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className="h-20 md:h-24 w-full bg-gray-50 animate-pulse rounded-2xl md:rounded-3xl"
                aria-label="Loading branch"
            />
        ))}
    </>
);
LoadingStateComponent.displayName = 'LoadingState';
export const LoadingState = React.memo(LoadingStateComponent);

interface ErrorStateProps {
    error: Error | null;
    onRetry: () => void;
}

const ErrorStateComponent: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
    const t = useTranslations('Branches');

    const errorMessage =
        error instanceof Error
            ? error.message.includes('timeout') ||
              error.message.includes('timed out')
                ? 'The request took too long. Please check your connection and try again.'
                : error.message
            : 'An unexpected error occurred. Please try again.';

    return (
        <div
            className="flex flex-col items-center justify-center p-8 text-center space-y-4"
            role="alert"
            aria-live="polite">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('error_loading_branches') ||
                        'Failed to load branches'}
                </p>
                <p className="text-xs text-gray-500 mb-4">{errorMessage}</p>
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={onRetry}
                    className="rounded-xl"
                    aria-label={t('retry') || 'Retry'}>
                    <RefreshCw size={16} />
                    {t('retry') || 'Retry'}
                </Button>
            </div>
        </div>
    );
};
ErrorStateComponent.displayName = 'ErrorState';
export const ErrorState = React.memo(ErrorStateComponent);

const EmptyStateComponent: React.FC = () => {
    const t = useTranslations('Branches');

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-sm text-gray-500">
                {t('no_branches_available') || 'No branches available'}
            </p>
        </div>
    );
};
EmptyStateComponent.displayName = 'EmptyState';
export const EmptyState = React.memo(EmptyStateComponent);
