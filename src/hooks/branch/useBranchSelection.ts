/**
 * Custom hook for branch selection modal logic
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { useBranchStore } from '@/store/useBranchStore';
import { branchService } from '@/services/branch-service';
import { BRANCH_TYPES, calculateBranchIsOpen } from '@/lib/branches';
import type { Branch } from '@/types/branches';
import { useCartStore } from '@/store/useCartStore';
import { useCartActions } from '../cart/useCartActions';
import { useQueryClient } from '@tanstack/react-query';
import { CACHE_TAGS } from '@/config/cache';

export function useBranchSelection() {
    const router = useRouter();
    const {
        setSelectedBranch,
        isModalOpen,
        setModalOpen,
        selectedBranchId,
        hasSelectedOnce,
        selectedBranch,
    } = useBranchStore();
    const { getTotalItems } = useCartStore();
    const { clearAllCart } = useCartActions();
    const queryClient = useQueryClient();

    const [tempSelectedBranch, setTempSelectedBranch] = useState<Branch | null>(
        null,
    );
    const [showWorkingHours, setShowWorkingHours] = useState<Branch | null>(
        null,
    );
    const [focusedBranchIndex, setFocusedBranchIndex] = useState<number>(0);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [isClearingCart, setClearingCart] = useState(false);

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

    // Initialize temp selection from store when modal opens
    useEffect(() => {
        if (isModalOpen) {
            setTimeout(() => {
                setTempSelectedBranch(selectedBranch);
            }, 0);
        }
    }, [isModalOpen, selectedBranch]);

    // Calculate is_open for each branch
    const branches = useMemo(() => {
        return rawBranches.map((branch) => ({
            ...branch,
            is_open: calculateBranchIsOpen(branch),
        }));
    }, [rawBranches]);

    // Memoize selected branch for map - use temp selection for preview
    const selectedBranchForMap = useMemo(() => {
        return tempSelectedBranch?.id || branches[0]?.id;
    }, [tempSelectedBranch, branches]);

    // Handlers
    const handleBranchSelect = useCallback((branch: Branch) => {
        setTempSelectedBranch(branch);
    }, []);

    const executeSelection = useCallback(
        async (branch: Branch, isChanging: boolean) => {
            if (isChanging) {
                setClearingCart(true);
                try {
                    await clearAllCart();
                } finally {
                    setClearingCart(false);
                }
            }

            setSelectedBranch(branch);
            setModalOpen(false);

            // Invalidate branch-dependent queries if branch changed
            if (isChanging) {
                queryClient.invalidateQueries({
                    queryKey: [CACHE_TAGS.PRODUCTS],
                });
                queryClient.invalidateQueries({
                    queryKey: [CACHE_TAGS.CATEGORIES],
                });
                queryClient.invalidateQueries({
                    queryKey: ['checkout'],
                });

                // Force refresh Server Components to reflect new branch data
                router.refresh();
            }
        },
        [setSelectedBranch, setModalOpen, clearAllCart, queryClient, router],
    );

    const handleConfirmSelection = useCallback(async () => {
        if (tempSelectedBranch) {
            const isChanging =
                selectedBranchId && selectedBranchId !== tempSelectedBranch.id;
            const hasItems = getTotalItems() > 0;

            if (isChanging && hasItems) {
                // Show confirmation modal if branch changes and has items
                setConfirmOpen(true);
                return;
            }

            // Proceed directly if no items or no branch change
            await executeSelection(
                tempSelectedBranch,
                Boolean(isChanging && selectedBranchId),
            );
        }
    }, [tempSelectedBranch, selectedBranchId, getTotalItems, executeSelection]);

    const handleConfirmBranchChange = useCallback(async () => {
        if (tempSelectedBranch) {
            await executeSelection(tempSelectedBranch, true);
            setConfirmOpen(false);
        }
    }, [tempSelectedBranch, executeSelection]);

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
            // Do not close modal - let fixed logic handle it
        },
        [router],
    );

    const handleCloseWorkingHours = useCallback(() => {
        setShowWorkingHours(null);
    }, []);

    const handleCloseModal = useCallback(() => {
        if (selectedBranchId || hasSelectedOnce) {
            setModalOpen(false);
        }
    }, [selectedBranchId, hasSelectedOnce, setModalOpen]);

    return {
        branches,
        isLoading,
        error,
        refetch,
        isFetching,
        tempSelectedBranch,
        setTempSelectedBranch,
        focusedBranchIndex,
        setFocusedBranchIndex,
        selectedBranchForMap,
        showWorkingHours,
        handleBranchSelect,
        handleConfirmSelection,
        handleWorkingHoursClick,
        handleContactClick,
        handleCloseWorkingHours,
        handleCloseModal,
        isModalOpen,
        setModalOpen,
        selectedBranchId,
        hasSelectedOnce,
        isConfirmOpen,
        setConfirmOpen,
        isClearingCart,
        handleConfirmBranchChange,
    };
}
