/**
 * Branch-related constants and types
 */

/**
 * Branch types as defined by the API
 * @see API endpoint: GET /store/branches?type={type}
 */
export const BRANCH_TYPES = {
    /** Regular branch (not warehouse/kitchen) */
    BRANCH: 1,
    /** Warehouse */
    WAREHOUSE: 2,
    /** Kitchen */
    KITCHEN: 3,
} as const;

export type BranchType = (typeof BRANCH_TYPES)[keyof typeof BRANCH_TYPES];

/**
 * Branch status values
 */
export const BRANCH_STATUS = {
    /** Branch is active */
    ACTIVE: 1,
    /** Branch is inactive */
    INACTIVE: 0,
} as const;

export type BranchStatus = (typeof BRANCH_STATUS)[keyof typeof BRANCH_STATUS];

/**
 * Default map center coordinates (Riyadh, Saudi Arabia)
 * This will be overridden by actual branch locations or store config
 */
export const DEFAULT_MAP_CENTER: [number, number] = [24.7136, 46.6753];

/**
 * Default map zoom level
 */
export const DEFAULT_MAP_ZOOM = 13;

/**
 * Zustand persist storage version
 * Increment this when Branch type structure changes to invalidate old persisted data
 */
export const BRANCH_STORAGE_VERSION = 1;
