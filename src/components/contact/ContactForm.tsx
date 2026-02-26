'use client';
/**
 * Contact form component
 */

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '@/lib/validations';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'sonner';

export const ContactForm: React.FC = () => {
    const t = useTranslations('Contact');
    const vt = useTranslations('Validation');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm({
        resolver: zodResolver(contactSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            subject: '',
            message: '',
        },
    });

    const onSubmit = async (data: any) => {
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log('Contact form submitted:', data);
            toast.success(t('form.success') || 'Message sent successfully!');
            reset();
        } catch (error) {
            toast.error(t('form.error') || 'Failed to send message.');
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 h-full">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block text-start">
                            {t('form.email')}
                        </label>
                        <Input
                            type="email"
                            placeholder={t('form.placeholder_email')}
                            {...register('email')}
                            error={
                                errors.email?.message
                                    ? vt(errors.email.message as any)
                                    : undefined
                            }
                            containerClassName="h-14 px-6 rounded-2xl bg-gray-50/50 border border-gray-100 focus-within:border-theme-primary-border focus-within:ring-4 focus-within:ring-theme-primary/5 shadow-none"
                            className="text-start"
                        />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block text-start">
                            {t('form.subject')}
                        </label>
                        <Input
                            type="text"
                            placeholder={t('form.placeholder_subject')}
                            {...register('subject')}
                            error={
                                errors.subject?.message
                                    ? vt(errors.subject.message as any)
                                    : undefined
                            }
                            containerClassName="h-14 px-6 rounded-2xl bg-gray-50/50 border border-gray-100 focus-within:border-theme-primary-border focus-within:ring-4 focus-within:ring-theme-primary/5 shadow-none"
                            className="text-start"
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block text-start">
                            {t('form.message')}
                        </label>
                        <Textarea
                            rows={8}
                            {...register('message')}
                            error={
                                errors.message?.message
                                    ? vt(errors.message.message as any)
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
                        disabled={isSubmitting || !isValid}
                        className="px-14 active:scale-95">
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            t('form.send')
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};
