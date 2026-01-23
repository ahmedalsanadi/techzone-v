'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ProductCustomField } from '@/services/types';
import { cn } from '@/lib/utils';

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
        const hasError = isRequired && !fieldValue;

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
                            <span className="text-md font-bold text-gray-700">
                                {field.label}
                                {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </span>
                            {field.description && (
                                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                            )}
                        </label>
                        <input
                            type="number"
                            value={fieldValue}
                            onChange={(e) => onChange(field.name, e.target.value ? Number(e.target.value) : '')}
                            min={0}
                            max={field.max_limit || undefined}
                            className={cn(
                                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary",
                                hasError && "border-red-300"
                            )}
                        />
                    </div>
                );

            case 'text':
                return (
                    <div className="py-3">
                        <label className="block mb-2">
                            <span className="text-md font-bold text-gray-700">
                                {field.label}
                                {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </span>
                            {field.description && (
                                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                            )}
                        </label>
                        <input
                            type="text"
                            value={fieldValue}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            maxLength={field.max_limit || undefined}
                            className={cn(
                                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary",
                                hasError && "border-red-300"
                            )}
                        />
                    </div>
                );

            case 'textarea':
                return (
                    <div className="py-3">
                        <label className="block mb-2">
                            <span className="text-md font-bold text-gray-700">
                                {field.label}
                                {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </span>
                            {field.description && (
                                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                            )}
                        </label>
                        <textarea
                            value={fieldValue}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            maxLength={field.max_limit || undefined}
                            rows={3}
                            className={cn(
                                "w-full px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary",
                                hasError && "border-red-300"
                            )}
                        />
                    </div>
                );

            case 'select':
            case 'radio':
                if (!field.options) return null;
                return (
                    <div className="py-3">
                        <label className="block mb-2">
                            <span className="text-md font-bold text-gray-700">
                                {field.label}
                                {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </span>
                            {field.description && (
                                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                            )}
                        </label>
                        {field.input_type === 'select' ? (
                            <select
                                value={fieldValue}
                                onChange={(e) => onChange(field.name, e.target.value)}
                                className={cn(
                                    "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary",
                                    hasError && "border-red-300"
                                )}>
                                <option value="">{t('select') || 'Select...'}</option>
                                {Object.entries(field.options).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
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
                        <label className="block mb-2">
                            <span className="text-md font-bold text-gray-700">
                                {field.label}
                                {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </span>
                            {field.description && (
                                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                            )}
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
                        <label className="block mb-2">
                            <span className="text-md font-bold text-gray-700">
                                {field.label}
                                {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </span>
                            {field.description && (
                                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                            )}
                        </label>
                        <input
                            type="date"
                            value={fieldValue}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            className={cn(
                                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary",
                                hasError && "border-red-300"
                            )}
                        />
                    </div>
                );

            case 'time':
                return (
                    <div className="py-3">
                        <label className="block mb-2">
                            <span className="text-md font-bold text-gray-700">
                                {field.label}
                                {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </span>
                            {field.description && (
                                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                            )}
                        </label>
                        <input
                            type="time"
                            value={fieldValue}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            className={cn(
                                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary",
                                hasError && "border-red-300"
                            )}
                        />
                    </div>
                );

            case 'datetime':
                return (
                    <div className="py-3">
                        <label className="block mb-2">
                            <span className="text-md font-bold text-gray-700">
                                {field.label}
                                {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </span>
                            {field.description && (
                                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                            )}
                        </label>
                        <input
                            type="datetime-local"
                            value={fieldValue}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            className={cn(
                                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary",
                                hasError && "border-red-300"
                            )}
                        />
                    </div>
                );

            case 'file':
            case 'image':
                return (
                    <div className="py-3">
                        <label className="block mb-2">
                            <span className="text-md font-bold text-gray-700">
                                {field.label}
                                {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </span>
                            {field.description && (
                                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                            )}
                        </label>
                        <input
                            type="file"
                            accept={field.input_type === 'image' ? 'image/*' : undefined}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    // For file/image, we might need to upload first or store file reference
                                    // For now, store the file name
                                    onChange(field.name, file.name);
                                }
                            }}
                            className={cn(
                                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-theme-primary",
                                hasError && "border-red-300"
                            )}
                        />
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
