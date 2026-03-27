/**
 * Branch Selection Modal - Main component
 */

'use client';

import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBranchSelection } from '@/hooks/branch';
import { BranchList } from './BranchList';
import { BranchMapContainer } from './BranchMapContainer';
import { cn } from '@/lib/utils';
import WorkingHoursModal from '../WorkingHoursModal';
import ConfirmModal from '../ConfirmModal';
import {
    Dialog,
    DialogPanel,
    DialogTitle,
} from '@headlessui/react';
import { Button } from '@/components/ui/Button';

const BranchSelectionModal: React.FC = () => {
    const t = useTranslations('Branches');
    const branchListRef = useRef<HTMLDivElement>(null);

    const {
        branches,
        isLoading,
        error,
        refetch,
        isFetching,
        tempSelectedBranch,
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
        selectedBranchId,
        hasSelectedOnce,
        isConfirmOpen,
        setConfirmOpen,
        isClearingCart,
        handleConfirmBranchChange,
    } = useBranchSelection();

    return (
        <>
            <Dialog
                open={isModalOpen}
                as="div"
                className="relative z-50 focus:outline-none"
                onClose={handleCloseModal}>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-500"
                    aria-hidden="true"
                />

                <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-8">
                        <DialogPanel
                            transition
                            className="bg-white w-full max-w-6xl h-[min(90svh,760px)] max-h-[90svh] md:h-[80vh] md:max-h-[80vh] rounded-3xl md:rounded-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative duration-500 ease-out data-closed:translate-y-2 md:data-closed:translate-y-0 data-closed:scale-[0.99] md:data-closed:scale-95 data-closed:opacity-0">
                            {/* Branch list Side - min-h-0 + overflow-y-auto on small screens so list scrolls and map stays visible */}
                            <div className="w-full md:w-[465px] flex flex-col min-h-0 flex-1 md:flex-initial bg-white border-b md:border-b-0 md:border-r border-gray-100 px-4 pt-4 pb-3 md:p-8 shadow-2xl z-10 overflow-y-auto md:overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-8">
                                    {(selectedBranchId || hasSelectedOnce) && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xl"
                                            onClick={handleCloseModal}
                                            className="rounded-2xl bg-gray-50"
                                            aria-label={
                                                t('close_modal') ||
                                                'Close modal'
                                            }>
                                            <X className="size-5" />
                                        </Button>
                                    )}
                                    <DialogTitle
                                        as="h2"
                                        className="text-base md:text-xl font-black text-gray-900">
                                        {t('select_branch')}
                                    </DialogTitle>
                                </div>

                                {/* Branch List */}
                                <BranchList
                                    branches={branches}
                                    isLoading={isLoading}
                                    isFetching={isFetching}
                                    error={error}
                                    tempSelectedBranchId={
                                        tempSelectedBranch?.id || null
                                    }
                                    focusedBranchIndex={focusedBranchIndex}
                                    onRetry={() => refetch()}
                                    onBranchFocus={setFocusedBranchIndex}
                                    onBranchSelect={handleBranchSelect}
                                    onWorkingHoursClick={
                                        handleWorkingHoursClick
                                    }
                                    onContactClick={handleContactClick}
                                    listRef={
                                        branchListRef as React.RefObject<HTMLDivElement>
                                    }
                                />

                                {/* Footer Action */}
                                <div className="pt-3 md:pt-6 border-t border-gray-100 bg-white">
                                    <Button
                                        variant="primary"
                                        size="xl"
                                        onClick={handleConfirmSelection}
                                        disabled={!tempSelectedBranch}
                                        className={cn(
                                            'w-full min-h-11 md:min-h-12 font-black text-sm md:text-xl shadow-xl transition-all duration-300 active:scale-[0.98]',
                                            !tempSelectedBranch &&
                                                'bg-gray-100 text-gray-400 cursor-not-allowed border-none shadow-none hover:brightness-100',
                                        )}>
                                        {t('confirm')}
                                    </Button>
                                </div>
                            </div>

                            {/* Map Side - fixed height on small screens so Leaflet always has dimensions; shrink-0 so map isn't pushed off-screen */}
                            <div className="shrink-0 w-full h-[42svh] min-h-[260px] max-h-[42svh] md:h-auto md:min-h-0 md:max-h-none md:flex-1 relative p-2.5 md:p-3 bg-gray-50 flex flex-col">
                                <div className="w-full h-full md:h-full md:min-h-[260px] min-w-0">
                                    <BranchMapContainer
                                        branches={branches}
                                        selectedBranchId={selectedBranchForMap}
                                        isLoading={isLoading}
                                        error={error}
                                        onBranchSelect={(branch) => {
                                            handleBranchSelect(branch);
                                            const index = branches.findIndex(
                                                (b) => b.id === branch.id,
                                            );
                                            if (index >= 0) {
                                                setFocusedBranchIndex(index);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            {/* Working Hours Sub-Modal */}
            {showWorkingHours && (
                <WorkingHoursModal
                    branch={showWorkingHours}
                    onClose={handleCloseWorkingHours}
                />
            )}
            {/* Branch Change Confirmation Sub-Modal */}
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmBranchChange}
                title={t('confirmBranchChangeTitle')}
                message={t('confirmBranchChangeMessage')}
                confirmLabel={t('confirm')}
                cancelLabel={t('cancel')}
                variant="danger"
                isLoading={isClearingCart}
            />
        </>
    );
};

export default BranchSelectionModal;
