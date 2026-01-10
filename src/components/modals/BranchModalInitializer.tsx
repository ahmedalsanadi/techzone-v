// src/components/modals/BranchModalInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBranchStore } from '@/store/useBranchStore';
import { storeService } from '@/services/store-service';
import { BRANCH_TYPES } from '@/config/branches';
import { Branch } from '@/services/types';

/**
 * BranchModalInitializer - Optimized to run only once on mount
 *
 * WHY this component exists:
 * - Separates modal trigger logic from layout (keeps layout clean)
 * - Only runs once on initial mount (not on every navigation)
 * - Uses ref to prevent unnecessary re-runs
 * - Prefetches branches in background for instant modal display
 */
export default function BranchModalInitializer() {
    const { hasSelectedOnce, setModalOpen } = useBranchStore();
    const queryClient = useQueryClient();
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Only run once on mount, not on every re-render
        if (hasInitialized.current) return;

        // Prefetch branches in background so modal opens instantly
        // This ensures data is ready when modal opens
        // Only prefetch if data doesn't exist in cache (avoid duplicate requests)
        const cachedData = queryClient.getQueryData<Branch[]>([
            'branches',
            { type: BRANCH_TYPES.BRANCH },
        ]);

        if (!cachedData) {
            // Only prefetch if not already in cache
            queryClient.prefetchQuery({
                queryKey: ['branches', { type: BRANCH_TYPES.BRANCH }],
                queryFn: async () => {
                    const data = await storeService.getBranches({
                        type: BRANCH_TYPES.BRANCH,
                    });
                    // Filter out invalid branches and ensure data structure
                    return (data || []).filter(
                        (branch) =>
                            branch && branch.id && branch.name && branch.address,
                    );
                },
                staleTime: 5 * 60 * 1000, // 5 minutes
            }).catch(() => {
                // Silently fail - useQuery will handle retry when modal opens
                // Don't set empty data in cache, let useQuery handle it
            });
        }

        // Trigger modal on first visit if no branch has been selected before
        if (!hasSelectedOnce) {
            setModalOpen(true);
        }

        hasInitialized.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps - only run on mount

    return null;
}
