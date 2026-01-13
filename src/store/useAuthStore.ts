//src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Customer } from '@/services/types';

interface AuthState {
    user: Customer | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: Customer, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<Customer>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user, token) => {
                // Set cookie for server routing / middleware
                if (typeof window !== 'undefined') {
                    document.cookie = `accessToken=${token}; path=/; max-age=${
                        60 * 60 * 24 * 7
                    }; SameSite=Lax`;
                }
                set({ user, token, isAuthenticated: true });
            },
            logout: () => {
                // Clear cookie
                if (typeof window !== 'undefined') {
                    document.cookie =
                        'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                }
                set({ user: null, token: null, isAuthenticated: false });
            },
            updateUser: (userData) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                }));
            },
        }),
        {
            name: 'fasto-auth-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
