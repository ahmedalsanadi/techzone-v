'use client';

import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    variant?: 'danger' | 'default';
    isLoading?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    title,
    message,
    confirmLabel,
    cancelLabel,
    variant = 'default',
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const handleCancel = () => {
        onCancel?.();
        onClose();
    };

    const handleConfirm = async () => {
        try {
            await onConfirm();
            onClose();
        } catch {
            // Leave modal open on error so user can retry or cancel
        }
    };

    if (!isOpen) return null;

    const isDanger = variant === 'danger';

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={handleCancel}
                aria-hidden="true"
            />
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title">
                <div
                    className="bg-white shadow-xl w-full max-w-md overflow-hidden rounded-xl sm:rounded-2xl max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 sm:p-5 md:p-6 shrink-0">
                        <h2
                            id="confirm-modal-title"
                            className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                            {title}
                        </h2>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <div className="flex gap-3 p-4 sm:p-5 md:p-6 pt-0 shrink-0">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex-1 min-h-[48px] px-4 py-3 rounded-lg sm:rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 touch-manipulation">
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={cn(
                                'flex-1 min-h-[48px] px-4 py-3 rounded-lg sm:rounded-xl font-bold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation',
                                isDanger
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-theme-primary hover:brightness-95',
                            )}>
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                confirmLabel
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
