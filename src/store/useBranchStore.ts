// src/store/useBranchStore.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Branch } from '@/services/types';
import { BRANCH_STORAGE_VERSION } from '@/config/branches';

interface BranchState {
    selectedBranch: Branch | null;
    selectedBranchId: number | null; // Persisted - only ID, not full object
    isModalOpen: boolean;
    hasSelectedOnce: boolean;
    setSelectedBranch: (branch: Branch) => void;
    setModalOpen: (open: boolean) => void;
    clearSelectedBranch: () => void;
    // Helper to sync branch object when fetched from API
    syncBranchData: (branch: Branch | null) => void;
}

interface PersistedState {
    selectedBranchId: number | null;
    hasSelectedOnce: boolean;
    version: number;
}

export const useBranchStore = create<BranchState>()(
    persist(
        (set, get) => ({
            selectedBranch: null,
            selectedBranchId: null,
            isModalOpen: false,
            hasSelectedOnce: false,
            setSelectedBranch: (branch) =>
                set({
                    selectedBranch: branch,
                    selectedBranchId: branch.id,
                    isModalOpen: false,
                    hasSelectedOnce: true,
                }),
            setModalOpen: (open) => set({ isModalOpen: open }),
            clearSelectedBranch: () =>
                set({
                    selectedBranch: null,
                    selectedBranchId: null,
                    hasSelectedOnce: false,
                    isModalOpen: true,
                }),
            syncBranchData: (branch) => {
                // Sync the full branch object when fetched from API
                // This is called after fetching branch by ID from persisted state
                if (branch && branch.id === get().selectedBranchId) {
                    set({ selectedBranch: branch });
                } else if (!branch) {
                    set({ selectedBranch: null });
                }
            },
        }),
        {
            name: 'branch-storage',
            version: BRANCH_STORAGE_VERSION,
            storage: createJSONStorage(() => localStorage),
            partialize: (state): PersistedState => ({
                selectedBranchId: state.selectedBranchId,
                hasSelectedOnce: state.hasSelectedOnce,
                version: BRANCH_STORAGE_VERSION,
            }),
            // Migration: if version mismatch or structure changed, reset
            migrate: (
                persistedState: unknown,
                version: number,
            ): PersistedState => {
                if (version !== BRANCH_STORAGE_VERSION) {
                    // Version mismatch - reset to defaults
                    return {
                        selectedBranchId: null,
                        hasSelectedOnce: false,
                        version: BRANCH_STORAGE_VERSION,
                    };
                }
                // Type guard for persisted state
                const state = persistedState as Partial<PersistedState> & {
                    selectedBranch?: { id?: number };
                };
                // Handle legacy format (if selectedBranch was persisted)
                if (state?.selectedBranch && !state?.selectedBranchId) {
                    return {
                        selectedBranchId: state.selectedBranch?.id || null,
                        hasSelectedOnce: state.hasSelectedOnce || false,
                        version: BRANCH_STORAGE_VERSION,
                    };
                }
                // Return valid persisted state or defaults
                return {
                    selectedBranchId: state?.selectedBranchId ?? null,
                    hasSelectedOnce: state?.hasSelectedOnce ?? false,
                    version: BRANCH_STORAGE_VERSION,
                };
            },
        },
    ),
);
