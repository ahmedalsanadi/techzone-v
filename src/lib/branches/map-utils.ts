/**
 * Map utility functions for branch locations
 * Handles coordinate calculations, map centering, and mock coordinates
 */

import type { Branch } from '@/types/branches';
import { DEFAULT_MAP_CENTER } from './constants';

/**
 * Generate mock coordinates for branches without real coordinates
 * Uses branch ID to generate consistent fake locations around Riyadh
 * TODO: Remove this when backend provides real coordinates for all branches
 * @param branchId - Branch ID
 * @param baseCenter - Base center coordinates (defaults to Riyadh)
 * @returns Mock coordinates [latitude, longitude]
 */
export function generateMockCoordinates(
    branchId: number,
    baseCenter: [number, number] = DEFAULT_MAP_CENTER,
): [number, number] {
    // Generate consistent offsets based on branch ID
    // Spread branches in a ~5km radius around base center
    const angle = (branchId * 137.508) % 360; // Golden angle for even distribution
    const radius = 0.02 + (branchId % 3) * 0.01; // 2-4km radius variation
    const radians = (angle * Math.PI) / 180;

    const latOffset = radius * Math.cos(radians);
    const lngOffset = radius * Math.sin(radians);

    return [baseCenter[0] + latOffset, baseCenter[1] + lngOffset];
}

/**
 * Get coordinates for a branch (real if available, mock if not)
 * @param branch - Branch object
 * @param useMockIfMissing - Whether to use mock coordinates if real ones are missing
 * @returns Coordinates [latitude, longitude] or null
 */
export function getBranchCoordinates(
    branch: Branch,
    useMockIfMissing: boolean = true,
): [number, number] | null {
    if (
        branch?.address?.latitude != null &&
        branch?.address?.longitude != null &&
        typeof branch.address.latitude === 'number' &&
        typeof branch.address.longitude === 'number' &&
        !isNaN(branch.address.latitude) &&
        !isNaN(branch.address.longitude)
    ) {
        // Use real coordinates
        return [branch.address.latitude, branch.address.longitude];
    }

    // Use mock coordinates if enabled
    if (useMockIfMissing && branch?.id) {
        return generateMockCoordinates(branch.id);
    }

    return null;
}

/**
 * Calculate the center point from an array of branches
 * Returns the average of all branch coordinates (real or mock)
 * @param branches - Array of branch objects
 * @param useMockIfMissing - Whether to use mock coordinates if real ones are missing
 * @returns Center coordinates [latitude, longitude]
 */
export function calculateBranchesCenter(
    branches: Branch[],
    useMockIfMissing: boolean = true,
): [number, number] {
    if (!branches || branches.length === 0) {
        return DEFAULT_MAP_CENTER;
    }

    // Get all valid coordinates (real or mock)
    const allCoords: [number, number][] = [];
    branches.forEach((branch) => {
        const coords = getBranchCoordinates(branch, useMockIfMissing);
        if (coords) {
            allCoords.push(coords);
        }
    });

    if (allCoords.length === 0) {
        return DEFAULT_MAP_CENTER;
    }

    const totalLat = allCoords.reduce((sum, [lat]) => sum + lat, 0);
    const totalLng = allCoords.reduce((sum, [, lng]) => sum + lng, 0);

    return [totalLat / allCoords.length, totalLng / allCoords.length];
}

/**
 * Get the center for a specific branch or calculate from all branches
 * Uses mock coordinates if real ones are missing
 * @param branches - Array of branch objects
 * @param selectedBranchId - Optional selected branch ID to center on
 * @param useMockIfMissing - Whether to use mock coordinates if real ones are missing
 * @returns Center coordinates [latitude, longitude]
 */
export function getMapCenter(
    branches: Branch[],
    selectedBranchId?: number,
    useMockIfMissing: boolean = true,
): [number, number] {
    if (selectedBranchId && branches && branches.length > 0) {
        const selectedBranch = branches.find(
            (b) => b && b.id === selectedBranchId,
        );
        if (selectedBranch) {
            const coords = getBranchCoordinates(
                selectedBranch,
                useMockIfMissing,
            );
            if (coords) {
                return coords;
            }
        }
    }

    return calculateBranchesCenter(branches, useMockIfMissing);
}
