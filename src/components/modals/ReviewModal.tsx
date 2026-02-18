'use client';

import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { Star, X, Loader2 } from 'lucide-react';
import React, { useState, Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    title?: string;
    isLoading?: boolean;
}

export default function ReviewModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    isLoading = false,
}: ReviewModalProps) {
    const t = useTranslations('Reviews');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;
        await onSubmit(rating, comment);
        // Reset state after success (usually handled by parent closing modal)
        if (!isLoading) {
            setRating(5);
            setComment('');
        }
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-[32px] bg-white p-6 text-start shadow-2xl transition-all border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <DialogTitle
                                        as="h3"
                                        className="text-xl font-black text-gray-900">
                                        {title ||
                                            t('addReview') ||
                                            'إضافة تقييم'}
                                    </DialogTitle>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                        <X
                                            size={20}
                                            className="text-gray-400"
                                        />
                                    </button>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6">
                                    {/* Star Rating */}
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    disabled={isLoading}
                                                    onClick={() =>
                                                        setRating(star)
                                                    }
                                                    onMouseEnter={() =>
                                                        setHover(star)
                                                    }
                                                    onMouseLeave={() =>
                                                        setHover(0)
                                                    }
                                                    className="p-1 transition-transform active:scale-95">
                                                    <Star
                                                        size={40}
                                                        className={cn(
                                                            'transition-colors duration-200',
                                                            star <=
                                                                (hover ||
                                                                    rating)
                                                                ? 'fill-amber-400 text-amber-400'
                                                                : 'text-gray-200 fill-gray-200',
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-sm font-bold text-theme-primary">
                                            {rating > 0
                                                ? t(`ratingLabels.${rating}`) ||
                                                  `${rating}/5`
                                                : t('selectRating')}
                                        </p>
                                    </div>

                                    {/* Comment Textarea */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 block px-1">
                                            {t('commentLabel') ||
                                                'رأيك يهمنا (اختياري)'}
                                        </label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) =>
                                                setComment(e.target.value)
                                            }
                                            placeholder={
                                                t('commentPlaceholder') ||
                                                'أضف تعليقك هنا...'
                                            }
                                            rows={4}
                                            disabled={isLoading}
                                            className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 text-sm focus:border-theme-primary focus:ring-theme-primary transition-all resize-none outline-none focus:bg-white border-2"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="lg"
                                            onClick={onClose}
                                            disabled={isLoading}
                                            className="flex-1">
                                            {t('cancel') || 'إلغاء'}
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            disabled={isLoading || rating === 0}
                                            className="flex-1">
                                            {isLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                t('submitReview') ||
                                                'إرسال التقييم'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
