// src/components/modals/BranchModalInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useBranchStore } from '@/store/useBranchStore';

/**
 * BranchModalInitializer - Optimized to run only once on mount
 *
 * WHY this component exists:
 * - Separates modal trigger logic from layout (keeps layout clean)
 * - Only runs once on initial mount (not on every navigation)
 * - Uses ref to prevent unnecessary re-runs
 */
export default function BranchModalInitializer() {
    const { hasSelectedOnce, setModalOpen } = useBranchStore();
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Only run once on mount, not on every re-render
        if (hasInitialized.current) return;

        // Trigger modal on first visit if no branch has been selected before
        if (!hasSelectedOnce) {
            setModalOpen(true);
        }

        hasInitialized.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps - only run on mount

    return null;
}
