import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportProblemSchema } from '@/lib/validations';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'sonner';

export const ReportProblemForm: React.FC = () => {
    const t = useTranslations('ReportProblem');
    const vt = useTranslations('Validation');

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isValid, isSubmitting },
    } = useForm({
        resolver: zodResolver(reportProblemSchema),
        mode: 'onChange',
        defaultValues: {
            problem_type: '',
            description: '',
        },
    });

    const currentType = watch('problem_type');

    const problemTypes = [
        { id: 'type1', label: t('types.type1') },
        { id: 'type2', label: t('types.type2') },
        { id: 'type3', label: t('types.type3') },
        { id: 'type4', label: t('types.type4') },
        { id: 'type5', label: t('types.type5') },
    ];

    const onSubmit = async (data: any) => {
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log('Report Problem submitted:', data);
            toast.success(t('success') || 'Problem reported successfully!');
            reset();
        } catch (error) {
            toast.error(t('error') || 'Failed to report problem.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Box 1: Select Type */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <label className="text-base font-bold text-gray-900 block mb-6 text-start">
                    {t('problemType')}
                </label>
                <div className="space-y-0 divide-y divide-gray-50">
                    {problemTypes.map((type) => (
                        <label
                            key={type.id}
                            className="flex items-center justify-between py-4 cursor-pointer group transition-colors">
                            <span className="text-gray-600 font-medium group-hover:text-theme-primary transition-colors">
                                {type.label}
                            </span>
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="radio"
                                    value={type.id}
                                    checked={currentType === type.id}
                                    onChange={(e) =>
                                        setValue(
                                            'problem_type',
                                            e.target.value,
                                            { shouldValidate: true },
                                        )
                                    }
                                    className="peer appearance-none w-6 h-6 rounded-full border-2 border-gray-200 checked:border-theme-primary transition-all cursor-pointer"
                                />
                                <div className="absolute w-3 h-3 rounded-full bg-theme-primary scale-0 peer-checked:scale-100 transition-transform" />
                            </div>
                        </label>
                    ))}
                </div>
                {errors.problem_type && (
                    <p className="text-xs text-red-500 font-medium mt-2 text-start px-1">
                        {errors.problem_type.message
                            ? vt(errors.problem_type.message as any)
                            : undefined}
                    </p>
                )}
            </div>

            {/* Box 2: Description */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <label className="text-base font-bold text-gray-900 block mb-6 text-start">
                    {t('problemDescription')}
                </label>
                <Textarea
                    rows={6}
                    placeholder={t('problemDescription')}
                    {...register('description')}
                    error={
                        errors.description?.message
                            ? vt(errors.description.message as any)
                            : undefined
                    }
                />
            </div>

            {/* Box 3: Image Upload */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <label className="text-base font-bold text-gray-900 block mb-6 text-start">
                    {t('addImages')}
                </label>
                <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30 py-12 px-6 hover:border-theme-primary/30 transition-all cursor-pointer">
                    <input
                        type="file"
                        multiple
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-theme-primary transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                        {t('uploadDesc')}
                    </p>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    variant="primary"
                    size="xl"
                    disabled={isSubmitting || !isValid}
                    className="active:scale-95">
                    {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        t('submit')
                    )}
                </Button>
            </div>
        </form>
    );
};
