// src/store/useBranchStore.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Branch } from '@/types/branches';
import { BRANCH_STORAGE_VERSION, branchCookies } from '@/lib/branches';

interface BranchState {
    selectedBranch: Branch | null; // Full object in memory (not persisted)
    selectedBranchId: number | null; // Persisted
    selectedBranchName: string | null; // Persisted - for immediate display
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
    selectedBranchName: string | null; // Store name for immediate display
    hasSelectedOnce: boolean;
    version: number;
}

export const useBranchStore = create<BranchState>()(
    persist(
        (set, get) => ({
            selectedBranch: null,
            selectedBranchId: null,
            selectedBranchName: null,
            isModalOpen: false,
            hasSelectedOnce: false,
            setSelectedBranch: (branch) => {
                branchCookies.setBranchId(branch.id);
                set({
                    selectedBranch: branch,
                    selectedBranchId: branch.id,
                    selectedBranchName: branch.name || null,
                    isModalOpen: false,
                    hasSelectedOnce: true,
                });
            },
            setModalOpen: (open) => set({ isModalOpen: open }),
            clearSelectedBranch: () => {
                branchCookies.clearBranchId();
                set({
                    selectedBranch: null,
                    selectedBranchId: null,
                    selectedBranchName: null,
                    hasSelectedOnce: false,
                    isModalOpen: true,
                });
            },
            syncBranchData: (branch) => {
                // Sync the full branch object when fetched from API
                // This is called after fetching branch by ID from persisted state
                if (branch && branch.id === get().selectedBranchId) {
                    set({
                        selectedBranch: branch,
                        // Update name if it changed (e.g., branch was renamed)
                        selectedBranchName: branch.name || null,
                    });
                } else if (!branch) {
                    set({
                        selectedBranch: null,
                        selectedBranchName: null,
                    });
                }
            },
        }),
        {
            name: 'branch-storage',
            version: BRANCH_STORAGE_VERSION,
            storage: createJSONStorage(() => localStorage),
            partialize: (state): PersistedState => ({
                selectedBranchId: state.selectedBranchId,
                selectedBranchName: state.selectedBranchName,
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
                        selectedBranchName: null,
                        hasSelectedOnce: false,
                        version: BRANCH_STORAGE_VERSION,
                    };
                }
                // Type guard for persisted state
                const state = persistedState as Partial<PersistedState> & {
                    selectedBranch?: { id?: number; name?: string };
                };
                // Handle legacy format (if selectedBranch was persisted)
                if (state?.selectedBranch && !state?.selectedBranchId) {
                    return {
                        selectedBranchId: state.selectedBranch?.id || null,
                        selectedBranchName: state.selectedBranch?.name || null,
                        hasSelectedOnce: state.hasSelectedOnce || false,
                        version: BRANCH_STORAGE_VERSION,
                    };
                }
                // Return valid persisted state or defaults
                return {
                    selectedBranchId: state?.selectedBranchId ?? null,
                    selectedBranchName: state?.selectedBranchName ?? null,
                    hasSelectedOnce: state?.hasSelectedOnce ?? false,
                    version: BRANCH_STORAGE_VERSION,
                };
            },
        },
    ),
);
