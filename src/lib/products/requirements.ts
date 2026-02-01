import type { Product } from '@/services/types';

export interface ProductSelection {
    selectedVariantId: number | null;
    selectedAddons: Record<number, Record<number, number>>;
    customFields: Record<string, any>;
}

export function hasVariants(product: Product): boolean {
    return !!product.is_variation || (product.variants?.length ?? 0) > 0;
}

export function getRequiredAddonGroups(product: Product) {
    return (product.addons || []).filter(
        (group) => group.is_required || group.min_selected > 0,
    );
}

export function getRequiredCustomFields(product: Product) {
    return (product.custom_fields || []).filter((field) => field.is_required);
}

export function requiresConfiguration(product: Product): boolean {
    return (
        hasVariants(product) ||
        getRequiredAddonGroups(product).length > 0 ||
        getRequiredCustomFields(product).length > 0
    );
}

export function requiresDetailsFetch(product: Product): boolean {
    return (
        product.is_variation === true ||
        product.addons === undefined ||
        product.custom_fields === undefined ||
        product.variants === undefined
    );
}

const isProvidedValue = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
};

export function validateRequiredSelections(
    product: Product,
    selection: ProductSelection,
) {
    const errors: string[] = [];

    if (hasVariants(product) && !selection.selectedVariantId) {
        errors.push('variant_required');
    }

    getRequiredAddonGroups(product).forEach((group) => {
        const selectedItems = selection.selectedAddons[group.id] || {};
        const selectedCount =
            group.input_type === 'boolean'
                ? Object.values(selectedItems).filter((qty) => qty > 0).length
                : Object.values(selectedItems).reduce(
                      (sum, qty) => sum + qty,
                      0,
                  );

        if (selectedCount < group.min_selected) {
            errors.push(`addon_group_${group.id}_min`);
        }
    });

    getRequiredCustomFields(product).forEach((field) => {
        if (!isProvidedValue(selection.customFields[field.name])) {
            errors.push(`custom_field_${field.name}_required`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
}
