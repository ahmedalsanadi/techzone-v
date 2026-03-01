'use client';

import React, { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { complaintSchema } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/LabelField';
import { toast } from 'sonner';
import { useCreateComplaint } from '@/hooks/complaints';
import { getApiErrorMessage } from '@/lib/api';
import type { ComplaintCategory, ComplaintPriority } from '@/types/complaints';
import {
    isAcceptedComplaintAttachment,
    MAX_ATTACHMENTS,
    MAX_FILE_SIZE,
} from '@/services/complaint-services';
import type { ComplaintFormValues } from './types';
import { defaultComplaintFormValues } from './types';
import { SECTION_CARD_CLASS, COMPLAINT_INPUT_CONTAINER } from './constants';
import { ComplaintCategoryField } from './ComplaintCategoryField';
import { ComplaintPriorityField } from './ComplaintPriorityField';
import { ComplaintAttachmentsField } from './ComplaintAttachmentsField';

export interface ReportProblemFormProps {
    /** Order ID to link the complaint (complainable_type=order, complainable_id=orderId). */
    orderId: number;
}

export function ReportProblemForm({ orderId }: ReportProblemFormProps) {
    const t = useTranslations('ReportProblem');
    const vt = useTranslations('Validation');
    const { mutateAsync: createComplaint, isPending } = useCreateComplaint();
    const [attachments, setAttachments] = useState<File[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<ComplaintFormValues>({
        resolver: zodResolver(complaintSchema) as Resolver<ComplaintFormValues>,
        mode: 'all',
        defaultValues: defaultComplaintFormValues,
    });

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFileError(null);
            const files = e.target.files;
            if (!files?.length) return;

            const next: File[] = [];
            for (let i = 0; i < files.length && next.length < MAX_ATTACHMENTS; i++) {
                const file = files[i];
                if (file.size > MAX_FILE_SIZE) {
                    setFileError(t('fileTooLarge'));
                    continue;
                }
                if (!isAcceptedComplaintAttachment(file)) continue;
                next.push(file);
            }
            const totalAfter = next.length + attachments.length;
            if (totalAfter > MAX_ATTACHMENTS) {
                setFileError(t('maxFiles'));
            }
            setAttachments((prev) => [...prev, ...next].slice(0, MAX_ATTACHMENTS));
            e.target.value = '';
        },
        [t, attachments.length],
    );

    const removeFile = useCallback((index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
        setFileError(null);
    }, []);

    const onSubmit = async (data: ComplaintFormValues) => {
        if (attachments.length > MAX_ATTACHMENTS) {
            setFileError(t('maxFiles'));
            return;
        }
        try {
            await createComplaint({
                category: data.category as ComplaintCategory,
                priority: (data.priority ?? 2) as ComplaintPriority,
                subject: data.subject.trim(),
                description: data.description.trim(),
                complainable_type: 'order',
                complainable_id: orderId,
                attachments: attachments.length ? attachments : undefined,
            });
            toast.success(t('success'));
            reset(defaultComplaintFormValues);
            setAttachments([]);
            setFileError(null);
        } catch (error) {
            toast.error(getApiErrorMessage(error, t('error')));
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <ComplaintCategoryField control={control} errors={errors} t={t} vt={vt} />
            <ComplaintPriorityField control={control} t={t} />

            <div className={SECTION_CARD_CLASS}>
                <Label
                    htmlFor="complaint-subject"
                    className="text-base font-bold text-gray-900 block mb-4 text-start"
                >
                    {t('subjectLabel')}
                </Label>
                <Input
                    id="complaint-subject"
                    type="text"
                    placeholder={t('subjectPlaceholder')}
                    autoComplete="off"
                    {...register('subject')}
                    error={errors.subject?.message ? vt(errors.subject.message as string) : undefined}
                    containerClassName={COMPLAINT_INPUT_CONTAINER}
                    className="text-start"
                />
            </div>

            <div className={SECTION_CARD_CLASS}>
                <Label
                    htmlFor="complaint-description"
                    className="text-base font-bold text-gray-900 block mb-4 text-start"
                >
                    {t('problemDescription')}
                </Label>
                <Textarea
                    id="complaint-description"
                    rows={6}
                    placeholder={t('descriptionPlaceholder')}
                    autoComplete="off"
                    {...register('description')}
                    error={errors.description?.message ? vt(errors.description.message as string) : undefined}
                    className="text-start min-h-[120px]"
                />
            </div>

            <ComplaintAttachmentsField
                attachments={attachments}
                fileError={fileError}
                onFileChange={handleFileChange}
                onRemove={removeFile}
                t={t}
            />

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    variant="primary"
                    size="xl"
                    disabled={isPending || !isValid}
                    className="active:scale-95"
                >
                    {isPending ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        t('submit')
                    )}
                </Button>
            </div>
        </form>
    );
}
