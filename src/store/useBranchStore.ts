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
    tenantHost: string;
    setSelectedBranch: (branch: Branch) => void;
    setModalOpen: (open: boolean) => void;
    clearSelectedBranch: () => void;
    // Helper to sync branch object when fetched from API
    syncBranchData: (branch: Branch | null) => void;
    // Hydration status
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

interface PersistedState {
    selectedBranchId: number | null;
    selectedBranchName: string | null; // Store name for immediate display
    hasSelectedOnce: boolean;
    version: number;
    tenantHost: string;
}

/**
 * Get current host for tenant-aware storage keys
 */
export function getCurrentTenantHostForStorage(): string {
    if (typeof window === 'undefined') return 'server';
    return window.location.host || 'unknown-tenant';
}

export const useBranchStore = create<BranchState>()(
    persist(
        (set, get) => ({
            selectedBranch: null,
            selectedBranchId: null,
            selectedBranchName: null,
            isModalOpen: false,
            hasSelectedOnce: false,
            _hasHydrated: false,
            tenantHost: getCurrentTenantHostForStorage(),
            setSelectedBranch: (branch) => {
                branchCookies.setBranchId(branch.id);
                set({
                    selectedBranch: branch,
                    selectedBranchId: branch.id,
                    selectedBranchName: branch.name || null,
                    isModalOpen: false,
                    hasSelectedOnce: true,
                    tenantHost: getCurrentTenantHostForStorage(),
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
                if (branch && branch.id === get().selectedBranchId) {
                    set({
                        selectedBranch: branch,
                        selectedBranchName: branch.name || null,
                    });
                } else if (!branch) {
                    set({
                        selectedBranch: null,
                        selectedBranchName: null,
                    });
                }
            },
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'branch-storage',
            version: BRANCH_STORAGE_VERSION,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                selectedBranchId: state.selectedBranchId,
                selectedBranchName: state.selectedBranchName,
                hasSelectedOnce: state.hasSelectedOnce,
                version: BRANCH_STORAGE_VERSION,
                tenantHost: state.tenantHost,
            }),
            merge: (persisted, current) => {
                const p = (persisted as Partial<PersistedState>) ?? null;
                if (!p) return current;

                const currentHost = getCurrentTenantHostForStorage();
                const isSameHost = p.tenantHost === currentHost;

                if (!isSameHost) {
                    return {
                        ...current,
                        tenantHost: currentHost,
                    };
                }

                return {
                    ...current,
                    ...p,
                    tenantHost: currentHost,
                };
            },
            migrate: (
                persistedState: unknown,
                version: number,
            ): PersistedState => {
                if (version !== BRANCH_STORAGE_VERSION) {
                    return {
                        selectedBranchId: null,
                        selectedBranchName: null,
                        hasSelectedOnce: false,
                        version: BRANCH_STORAGE_VERSION,
                        tenantHost: getCurrentTenantHostForStorage(),
                    };
                }
                const state = persistedState as Partial<
                    PersistedState & { selectedBranch?: Branch | null }
                >;
                if (state?.selectedBranch && !state?.selectedBranchId) {
                    return {
                        selectedBranchId: state.selectedBranch?.id || null,
                        selectedBranchName: state.selectedBranch?.name || null,
                        hasSelectedOnce: state.hasSelectedOnce || false,
                        version: BRANCH_STORAGE_VERSION,
                        tenantHost: getCurrentTenantHostForStorage(),
                    };
                }
                return {
                    selectedBranchId: state.selectedBranchId ?? null,
                    selectedBranchName: state.selectedBranchName ?? null,
                    hasSelectedOnce: state.hasSelectedOnce ?? false,
                    version: BRANCH_STORAGE_VERSION,
                    tenantHost:
                        state.tenantHost ?? getCurrentTenantHostForStorage(),
                };
            },
            onRehydrateStorage: (state) => {
                return () => state?.setHasHydrated(true);
            },
        },
    ),
);
