//src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Customer, CustomerProfile } from '@/services/types';

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
                if (typeof window !== 'undefined') {
                    const maxAge = 60 * 60 * 24 * 7; // 7 days
                    const isComplete = user.is_profile_complete ?? false;
                    
                    document.cookie = `accessToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
                    document.cookie = `isProfileComplete=${isComplete}; path=/; max-age=${maxAge}; SameSite=Lax`;
                }
                set({ 
                    user, 
                    token, 
                    isAuthenticated: true,
                    isProfileComplete: user.is_profile_complete ?? false,
                });
            },
            setProfile: (profile) => {
                // Update profile completion cookie
                if (typeof window !== 'undefined') {
                    const maxAge = 60 * 60 * 24 * 7; // 7 days
                    const isComplete = profile.is_profile_complete ?? false;
                    document.cookie = `isProfileComplete=${isComplete}; path=/; max-age=${maxAge}; SameSite=Lax`;
                }
                set({ 
                    profile,
                    isProfileComplete: profile.is_profile_complete ?? false,
                    user: get().user ? {
                        ...get().user!,
                        is_profile_complete: profile.is_profile_complete,
                    } : null,
                });
            },
            logout: () => {
                // Clear cookies
                if (typeof window !== 'undefined') {
                    const expireDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
                    document.cookie = `accessToken=; path=/; expires=${expireDate}`;
                    document.cookie = `isProfileComplete=; path=/; expires=${expireDate}`;
                }
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
                return state.isProfileComplete || 
                       (state.profile?.is_profile_complete ?? false) ||
                       (state.user?.is_profile_complete ?? false);
            },
        }),
        {
            name: 'fasto-auth-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
