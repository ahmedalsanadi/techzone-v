//src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Customer, CustomerProfile } from '@/types/auth';
import { authCookies } from '@/lib/auth';

interface AuthState {
    user: Customer | null;
    profile: CustomerProfile | null;
    token: string | null;
    isAuthenticated: boolean;
    isProfileComplete: boolean;
    tenantHost: string;
    setAuth: (user: Customer, token: string) => void;
    setProfile: (profile: CustomerProfile) => void;
    logout: () => void;
    updateUser: (user: Partial<Customer>) => void;
    checkProfileComplete: () => boolean;
}

/**
 * Get current host for tenant-aware storage keys
 */
export function getCurrentTenantHostForStorage(): string {
    if (typeof window === 'undefined') return 'server';
    return window.location.host || 'unknown-tenant';
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            profile: null,
            token: null,
            isAuthenticated: false,
            isProfileComplete: false,
            tenantHost: getCurrentTenantHostForStorage(),
            setAuth: (user, token) => {
                // Set cookies for server routing / middleware
                authCookies.setAccessToken(token);
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isProfileComplete: false,
                    tenantHost: getCurrentTenantHostForStorage(),
                });
            },
            setProfile: (profile) => {
                authCookies.setProfileComplete(profile.is_profile_complete);

                const currentUser = get().user;
                const updatedUser: Customer = currentUser
                    ? {
                          ...currentUser,
                          name: profile.full_name,
                          email: profile.email,
                          phone: profile.phone,
                      }
                    : {
                          id: profile.id,
                          name: profile.full_name,
                          email: profile.email,
                          phone: profile.phone,
                      };

                set({
                    profile,
                    isProfileComplete: profile.is_profile_complete,
                    user: updatedUser,
                });
            },
            logout: () => {
                authCookies.clearAll();
                set({
                    user: null,
                    profile: null,
                    token: null,
                    isAuthenticated: false,
                    isProfileComplete: false,
                });
            },
            updateUser: (userData) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                }));
            },
            checkProfileComplete: () => {
                const state = get();
                return (
                    state.isProfileComplete ||
                    (state.profile?.is_profile_complete ?? false)
                );
            },
        }),
        {
            name: 'fasto-auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                profile: state.profile,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                isProfileComplete: state.isProfileComplete,
                tenantHost: state.tenantHost,
            }),
            skipHydration: true,
            merge: (persisted, current) => {
                const p =
                    (persisted as Partial<
                        Pick<
                            AuthState,
                            | 'user'
                            | 'profile'
                            | 'token'
                            | 'isAuthenticated'
                            | 'isProfileComplete'
                            | 'tenantHost'
                        >
                    >) ?? null;
                if (!p) return current;

                const currentHost = getCurrentTenantHostForStorage();
                const isSameHost = p.tenantHost === currentHost;

                // If different host, clear sensitive auth data
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
        },
    ),
);
