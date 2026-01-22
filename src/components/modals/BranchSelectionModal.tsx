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
    MapPin,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import type { Branch } from '@/types/branches';
import { useBranchStore } from '@/store/useBranchStore';
import { branchService } from '@/services/branch-service';
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
    const {
        setSelectedBranch,
        isModalOpen,
        setModalOpen,
        selectedBranchId,
        hasSelectedOnce,
        selectedBranch,
    } = useBranchStore();

    const [tempSelectedBranch, setTempSelectedBranch] = useState<Branch | null>(
        null,
    );
    const [showWorkingHours, setShowWorkingHours] = useState<Branch | null>(
        null,
    );
    const [focusedBranchIndex, setFocusedBranchIndex] = useState<number>(0);

    // Initialize temp selection from store when modal opens
    useEffect(() => {
        if (isModalOpen) {
            setTempSelectedBranch(selectedBranch);
        }
    }, [isModalOpen, selectedBranch]);

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
                // branchService.getBranches already validates and filters branches
                return await branchService.getBranches({
                    type: BRANCH_TYPES.BRANCH,
                });
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
            // Close on Escape - Only if dismissible
            if (e.key === 'Escape') {
                if (!selectedBranchId && !hasSelectedOnce) return;
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

    const handleConfirmSelection = useCallback(() => {
        if (tempSelectedBranch) {
            setSelectedBranch(tempSelectedBranch);
        }
    }, [tempSelectedBranch, setSelectedBranch]);

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
            // Do not close modal - let the initializer handle it or force selection
        },
        [router],
    );

    if (!isModalOpen) return null;

    const selectedBranchForMap = tempSelectedBranch?.id || branches[0]?.id;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-500"
                onClick={() => {
                    if (selectedBranchId || hasSelectedOnce) {
                        setModalOpen(false);
                    }
                }}
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
                    <div className="w-full md:w-[450px] flex flex-col bg-white border-r border-gray-100 p-8 shadow-2xl z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            {(selectedBranchId || hasSelectedOnce) && (
                                <button
                                    ref={closeButtonRef}
                                    onClick={() => setModalOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2"
                                    aria-label={
                                        t('close_modal') || 'Close modal'
                                    }>
                                    <ChevronRight size={20} />
                                </button>
                            )}
                            <h2
                                id="branch-modal-title"
                                className="text-xl font-black text-gray-900">
                                {t('select_branch')}
                            </h2>
                        </div>

                        {/* Content */}
                        <div
                            ref={branchListRef}
                            className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-6"
                            role="listbox"
                            aria-label={t('branch_list') || 'Branch list'}>
                            {isLoading || isFetching ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-24 w-full bg-gray-50 animate-pulse rounded-3xl"
                                    />
                                ))
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                                    <AlertCircle className="w-12 h-12 text-red-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            {t('error_loading_branches')}
                                        </p>
                                        <button
                                            onClick={() => refetch()}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-primary text-white text-sm font-medium hover:brightness-[0.95] transition-all">
                                            <RefreshCw size={16} />
                                            {t('retry')}
                                        </button>
                                    </div>
                                </div>
                            ) : branches.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <Building2 className="w-12 h-12 text-gray-300 mb-4" />
                                    <p className="text-sm text-gray-500">
                                        {t('no_branches_available')}
                                    </p>
                                </div>
                            ) : (
                                branches.map((branch, index) => (
                                    <div
                                        key={branch.id}
                                        data-branch-item
                                        tabIndex={0}
                                        onClick={() =>
                                            setTempSelectedBranch(branch)
                                        }
                                        onFocus={() => {
                                            setFocusedBranchIndex(index);
                                        }}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ' '
                                            ) {
                                                e.preventDefault();
                                                setTempSelectedBranch(branch);
                                            }
                                        }}
                                        className={cn(
                                            'group p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2',
                                            tempSelectedBranch?.id === branch.id
                                                ? 'border-theme-primary bg-linear-to-br from-theme-primary/10 to-theme-primary/5 shadow-xl shadow-theme-primary/10 z-10'
                                                : 'border-gray-50 bg-white hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100',
                                        )}
                                        role="option"
                                        aria-selected={
                                            tempSelectedBranch?.id === branch.id
                                        }>
                                        <div className="flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-5 flex-1 min-w-0">
                                                <div
                                                    className={cn(
                                                        'w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 overflow-hidden',
                                                        tempSelectedBranch?.id ===
                                                            branch.id
                                                            ? 'bg-theme-primary text-white scale-105 shadow-lg shadow-theme-primary/30'
                                                            : 'bg-gray-50 text-gray-400 group-hover:bg-theme-primary/10 group-hover:text-theme-primary',
                                                    )}>
                                                    <Building2
                                                        size={32}
                                                        className="transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-center min-w-0 flex-1">
                                                    <h4 className="font-bold text-gray-900 text-xl truncate mb-1.5 transition-colors duration-300 group-hover:text-theme-primary">
                                                        {branch.name}
                                                    </h4>
                                                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3">
                                                        <span
                                                            className={cn(
                                                                'text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm',
                                                                branch.is_open
                                                                    ? 'text-green-600 bg-green-50/80 backdrop-blur-sm'
                                                                    : 'text-gray-400 bg-gray-50',
                                                            )}>
                                                            {branch.is_open
                                                                ? t('open')
                                                                : t('closed')}
                                                        </span>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                                        <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                                                            {branch.services
                                                                ?.shipping_enabled
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
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <button
                                                    onClick={(e) =>
                                                        handleWorkingHoursClick(
                                                            e,
                                                            branch,
                                                        )
                                                    }
                                                    className="w-12 h-12 rounded-xl bg-gray-50/50 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:bg-theme-primary hover:text-white transition-all duration-300 active:scale-90 shadow-sm border border-gray-100/50"
                                                    title={t('working_hours')}>
                                                    <Clock size={22} />
                                                </button>
                                                <button
                                                    onClick={(e) =>
                                                        handleContactClick(
                                                            e,
                                                            branch.id,
                                                        )
                                                    }
                                                    className="w-12 h-12 rounded-xl bg-gray-50/50 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:bg-theme-primary hover:text-white transition-all duration-300 active:scale-90 shadow-sm border border-gray-100/50"
                                                    title={t('contact_branch')}>
                                                    <Headphones size={22} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="pt-6 border-t border-gray-100">
                            <button
                                onClick={handleConfirmSelection}
                                disabled={!tempSelectedBranch}
                                className={cn(
                                    'w-full py-5 rounded-4xl font-black text-xl shadow-xl transition-all duration-300',
                                    tempSelectedBranch
                                        ? 'bg-theme-primary text-white hover:brightness-[1.05] active:scale-[0.98] shadow-theme-primary/30'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                                )}>
                                {t('confirm')}
                            </button>
                        </div>
                    </div>

                    {/* Map Side */}
                    <div className="flex-1 h-1/2 md:h-auto relative p-6 bg-gray-50">
                        {branches.length > 0 ? (
                            <BranchMap
                                branches={branches}
                                selectedBranchId={selectedBranchForMap}
                                onBranchSelect={(branch) => {
                                    setTempSelectedBranch(branch);
                                    const index = branches.findIndex(
                                        (b) => b.id === branch.id,
                                    );
                                    if (index >= 0) {
                                        setFocusedBranchIndex(index);
                                    }
                                }}
                            />
                        ) : isLoading ? (
                            <div className="w-full h-full bg-gray-100 animate-pulse rounded-[2.5rem] flex items-center justify-center">
                                <div className="text-sm text-gray-400">
                                    Loading map...
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full bg-gray-100 animate-pulse rounded-[2.5rem] flex items-center justify-center">
                                <MapPin size={48} className="text-gray-200" />
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
