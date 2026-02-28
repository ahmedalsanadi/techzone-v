'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '@/lib/validations';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'sonner';
import {
    useSendContactMessage,
    getContactErrorMessage,
    type ContactFormValues,
} from '@/hooks/contact';

const defaultValues: ContactFormValues = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    channel: 1,
};

export function ContactForm() {
    const t = useTranslations('Contact');
    const vt = useTranslations('Validation');
    const { mutateAsync: sendMessage, isPending } = useSendContactMessage();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema) as Resolver<ContactFormValues>,
        mode: 'onChange',
        defaultValues,
    });

    const onSubmit = async (data: ContactFormValues) => {
        try {
            await sendMessage({
                name: data.name,
                email: data.email?.trim() || undefined,
                phone: data.phone?.trim() || undefined,
                subject: data.subject,
                message: data.message,
                channel: data.channel ?? 1,
            });
            toast.success(t('form.success'));
            reset(defaultValues);
        } catch (error) {
            const message = getContactErrorMessage(
                error,
                t('form.error'),
            );
            toast.error(message);
        }
    };

    const emailError = errors.email?.message
        ? vt(errors.email.message as string)
        : undefined;
    const phoneError = errors.phone?.message
        ? vt(errors.phone.message as string)
        : undefined;

    const inputClass =
        'h-14 px-6 rounded-2xl bg-gray-50/50 border border-gray-100 focus-within:border-theme-primary-border focus-within:ring-4 focus-within:ring-theme-primary/5 shadow-none text-start';

    return (
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 h-full">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label
                            htmlFor="contact-name"
                            className="text-sm font-bold text-gray-700 block text-start">
                            {t('form.name')}
                        </label>
                        <Input
                            id="contact-name"
                            type="text"
                            placeholder={t('form.placeholder_name')}
                            autoComplete="name"
                            {...register('name')}
                            error={
                                errors.name?.message
                                    ? vt(errors.name.message as string)
                                    : undefined
                            }
                            containerClassName={inputClass}
                            className="text-start"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label
                            htmlFor="contact-email"
                            className="text-sm font-bold text-gray-700 block text-start">
                            {t('form.email')}
                        </label>
                        <Input
                            id="contact-email"
                            type="email"
                            placeholder={t('form.placeholder_email')}
                            autoComplete="email"
                            {...register('email')}
                            error={emailError}
                            containerClassName={inputClass}
                            className="text-start"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label
                            htmlFor="contact-phone"
                            className="text-sm font-bold text-gray-700 block text-start">
                            {t('form.phone')}
                        </label>
                        <Input
                            id="contact-phone"
                            type="tel"
                            placeholder={t('form.placeholder_phone')}
                            autoComplete="tel"
                            {...register('phone')}
                            error={phoneError}
                            containerClassName={inputClass}
                            className="text-start"
                        />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <label
                            htmlFor="contact-subject"
                            className="text-sm font-bold text-gray-700 block text-start">
                            {t('form.subject')}
                        </label>
                        <Input
                            id="contact-subject"
                            type="text"
                            placeholder={t('form.placeholder_subject')}
                            autoComplete="off"
                            {...register('subject')}
                            error={
                                errors.subject?.message
                                    ? vt(errors.subject.message as string)
                                    : undefined
                            }
                            containerClassName={inputClass}
                            className="text-start"
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label
                            htmlFor="contact-message"
                            className="text-sm font-bold text-gray-700 block text-start">
                            {t('form.message')}
                        </label>
                        <Textarea
                            id="contact-message"
                            rows={8}
                            autoComplete="off"
                            {...register('message')}
                            error={
                                errors.message?.message
                                    ? vt(errors.message.message as string)
                                    : undefined
                            }
                            placeholder={t('form.placeholder_message')}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isPending || !isValid}
                        className="px-14 active:scale-95"
                    >
                        {isPending ? (
                            <span className="inline-flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </span>
                        ) : (
                            t('form.send')
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
