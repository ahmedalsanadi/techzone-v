import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

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

    const isDanger = variant === 'danger';

    return (
        <Dialog
            open={isOpen}
            as="div"
            className="relative z-50 focus:outline-none"
            onClose={handleCancel}>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                aria-hidden="true"
            />

            <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
                    <DialogPanel
                        transition
                        className="bg-white shadow-xl w-full max-w-md overflow-hidden rounded-xl sm:rounded-2xl max-h-[90vh] flex flex-col duration-300 ease-out data-closed:scale-95 data-closed:opacity-0">
                        <div className="p-4 sm:p-5 md:p-6 shrink-0">
                            <DialogTitle
                                as="h2"
                                className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                                {title}
                            </DialogTitle>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {message}
                            </p>
                        </div>
                        <div className="flex gap-3 p-4 sm:p-5 md:p-6 pt-0 shrink-0">
                            <Button
                                type="button"
                                variant="secondary"
                                size="xl"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="flex-1 text-gray-600">
                                {cancelLabel}
                            </Button>
                            <Button
                                type="button"
                                variant={isDanger ? 'destructive' : 'primary'}
                                size="xl"
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className="flex-1">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    confirmLabel
                                )}
                            </Button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}
