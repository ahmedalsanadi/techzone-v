/**
 * Branch service for branch-related API calls
 * Handles fetching branches, branch details, and validation
 */

import { fetchLibero } from '@/lib/api';
import type { Branch } from '@/types/branches';
import { CACHE_STRATEGY, CACHE_TAGS } from '@/config/cache';

/**
 * Service for branch-related data fetching
 */
export const branchService = {
    /**
     * Get all branches with optional filters.
     * Validates branch structure and filters out invalid entries.
     *
     * @param params - Query parameters (type, search)
     * @returns Array of validated branches
     */
    getBranches: async (
        params: { type?: number; search?: string } = {},
    ): Promise<Branch[]> => {
        const data = await fetchLibero<Branch[]>('/store/branches', {
            params,
            next: {
                revalidate: CACHE_STRATEGY.STORE_CONFIG,
                tags: ['branches'],
            },
        });

        // Validate and filter branches
        if (!Array.isArray(data)) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('getBranches: Expected array, got:', typeof data);
            }
            return [];
        }

        return data.filter((branch) => {
            // Validate required fields
            const isValid =
                branch &&
                typeof branch === 'object' &&
                typeof branch.id === 'number' &&
                typeof branch.name === 'string' &&
                branch.address &&
                typeof branch.address === 'object' &&
                branch.working_hours &&
                typeof branch.working_hours === 'object';

            if (!isValid && process.env.NODE_ENV === 'development') {
                console.warn('getBranches: Invalid branch structure:', branch);
            }

            return isValid;
        });
    },

    /**
     * Get a single branch by ID.
     * Validates branch structure and throws error if invalid.
     *
     * @param id - Branch ID (string or number)
     * @returns Validated branch object
     * @throws Error if branch structure is invalid
     * @throws ApiError with status 404 if branch not found
     */
    getBranch: async (id: string | number): Promise<Branch> => {
        try {
            const branch = await fetchLibero<Branch>(`/store/branches/${id}`, {
                next: {
                    revalidate: CACHE_STRATEGY.STORE_CONFIG,
                    tags: ['branches'],
                },
            });

            // Validate branch structure
            if (
                !branch ||
                typeof branch !== 'object' ||
                typeof branch.id !== 'number' ||
                typeof branch.name !== 'string' ||
                !branch.address ||
                !branch.working_hours
            ) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn(
                        'getBranch: Invalid branch structure:',
                        branch,
                    );
                }
                throw new Error('Invalid branch data structure');
            }

            return branch;
        } catch (error) {
            // Re-throw ApiError as-is (includes 404 status)
            if (error instanceof Error && 'status' in error) {
                throw error;
            }
            // Wrap other errors
            throw error;
        }
    },
};
