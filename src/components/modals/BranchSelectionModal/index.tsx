/**
 * Branch Selection Modal - Main component
 */

'use client';

import React, { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBranchSelection } from '@/hooks/useBranchSelection';
import { useModalKeyboard } from '@/hooks/useModalKeyboard';
import { BranchList } from './BranchList';
import { BranchMapContainer } from './BranchMapContainer';
import WorkingHoursModal from '../WorkingHoursModal';

const BranchSelectionModal: React.FC = () => {
    const t = useTranslations('Branches');
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const branchListRef = useRef<HTMLDivElement>(null);

    const {
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
    } = useBranchSelection();

    useModalKeyboard({
        isOpen: isModalOpen,
        onClose: () => setModalOpen(false),
        itemCount: branches.length,
        focusedIndex: focusedBranchIndex,
        onFocusChange: setFocusedBranchIndex,
        listRef: branchListRef as React.RefObject<HTMLElement>,
        closeButtonRef: closeButtonRef as React.RefObject<HTMLButtonElement>,
    });

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
                                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2"
                                aria-label={t('close_modal') || 'Close modal'}>
                                <ChevronRight size={20} />
                            </button>
                            <h2
                                id="branch-modal-title"
                                className="text-xl font-black text-gray-900">
                                {t('select_branch')}
                            </h2>
                        </div>

                        {/* Branch List */}
                        <BranchList
                            branches={branches}
                            isLoading={isLoading}
                            isFetching={isFetching}
                            error={error}
                            hoveredBranchId={hoveredBranchId}
                            focusedBranchIndex={focusedBranchIndex}
                            onRetry={() => refetch()}
                            onBranchHover={setHoveredBranchId}
                            onBranchFocus={setFocusedBranchIndex}
                            onBranchSelect={handleBranchSelect}
                            onWorkingHoursClick={handleWorkingHoursClick}
                            onContactClick={handleContactClick}
                            listRef={branchListRef as React.RefObject<HTMLDivElement>}
                        />
                    </div>

                    {/* Map Side */}
                    <div className="flex-1 h-1/2 md:h-auto relative p-6">
                        <BranchMapContainer
                            branches={branches}
                            selectedBranchId={selectedBranchForMap}
                            isLoading={isLoading}
                            error={error}
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
                    </div>
                </div>
            </div>

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
