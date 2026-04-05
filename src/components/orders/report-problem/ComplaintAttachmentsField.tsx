'use client';

import React, { memo, type ChangeEvent } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { Label } from '@/components/ui/LabelField';
import { COMPLAINT_ACCEPT_ATTRIBUTE } from '@/constants/complaints';
import { SECTION_CARD_CLASS } from './section-styles';

export interface ComplaintAttachmentsFieldProps {
    attachments: File[];
    fileError: string | null;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: number) => void;
    t: (key: string) => string;
}

function ComplaintAttachmentsFieldComponent({
    attachments,
    fileError,
    onFileChange,
    onRemove,
    t,
}: ComplaintAttachmentsFieldProps) {
    return (
        <div className={SECTION_CARD_CLASS}>
            <Label className="text-base font-bold text-gray-900 block mb-4 text-start">
                {t('addImages')}
            </Label>
            <div className="space-y-3">
                <label
                    htmlFor="complaint-attachments"
                    className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30 py-10 px-6 hover:border-theme-primary/30 transition-all cursor-pointer group"
                >
                    <input
                        id="complaint-attachments"
                        name="attachments"
                        type="file"
                        multiple
                        accept={COMPLAINT_ACCEPT_ATTRIBUTE}
                        className="sr-only w-0 h-0 overflow-hidden opacity-0 absolute"
                        onChange={onFileChange}
                        aria-label={t('addImages')}
                    />
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform pointer-events-none">
                        <ImageIcon className="w-7 h-7 text-gray-400 group-hover:text-theme-primary transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 text-center pointer-events-none">
                        {t('uploadDesc')}
                    </p>
                </label>
                {attachments.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                        {attachments.map((file, i) => (
                            <li
                                key={`${file.name}-${i}`}
                                className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-700"
                            >
                                <span className="truncate max-w-[140px]">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => onRemove(i)}
                                    className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-colors"
                                    aria-label={t('removeFile')}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {fileError && (
                    <p className="text-xs text-red-500 font-medium px-1" role="alert">
                        {fileError}
                    </p>
                )}
            </div>
        </div>
    );
}

/**
 * File upload + list. Memoized: no Controller, only attachments/fileError/callbacks.
 * Callbacks are useCallback-stable; re-renders only when attachments or fileError change.
 */
export const ComplaintAttachmentsField = memo(ComplaintAttachmentsFieldComponent);
