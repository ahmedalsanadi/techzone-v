/**
 * Branch list state components (loading, error, empty)
 */

import React from 'react';
import { Building2, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LoadingStateProps {
    count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ count = 4 }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className="h-24 w-full bg-gray-50 animate-pulse rounded-3xl"
                aria-label="Loading branch"
            />
        ))}
    </>
);

interface ErrorStateProps {
    error: Error | null;
    onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
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
                    {t('error_loading_branches') || 'Failed to load branches'}
                </p>
                <p className="text-xs text-gray-500 mb-4">{errorMessage}</p>
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-primary text-white text-sm font-medium hover:brightness-[0.95] transition-all focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2"
                    aria-label={t('retry') || 'Retry'}>
                    <RefreshCw size={16} />
                    {t('retry') || 'Retry'}
                </button>
            </div>
        </div>
    );
};

export const EmptyState: React.FC = () => {
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
