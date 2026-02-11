//src/app/[locale]/[slug]/error.tsx
'use client';

import React from 'react';
import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';

export default function CMSPageError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('CMS Page Error:', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>

                <h2 className="text-3xl font-black text-gray-900 mb-4">
                    Something went wrong!
                </h2>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    We encountered an error while loading this content. It might
                    be a temporary issue with our servers.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        variant="primary"
                        size="xl"
                        onClick={() => reset()}
                        className="flex w-full sm:w-auto justify-center rounded-2xl">
                        <RotateCcw className="w-5 h-5" />
                        Try again
                    </Button>

                    <Button asChild variant="secondary" size="xl" className="w-full sm:w-auto justify-center rounded-2xl">
                        <Link href="/">
                            <Home className="w-5 h-5" />
                            Go Home
                        </Link>
                    </Button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-gray-50 rounded-xl text-left border border-gray-200">
                        <p className="text-xs font-mono text-red-600 overflow-auto max-h-40">
                            {error.message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
