// src/components/modals/BranchModalInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBranchStore } from '@/store/useBranchStore';
import { storeService } from '@/services/store-service';
import { BRANCH_TYPES } from '@/lib/branches';
import type { Branch } from '@/types/branches';

/**
 * BranchModalInitializer - Optimized to run only once on mount
 *
 * WHY this component exists:
 * - Separates modal trigger logic from layout (keeps layout clean)
 * - Only runs once on initial mount (not on every navigation)
 * - Uses ref to prevent unnecessary re-runs
 * - Prefetches branches in background for instant modal display
 * - Fetches selected branch data if only ID is stored
 */
export default function BranchModalInitializer() {
    const { hasSelectedOnce, setModalOpen, selectedBranchId, selectedBranch } =
        useBranchStore();
    const queryClient = useQueryClient();
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Prefetch branches in background (only once to avoid duplicate requests)
        // This ensures data is ready when modal opens
        if (!hasInitialized.current) {
            const cachedData = queryClient.getQueryData<Branch[]>([
                'branches',
                { type: BRANCH_TYPES.BRANCH },
            ]);

            if (!cachedData) {
                // Only prefetch if not already in cache
                queryClient
                    .prefetchQuery({
                        queryKey: ['branches', { type: BRANCH_TYPES.BRANCH }],
                        queryFn: async () => {
                            const data = await storeService.getBranches({
                                type: BRANCH_TYPES.BRANCH,
                            });
                            // Data is already validated and filtered in storeService.getBranches
                            return data || [];
                        },
                        staleTime: 5 * 60 * 1000, // 5 minutes
                    })
                    .catch(() => {
                        // Silently fail - useQuery will handle retry when modal opens
                    });
            }

            // Prefetch full branch data in background if only ID+name is stored
            if (selectedBranchId && !selectedBranch) {
                queryClient
                    .prefetchQuery({
                        queryKey: ['branch', selectedBranchId],
                        queryFn: () => storeService.getBranch(selectedBranchId),
                        staleTime: 5 * 60 * 1000,
                    })
                    .catch(() => {
                        // Silently fail - name is already available, full object is optional
                    });
            }

            hasInitialized.current = true;
        }

        // Check on EVERY mount (refresh/navigation) if modal should auto-open
        // Modal should ONLY auto-open if no branch is selected yet
        // If branch is selected, modal stays closed (user can open manually via navbar/SubHeader)
        if (!selectedBranchId && !hasSelectedOnce) {
            setModalOpen(true);
        } else if (selectedBranchId || hasSelectedOnce) {
            // Ensure modal is closed if branch is already selected
            // User can still open it manually by clicking navbar item or SubHeader button
            setModalOpen(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBranchId, hasSelectedOnce]); // Re-run when branch selection changes

    return null;
}
