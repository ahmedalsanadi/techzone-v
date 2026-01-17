// src/components/modals/BranchSelectionModal.tsx
'use client';

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
} from 'react';
import {
    ChevronRight,
    Building2,
    Headphones,
    Clock,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import type { Branch } from '@/types/branches';
import { useBranchStore } from '@/store/useBranchStore';
import { storeService } from '@/services/store-service';
import { BRANCH_TYPES, calculateBranchIsOpen } from '@/lib/branches';
import dynamic from 'next/dynamic';
import WorkingHoursModal from './WorkingHoursModal';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/navigation';

// Lazy load map only when needed - don't block modal rendering
const BranchMap = dynamic(() => import('./BranchMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gray-100 animate-pulse rounded-3xl flex items-center justify-center">
            <div className="text-sm text-gray-400">Loading map...</div>
        </div>
    ),
});

const BranchSelectionModal: React.FC = () => {
    const t = useTranslations('Branches');
    const router = useRouter();
    const { setSelectedBranch, isModalOpen, setModalOpen } = useBranchStore();

    const [hoveredBranchId, setHoveredBranchId] = useState<number | null>(null);
    const [showWorkingHours, setShowWorkingHours] = useState<Branch | null>(
        null,
    );
    const [focusedBranchIndex, setFocusedBranchIndex] = useState<number>(0);

    // Refs for accessibility and focus management
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const branchListRef = useRef<HTMLDivElement>(null);

    // React Query for branches with proper error handling and caching
    // Prefetched in background by BranchModalInitializer for instant display
    // Only fetches if data is stale or missing - uses cache otherwise
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
                const data = await storeService.getBranches({
                    type: BRANCH_TYPES.BRANCH,
                });
                // Filter out invalid branches and ensure data structure
                return (data || []).filter(
                    (branch) =>
                        branch &&
                        branch.id &&
                        branch.name &&
                        branch.address &&
                        branch.working_hours, // Ensure working_hours exists
                );
            } catch (err) {
                // Handle timeout and other errors gracefully
                if (err instanceof Error) {
                    console.error('Failed to load branches:', err);
                    throw err;
                }
                throw new Error('Failed to load branches');
            }
        },
        // Only fetch when modal is open AND data is stale/missing
        // React Query automatically deduplicates requests
        enabled: isModalOpen,
        staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 min
        gcTime: 10 * 60 * 1000, // 10 minutes - cache for 10 min
        retry: 1, // Reduce retries for faster failure
        retryDelay: 1000, // Faster retry
        // Use cached data immediately if available (from prefetch)
        placeholderData: (previousData) => previousData,
        // Don't refetch on window focus if data is fresh
        refetchOnWindowFocus: false,
        // Don't refetch on reconnect if data is fresh
        refetchOnReconnect: false,
    });

    // Calculate is_open for each branch and enhance branch objects
    const branches = useMemo(() => {
        return rawBranches.map((branch) => ({
            ...branch,
            is_open: calculateBranchIsOpen(branch),
        }));
    }, [rawBranches]);

    // Focus trap and keyboard navigation
    useEffect(() => {
        if (!isModalOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Close on Escape
            if (e.key === 'Escape') {
                setModalOpen(false);
                return;
            }

            // Arrow key navigation for branch list
            if (
                (e.key === 'ArrowDown' || e.key === 'ArrowUp') &&
                branchListRef.current
            ) {
                e.preventDefault();
                const branchItems =
                    branchListRef.current.querySelectorAll(
                        '[data-branch-item]',
                    );
                if (branchItems.length === 0) return;

                let newIndex = focusedBranchIndex;
                if (e.key === 'ArrowDown') {
                    newIndex = Math.min(
                        focusedBranchIndex + 1,
                        branchItems.length - 1,
                    );
                } else {
                    newIndex = Math.max(focusedBranchIndex - 1, 0);
                }

                setFocusedBranchIndex(newIndex);
                (branchItems[newIndex] as HTMLElement)?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        // Focus close button on open
        closeButtonRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isModalOpen, focusedBranchIndex, setModalOpen]);

    // Ensure focused index is valid when branches change
    useEffect(() => {
        if (branches.length > 0 && focusedBranchIndex >= branches.length) {
            // Use setTimeout to avoid synchronous setState in effect
            const timer = setTimeout(() => {
                setFocusedBranchIndex(0);
            }, 0);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [branches.length]); // Only reset when branches.length changes

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

    // Memoize selected branch for map
    const selectedBranchForMap = useMemo(() => {
        return hoveredBranchId || branches[0]?.id;
    }, [hoveredBranchId, branches]);

    if (!isModalOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-500"
                onClick={() => setModalOpen(false)}
                role="presentation"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="branch-modal-title"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none"
                onClick={(e) => e.stopPropagation()}>
                <div className="bg-white w-full max-w-6xl h-[90vh] md:h-[80vh] rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden relative animate-in zoom-in-95 duration-500 pointer-events-auto">
                    {/* Branch list Side */}
                    <div className="w-full md:w-[400px] flex flex-col bg-white border-r border-gray-100 p-8 shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <button
                                ref={closeButtonRef}
                                onClick={() => setModalOpen(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                aria-label={t('close_modal') || 'Close modal'}>
                                <ChevronRight size={20} />
                            </button>
                            <h2
                                id="branch-modal-title"
                                className="text-xl font-black text-gray-900">
                                {t('select_branch')}
                            </h2>
                        </div>

                        {/* Content */}
                        <div
                            ref={branchListRef}
                            className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4"
                            role="listbox"
                            aria-label={t('branch_list') || 'Branch list'}>
                            {isLoading || isFetching ? (
                                // Loading state
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-24 w-full bg-gray-50 animate-pulse rounded-3xl"
                                        aria-label="Loading branch"
                                    />
                                ))
                            ) : error ? (
                                // Error state
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
                                        <p className="text-xs text-gray-500 mb-4">
                                            {error instanceof Error
                                                ? error.message.includes(
                                                      'timeout',
                                                  ) ||
                                                  error.message.includes(
                                                      'timed out',
                                                  )
                                                    ? 'The request took too long. Please check your connection and try again.'
                                                    : error.message
                                                : 'An unexpected error occurred. Please try again.'}
                                        </p>
                                        <button
                                            onClick={() => refetch()}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            aria-label={t('retry') || 'Retry'}>
                                            <RefreshCw size={16} />
                                            {t('retry') || 'Retry'}
                                        </button>
                                    </div>
                                </div>
                            ) : branches.length === 0 ? (
                                // Empty state
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <Building2 className="w-12 h-12 text-gray-300 mb-4" />
                                    <p className="text-sm text-gray-500">
                                        {t('no_branches_available') ||
                                            'No branches available'}
                                    </p>
                                </div>
                            ) : (
                                // Branch list
                                branches.map((branch, index) => (
                                    <div
                                        key={branch.id}
                                        data-branch-item
                                        tabIndex={0}
                                        onMouseEnter={() =>
                                            setHoveredBranchId(branch.id)
                                        }
                                        onFocus={() => {
                                            setHoveredBranchId(branch.id);
                                            setFocusedBranchIndex(index);
                                        }}
                                        onClick={() =>
                                            handleBranchSelect(branch)
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ' '
                                            ) {
                                                e.preventDefault();
                                                handleBranchSelect(branch);
                                            }
                                        }}
                                        className={cn(
                                            'group p-5 rounded-3xl border transition-all duration-300 cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                                            hoveredBranchId === branch.id
                                                ? 'border-red-100 bg-red-50/30 shadow-lg shadow-red-500/5 -translate-x-1'
                                                : 'border-gray-50 bg-white hover:border-gray-200',
                                        )}
                                        role="option"
                                        aria-selected={
                                            hoveredBranchId === branch.id
                                        }
                                        aria-label={`${
                                            branch.name || 'Branch'
                                        }, ${
                                            branch.is_open
                                                ? t('open')
                                                : t('closed')
                                        }`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4">
                                                <div
                                                    className={cn(
                                                        'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300',
                                                        hoveredBranchId ===
                                                            branch.id
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100',
                                                    )}
                                                    aria-hidden="true">
                                                    <Building2 size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">
                                                        {branch.name ||
                                                            'Branch'}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span
                                                            className={cn(
                                                                'text-[10px] font-black uppercase tracking-wider',
                                                                branch.is_open
                                                                    ? 'text-green-500'
                                                                    : 'text-gray-400',
                                                            )}>
                                                            {branch.is_open
                                                                ? t('open')
                                                                : t('closed')}
                                                        </span>
                                                        <span
                                                            className="w-1 h-1 rounded-full bg-gray-200"
                                                            aria-hidden="true"
                                                        />
                                                        {branch.services && (
                                                            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-bold">
                                                                {branch.services
                                                                    .shipping_enabled
                                                                    ? t(
                                                                          'free_delivery',
                                                                      )
                                                                    : t(
                                                                          'delivery_with_fee',
                                                                          {
                                                                              fee: 5,
                                                                          },
                                                                      )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) =>
                                                            handleWorkingHoursClick(
                                                                e,
                                                                branch,
                                                            )
                                                        }
                                                        className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                                                        aria-label={`${
                                                            t(
                                                                'view_working_hours',
                                                            ) ||
                                                            'View working hours'
                                                        } - ${branch.name}`}
                                                        title={
                                                            t(
                                                                'view_working_hours',
                                                            ) ||
                                                            'View working hours'
                                                        }>
                                                        <Clock size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) =>
                                                            handleContactClick(
                                                                e,
                                                                branch.id,
                                                            )
                                                        }
                                                        className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                                                        aria-label={`${
                                                            t(
                                                                'contact_branch',
                                                            ) ||
                                                            'Contact branch'
                                                        } - ${branch.name}`}
                                                        title={
                                                            t(
                                                                'contact_branch',
                                                            ) ||
                                                            'Contact branch'
                                                        }>
                                                        <Headphones size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Map Side - Only load when branches are ready */}
                    <div className="flex-1 h-1/2 md:h-auto relative p-6">
                        {branches.length > 0 ? (
                            // Show map with branches (cached or fresh data)
                            // Map loads asynchronously, doesn't block modal
                            <BranchMap
                                branches={branches}
                                selectedBranchId={selectedBranchForMap}
                                onBranchSelect={(branch) => {
                                    setHoveredBranchId(branch.id);
                                    const index = branches.findIndex(
                                        (b) => b.id === branch.id,
                                    );
                                    if (index >= 0) {
                                        setFocusedBranchIndex(index);
                                    }
                                }}
                            />
                        ) : isLoading ? (
                            // Show loading state for map while initial fetch
                            <div className="w-full h-full bg-gray-100 animate-pulse rounded-3xl flex items-center justify-center">
                                <div className="text-sm text-gray-400">
                                    Loading map...
                                </div>
                            </div>
                        ) : error ? (
                            // Show error state for map
                            <div className="w-full h-full rounded-3xl border border-gray-100 bg-gray-50 flex flex-col items-center justify-center p-8">
                                <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                                <p className="text-xs text-gray-500 text-center">
                                    Map unavailable
                                </p>
                            </div>
                        ) : (
                            // Empty state
                            <div className="w-full h-full rounded-3xl border border-gray-100 bg-gray-50 flex flex-col items-center justify-center p-8">
                                <Building2 className="w-12 h-12 text-gray-300 mb-4" />
                                <p className="text-xs text-gray-500 text-center">
                                    No branches available
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Working Hours Sub-Modal */}
            {showWorkingHours && (
                <WorkingHoursModal
                    branch={showWorkingHours}
                    onClose={() => setShowWorkingHours(null)}
                />
            )}
        </>
    );
};

export default BranchSelectionModal;
