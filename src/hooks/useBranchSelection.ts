/**
 * Custom hook for branch selection modal logic
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { useBranchStore } from '@/store/useBranchStore';
import { branchService } from '@/services/branch-service';
import { BRANCH_TYPES, calculateBranchIsOpen } from '@/lib/branches';
import type { Branch } from '@/types/branches';

export function useBranchSelection() {
    const router = useRouter();
    const { setSelectedBranch, isModalOpen, setModalOpen } = useBranchStore();
    const [hoveredBranchId, setHoveredBranchId] = useState<number | null>(null);
    const [showWorkingHours, setShowWorkingHours] = useState<Branch | null>(
        null,
    );
    const [focusedBranchIndex, setFocusedBranchIndex] = useState<number>(0);

    // Fetch branches with React Query
    const {
        data: rawBranches = [],
        isLoading,
        error,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ['branches', { type: BRANCH_TYPES.BRANCH }],
        queryFn: async () => {
            try {
                return await branchService.getBranches({
                    type: BRANCH_TYPES.BRANCH,
                });
            } catch (err) {
                if (err instanceof Error) {
                    console.error('Failed to load branches:', err);
                    throw err;
                }
                throw new Error('Failed to load branches');
            }
        },
        enabled: isModalOpen,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        retryDelay: 1000,
        placeholderData: (previousData) => previousData,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    // Calculate is_open for each branch
    const branches = useMemo(() => {
        return rawBranches.map((branch) => ({
            ...branch,
            is_open: calculateBranchIsOpen(branch),
        }));
    }, [rawBranches]);

    // Memoize selected branch for map
    const selectedBranchForMap = useMemo(() => {
        return hoveredBranchId || branches[0]?.id;
    }, [hoveredBranchId, branches]);

    // Handlers
    const handleBranchSelect = useCallback(
        (branch: Branch) => {
            setSelectedBranch(branch);
        },
        [setSelectedBranch],
    );

    const handleWorkingHoursClick = useCallback(
        (e: React.MouseEvent, branch: Branch) => {
            e.stopPropagation();
            setShowWorkingHours(branch);
        },
        [],
    );

    const handleContactClick = useCallback(
        (e: React.MouseEvent, branchId: number) => {
            e.stopPropagation();
            router.push(`/contact?branch_id=${branchId}`);
            setModalOpen(false);
        },
        [router, setModalOpen],
    );

    const handleCloseWorkingHours = useCallback(() => {
        setShowWorkingHours(null);
    }, []);

    return {
        branches,
        isLoading,
        error,
        refetch,
        isFetching,
        hoveredBranchId,
        setHoveredBranchId,
        focusedBranchIndex,
        setFocusedBranchIndex,
        selectedBranchForMap,
        showWorkingHours,
        handleBranchSelect,
        handleWorkingHoursClick,
        handleContactClick,
        handleCloseWorkingHours,
        isModalOpen,
        setModalOpen,
    };
}
