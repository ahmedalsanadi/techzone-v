// src/components/modals/BranchModalInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBranchStore } from '@/store/useBranchStore';
import { branchService } from '@/services/branch-service';
import { BRANCH_TYPES, branchCookies } from '@/lib/branches';
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
 * - If the API returns exactly one branch, selects it and skips the modal
 */
export default function BranchModalInitializer() {
    const {
        hasSelectedOnce,
        selectedBranchId,
        selectedBranch,
        isModalOpen,
        _hasHydrated,
    } = useBranchStore();
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
                        queryFn: () =>
                            branchService.getBranches({
                                type: BRANCH_TYPES.BRANCH,
                            }),
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
                        queryFn: () =>
                            branchService.getBranch(selectedBranchId),
                        staleTime: 5 * 60 * 1000,
                    })
                    .catch(() => {
                        // Silently fail - name is already available, full object is optional
                    });
            }

            hasInitialized.current = true;
        }

        // Sync cookie with persisted store state on mount/change
        if (selectedBranchId) {
            branchCookies.setBranchId(selectedBranchId);
        }

        // After hydration: either auto-pick the sole branch or open the picker.
        // Do not open the modal until we know the count — avoids a flash when there is only one branch.
        // Skip when modal is already open (e.g. user cleared branch — list loads inside the modal).
        if (
            !_hasHydrated ||
            selectedBranchId ||
            hasSelectedOnce ||
            isModalOpen
        ) {
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const branches = await queryClient.fetchQuery({
                    queryKey: ['branches', { type: BRANCH_TYPES.BRANCH }],
                    queryFn: () =>
                        branchService.getBranches({
                            type: BRANCH_TYPES.BRANCH,
                        }),
                    staleTime: 5 * 60 * 1000,
                });
                if (cancelled) return;

                const store = useBranchStore.getState();
                if (
                    store.selectedBranchId ||
                    store.hasSelectedOnce ||
                    store.isModalOpen
                ) {
                    return;
                }

                if (branches.length === 1) {
                    store.setSelectedBranch(branches[0]);
                } else {
                    store.setModalOpen(true);
                }
            } catch {
                if (cancelled) return;
                const store = useBranchStore.getState();
                if (store.selectedBranchId || store.isModalOpen) return;
                store.setModalOpen(true);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBranchId, hasSelectedOnce, isModalOpen, _hasHydrated]); // Re-run when branch selection, modal state, or hydration change

    return null;
}
