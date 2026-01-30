/**
 * Constants for address management.
 */

/**
 * Fixed ID for the single guest address to ensure stable logic.
 * Using a constant instead of Date.now() prevents ID drift during a single session.
 */
export const GUEST_ADDRESS_ID = 999999;

/**
 * Default map focus point (Riyadh, SA).
 */
export const DEFAULT_COORDINATES: [number, number] = [24.7136, 46.6753];
