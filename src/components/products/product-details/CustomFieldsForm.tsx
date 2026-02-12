'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ProductCustomField } from '@/types/store';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/SelectField';

interface CustomFieldsFormProps {
    customFields: ProductCustomField[];
    values: Record<string, any>;
    onChange: (name: string, value: any) => void;
}

export default function CustomFieldsForm({
    customFields,
    values,
    onChange,
}: CustomFieldsFormProps) {
    const t = useTranslations('Product');

    if (!customFields || customFields.length === 0) return null;

    const renderField = (field: ProductCustomField) => {
        const fieldValue = values[field.name] || '';
        const isRequired = field.is_required;

        const isEmptyForRequired = (value: any) => {
            // boolean required means it must be checked/true
            if (field.input_type === 'boolean') return !value;
            // checkbox groups: required means at least one selected
            if (Array.isArray(value)) return value.length === 0;
            // number 0 is valid; empty string/null/undefined are not
            return value === '' || value === null || value === undefined;
        };

        const hasError = isRequired && isEmptyForRequired(fieldValue);

        const label = (
            <span className="text-md font-bold text-gray-700">
                {field.label}
                {isRequired && <span className="text-red-500 ms-1">*</span>}
            </span>
        );

        const description = field.description ? (
            <p className="text-xs text-gray-500 mt-1">{field.description}</p>
        ) : null;

        const inputContainerClassName = cn(
            'h-12 rounded-lg bg-gray-50 border-gray-100 px-4',
            'focus-within:border-theme-primary-border focus-within:ring-4 focus-within:ring-theme-primary/5',
            hasError && 'border-red-300 focus-within:border-red-400 focus-within:ring-red-500/10',
        );

        const inputTextClassName =
            'font-semibold text-base text-gray-800 placeholder:text-gray-400';

        switch (field.input_type) {
            case 'boolean':
                return (
                    <label className="flex items-center gap-3 py-3 cursor-pointer group hover:bg-gray-50/50 -mx-2 px-2 rounded-xl transition-colors">
                        <input
                            type="checkbox"
                            checked={!!fieldValue}
                            onChange={(e) => onChange(field.name, e.target.checked)}
                            className="w-5 h-5 rounded-md border-2 border-gray-200 text-theme-primary focus:ring-theme-primary"
                        />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-md font-bold text-gray-700">
                                {field.label}
                                {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </span>
                            {field.description && (
                                <p className="text-xs text-gray-500">{field.description}</p>
                            )}
                        </div>
                    </label>
                );

            case 'number':
                return (
                    <div className="py-3">
                        <label className="block mb-2">
                            {label}
                            {description}
                        </label>
                        <Input
                            type="number"
                            value={fieldValue}
                            onChange={(e) =>
                                onChange(
                                    field.name,
                                    e.target.value ? Number(e.target.value) : '',
                                )
                            }
                            min={0}
                            max={field.max_limit || undefined}
                            variant="filled"
                            inputSize="lg"
                            containerClassName={inputContainerClassName}
                            className={inputTextClassName}
                        />
                    </div>
                );

            case 'text':
                return (
                    <div className="py-3">
                        <label className="block mb-2 text-sm md:text-base">
                            {label}
                            {description}
                        </label>
                        <Input
                            type="text"
                            value={fieldValue}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            maxLength={field.max_limit || undefined}
                            variant="filled"
                            inputSize="lg"
                            containerClassName={inputContainerClassName}
                            className={inputTextClassName}
                        />
                    </div>
                );

            case 'textarea':
                return (
                    <div className="py-3">
                        <label className="block mb-2 text-sm md:text-base">
                            {label}
                            {description}
                        </label>
                        <div
                            className={cn(
                                'group flex items-start gap-2 overflow-hidden px-4 transition-all duration-200 border border-solid outline-none',
                                'h-auto rounded-xl bg-gray-50 border-gray-100',
                                'focus-within:border-theme-primary-border focus-within:ring-4 focus-within:ring-theme-primary/5',
                                hasError &&
                                    'border-red-300 focus-within:border-red-400 focus-within:ring-red-500/10',
                            )}>
                            <textarea
                                value={fieldValue}
                                onChange={(e) =>
                                    onChange(field.name, e.target.value)
                                }
                                maxLength={field.max_limit || undefined}
                                rows={3}
                                className={cn(
                                    'w-full bg-transparent py-3 text-base text-gray-800 outline-none resize-none',
                                    'placeholder:text-gray-400 font-semibold',
                                )}
                            />
                        </div>
                    </div>
                );

            case 'select':
            case 'radio':
                if (!field.options) return null;
                return (
                    <div className="py-3">
                        <label className="block mb-2 text-sm md:text-base">
                            {label}
                            {description}
                        </label>
                        {field.input_type === 'select' ? (
                            <Select
                                value={fieldValue}
                                onValueChange={(v) => onChange(field.name, v)}
                                className="w-full">
                                <SelectTrigger
                                    className={cn(
                                        'h-12 rounded-xl bg-gray-50 border-gray-100 px-4',
                                        'focus-visible:border-theme-primary-border focus-visible:ring-4 focus-visible:ring-theme-primary/5',
                                        hasError &&
                                            'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-500/10',
                                    )}>
                                    <SelectValue
                                        placeholder={t('select') || 'Select...'}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__placeholder__" disabled>
                                        {t('select') || 'Select...'}
                                    </SelectItem>
                                    {Object.entries(field.options).map(
                                        ([value, optionLabel]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}>
                                                {optionLabel}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="space-y-2">
                                {Object.entries(field.options).map(([value, label]) => (
                                    <label
                                        key={value}
                                        className="flex items-center gap-3 py-2 cursor-pointer group hover:bg-gray-50/50 -mx-2 px-2 rounded-xl transition-colors">
                                        <input
                                            type="radio"
                                            name={field.name}
                                            value={value}
                                            checked={fieldValue === value}
                                            onChange={(e) => onChange(field.name, e.target.value)}
                                            className="w-5 h-5 rounded-full border-2 border-gray-200 text-theme-primary focus:ring-theme-primary"
                                        />
                                        <span className="text-md font-bold text-gray-700">{label}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'checkbox':
                if (!field.options) return null;
                return (
                    <div className="py-3">
                        <label className="block mb-2 text-sm md:text-base">
                            {label}
                            {description}
                        </label>
                        <div className="space-y-2">
                            {Object.entries(field.options).map(([value, label]) => {
                                const checkedValues = Array.isArray(fieldValue) ? fieldValue : [];
                                const isChecked = checkedValues.includes(value);
                                return (
                                    <label
                                        key={value}
                                        className="flex items-center gap-3 py-2 cursor-pointer group hover:bg-gray-50/50 -mx-2 px-2 rounded-xl transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => {
                                                const newValues = e.target.checked
                                                    ? [...checkedValues, value]
                                                    : checkedValues.filter((v) => v !== value);
                                                onChange(field.name, newValues);
                                            }}
                                            className="w-5 h-5 rounded-md border-2 border-gray-200 text-theme-primary focus:ring-theme-primary"
                                        />
                                        <span className="text-md font-bold text-gray-700">{label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'date':
                return (
                    <div className="py-3">
                        <label className="block mb-2 text-sm md:text-base">
                            {label}
                            {description}
                        </label>
                        <Input
                            type="date"
                            value={fieldValue}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            variant="filled"
                            inputSize="lg"
                            containerClassName={inputContainerClassName}
                            className={cn(inputTextClassName, 'scheme-light')}
                        />
                    </div>
                );

            case 'time':
                return (
                    <div className="py-3">
                        <label className="block mb-2 text-sm md:text-base">
                            {label}
                            {description}
                        </label>
                        <Input
                            type="time"
                            value={fieldValue}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            variant="filled"
                            inputSize="lg"
                            containerClassName={inputContainerClassName}
                            className={cn(inputTextClassName, 'scheme-light')}
                        />
                    </div>
                );

            case 'datetime':
                return (
                    <div className="py-3">
                        <label className="block mb-2 text-sm md:text-base">
                            {label}
                            {description}
                        </label>
                        <Input
                            type="datetime-local"
                            value={fieldValue}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            variant="filled"
                            inputSize="lg"
                            containerClassName={inputContainerClassName}
                            className={cn(inputTextClassName, 'scheme-light')}
                        />
                    </div>
                );

            case 'file':
            case 'image':
                return (
                    <div className="py-3">
                        <label className="block mb-2 text-sm md:text-base">
                            {label}
                            {description}
                        </label>
                        <div
                            className={cn(
                                'group flex items-center gap-2 overflow-hidden px-4 transition-all duration-200 border border-solid outline-none',
                                'h-12 rounded-xl bg-gray-50 border-gray-100',
                                'focus-within:border-theme-primary-border focus-within:ring-4 focus-within:ring-theme-primary/5',
                                hasError &&
                                    'border-red-300 focus-within:border-red-400 focus-within:ring-red-500/10',
                            )}>
                            <input
                                type="file"
                                accept={
                                    field.input_type === 'image'
                                        ? 'image/*'
                                        : undefined
                                }
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        // Keep behavior: store filename for now
                                        onChange(field.name, file.name);
                                    }
                                }}
                                className={cn(
                                    'w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-theme-primary/10 file:px-4 file:py-2 file:font-semibold file:text-theme-primary',
                                    'cursor-pointer',
                                )}
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="border border-gray-100 rounded-2xl bg-white p-5 sm:p-6 flex flex-col gap-4 h-fit shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold text-gray-900">
                        {t('customFields') || 'Additional Information'}
                    </h3>
                </div>
            </div>
            <div className="pt-1">
                <div className="flex flex-col divide-y divide-gray-50">
                    {customFields.map((field) => (
                        <div key={field.id}>{renderField(field)}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
