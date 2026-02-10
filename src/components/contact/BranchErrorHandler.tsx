'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { AlertCircle } from 'lucide-react';

interface BranchErrorHandlerProps {
    hasError: boolean;
    branchId?: string | null;
}

/**
 * Client component to handle branch fetch errors on contact page
 * Shows toast notification when branch_id is invalid or fetch fails
 */
export default function BranchErrorHandler({
    hasError,
    branchId,
}: BranchErrorHandlerProps) {
    const t = useTranslations('Contact');
    const searchParams = useSearchParams();
    const errorShown = searchParams.get('branch_error');

    useEffect(() => {
        if (hasError && branchId && !errorShown) {
            toast.error(
                t('branch_not_found') ||
                    'Branch not found. Showing store contact information.',
                {
                    description:
                        t('branch_not_found_desc') ||
                        'The requested branch could not be loaded. Please try again or contact the store directly.',
                    icon: <AlertCircle className="w-5 h-5" />,
                    duration: 5000,
                },
            );
        }
    }, [hasError, branchId, errorShown, t]);

    return null;
}
