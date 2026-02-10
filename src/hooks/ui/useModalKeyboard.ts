/**
 * Custom hook for modal keyboard navigation and focus management
 */

import { useEffect, useRef } from 'react';

interface UseModalKeyboardOptions {
    isOpen: boolean;
    onClose: () => void;
    itemCount: number;
    focusedIndex: number;
    onFocusChange: (index: number) => void;
    listRef: React.RefObject<HTMLElement>;
    closeButtonRef: React.RefObject<HTMLButtonElement>;
}

export function useModalKeyboard({
    isOpen,
    onClose,
    itemCount,
    focusedIndex,
    onFocusChange,
    listRef,
    closeButtonRef,
}: UseModalKeyboardOptions) {
    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Close on Escape
            if (e.key === 'Escape') {
                onClose();
                return;
            }

            // Arrow key navigation
            if (
                (e.key === 'ArrowDown' || e.key === 'ArrowUp') &&
                listRef.current
            ) {
                e.preventDefault();
                const items = listRef.current.querySelectorAll('[data-branch-item]');
                if (items.length === 0) return;

                let newIndex = focusedIndex;
                if (e.key === 'ArrowDown') {
                    newIndex = Math.min(focusedIndex + 1, items.length - 1);
                } else {
                    newIndex = Math.max(focusedIndex - 1, 0);
                }

                onFocusChange(newIndex);
                (items[newIndex] as HTMLElement)?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        closeButtonRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, focusedIndex, onClose, onFocusChange, listRef, closeButtonRef]);

    // Ensure focused index is valid when items change
    useEffect(() => {
        if (itemCount > 0 && focusedIndex >= itemCount) {
            const timer = setTimeout(() => {
                onFocusChange(0);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [itemCount, focusedIndex, onFocusChange]);
}
