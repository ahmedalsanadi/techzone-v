/**
 * Branch map container with loading/error states
 */

import React from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Branch } from '@/types/branches';

const BranchMap = dynamic(() => import('../BranchMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gray-100 animate-pulse rounded-3xl flex items-center justify-center">
            <div className="text-sm text-gray-400">Loading map...</div>
        </div>
    ),
});

interface BranchMapContainerProps {
    branches: Branch[];
    selectedBranchId?: number;
    isLoading: boolean;
    error: Error | null;
    onBranchSelect: (branch: Branch) => void;
}

export const BranchMapContainer: React.FC<BranchMapContainerProps> = React.memo(
    ({ branches, selectedBranchId, isLoading, error, onBranchSelect }) => {
        if (branches.length > 0) {
            return (
                <BranchMap
                    branches={branches}
                    selectedBranchId={selectedBranchId}
                    onBranchSelect={onBranchSelect}
                />
            );
        }

        if (isLoading) {
            return (
                <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl md:rounded-3xl flex items-center justify-center">
                    <div className="text-sm text-gray-400">Loading map...</div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="w-full h-full rounded-2xl md:rounded-3xl border border-gray-100 bg-gray-50 flex flex-col items-center justify-center p-4 md:p-8">
                    <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mb-4" />
                    <p className="text-xs text-gray-500 text-center">
                        Map unavailable
                    </p>
                </div>
            );
        }

        return (
            <div className="w-full h-full rounded-2xl md:rounded-3xl border border-gray-100 bg-gray-50 flex flex-col items-center justify-center p-4 md:p-8">
                <Building2 className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mb-4" />
                <p className="text-xs text-gray-500 text-center">
                    No branches available
                </p>
            </div>
        );
    },
);

BranchMapContainer.displayName = 'BranchMapContainer';
