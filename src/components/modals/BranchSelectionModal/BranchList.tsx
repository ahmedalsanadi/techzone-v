/**
 * Branch list component with all states
 */

import React from 'react';
import type { Branch } from '@/types/branches';
import { BranchListItem } from './BranchListItem';
import { LoadingState, ErrorState, EmptyState } from './BranchListStates';
import { useTranslations } from 'next-intl';

interface BranchListProps {
    branches: Branch[];
    isLoading: boolean;
    isFetching: boolean;
    error: Error | null;
    tempSelectedBranchId: number | null;
    focusedBranchIndex: number;
    onRetry: () => void;
    onBranchFocus: (index: number) => void;
    onBranchSelect: (branch: Branch) => void;
    onWorkingHoursClick: (e: React.MouseEvent, branch: Branch) => void;
    onContactClick: (e: React.MouseEvent, branchId: number) => void;
    listRef: React.RefObject<HTMLDivElement>;
}

export const BranchList: React.FC<BranchListProps> = React.memo(
    ({
        branches,
        isLoading,
        isFetching,
        error,
        tempSelectedBranchId,
        focusedBranchIndex,
        onRetry,
        onBranchFocus,
        onBranchSelect,
        onWorkingHoursClick,
        onContactClick,
        listRef,
    }) => {
        const t = useTranslations('Branches');

        return (
            <div
                ref={listRef}
                className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 md:space-y-4"
                role="listbox"
                aria-label={t('branch_list') || 'Branch list'}>
                {isLoading || isFetching ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState error={error} onRetry={onRetry} />
                ) : branches.length === 0 ? (
                    <EmptyState />
                ) : (
                    branches.map((branch, index) => (
                        <BranchListItem
                            key={branch.id}
                            branch={branch}
                            isSelected={tempSelectedBranchId === branch.id}
                            onFocus={() => {
                                onBranchFocus(index);
                            }}
                            onClick={() => onBranchSelect(branch)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onBranchSelect(branch);
                                }
                            }}
                            onWorkingHoursClick={(e) =>
                                onWorkingHoursClick(e, branch)
                            }
                            onContactClick={(e) => onContactClick(e, branch.id)}
                        />
                    ))
                )}
            </div>
        );
    },
);

BranchList.displayName = 'BranchList';
