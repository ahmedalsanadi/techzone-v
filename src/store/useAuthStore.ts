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
    setAuth: (user: Customer, token: string) => void;
    setProfile: (profile: CustomerProfile) => void;
    logout: () => void;
    updateUser: (user: Partial<Customer>) => void;
    checkProfileComplete: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            profile: null,
            token: null,
            isAuthenticated: false,
            isProfileComplete: false,
            setAuth: (user, token) => {
                // Set cookies for server routing / middleware
                authCookies.setAccessToken(token);
                // Note: Customer from login doesn't have is_profile_complete
                // Profile completion will be set when profile is loaded
                set({ 
                    user, 
                    token, 
                    isAuthenticated: true,
                    isProfileComplete: false, // Will be updated when profile is loaded
                });
            },
            setProfile: (profile) => {
                // Update profile completion cookie
                authCookies.setProfileComplete(profile.is_profile_complete);
                set({ 
                    profile,
                    isProfileComplete: profile.is_profile_complete,
                    user: get().user ? {
                        ...get().user!,
                        // Note: Customer type doesn't have is_profile_complete,
                        // but we keep it in state for convenience
                    } : null,
                });
            },
            logout: () => {
                // Clear cookies
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
                // Check profile completion from profile data or state flag
                // Note: Customer type doesn't have is_profile_complete field
                return state.isProfileComplete || 
                       (state.profile?.is_profile_complete ?? false);
            },
        }),
        {
            name: 'fasto-auth-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
