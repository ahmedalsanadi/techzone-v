/**
 * Branch Selection Modal - Main component
 */

'use client';

import React, { useRef } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBranchSelection } from '@/hooks/branch';
import { BranchList } from './BranchList';
import { BranchMapContainer } from './BranchMapContainer';
import { cn } from '@/lib/utils';
import WorkingHoursModal from '../WorkingHoursModal';
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
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
                    <div className="flex min-h-full items-center justify-center p-4 md:p-8">
                        <DialogPanel
                            transition
                            className="bg-white w-full max-w-6xl h-full md:h-[80vh] rounded-3xl md:rounded-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative duration-500 ease-out data-closed:scale-95 data-closed:opacity-0">
                            {/* Branch list Side */}
                            <div className="w-full md:w-[450px] flex flex-col bg-white border-b md:border-b-0 md:border-r border-gray-100 p-5 md:p-8 shadow-2xl z-10 overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-4 md:mb-8">
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
                                        className="text-lg md:text-xl font-black text-gray-900">
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
                                <div className="pt-3.5 md:pt-6 border-t border-gray-100">
                                    <Button
                                        variant="primary"
                                        size="xl"
                                        onClick={handleConfirmSelection}
                                        disabled={!tempSelectedBranch}
                                        className={cn(
                                            'w-full py-3.5 md:py-5 rounded-2xl md:rounded-4xl font-black text-base md:text-xl shadow-xl transition-all duration-300 active:scale-[0.98]',
                                            !tempSelectedBranch &&
                                                'bg-gray-100 text-gray-400 cursor-not-allowed border-none shadow-none hover:brightness-100',
                                        )}>
                                        {t('confirm')}
                                    </Button>
                                </div>
                            </div>

                            {/* Map Side */}
                            <div className="flex-1 h-[300px] md:h-auto relative p-3 md:p-6 bg-gray-50">
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
        </>
    );
};

export default BranchSelectionModal;
