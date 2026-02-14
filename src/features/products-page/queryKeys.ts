import type { ProductsPageState } from './types';

function stableObject(value: unknown): unknown {
    if (Array.isArray(value)) {
        const mapped = value.map(stableObject);
        // If this is an order-insensitive array of primitives (our filter IDs / attribute options),
        // sort it to avoid cache fragmentation from selection order.
        const isPrimitiveArray = mapped.every(
            (v) =>
                v === null ||
                v === undefined ||
                typeof v === 'string' ||
                typeof v === 'number' ||
                typeof v === 'boolean',
        );
        if (isPrimitiveArray) {
            return [...mapped].sort((a, b) =>
                String(a ?? '').localeCompare(String(b ?? '')),
            );
        }
        return mapped;
    }
    if (value && typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        const entries = Object.entries(obj)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => [k, stableObject(v)] as const);
        return Object.fromEntries(entries);
    }
    return value;
}

export function stableSerialize(value: unknown): string {
    return JSON.stringify(stableObject(value));
}

export type ProductsPageQueryContext = {
    tenantHost: string;
    locale: string;
    branchId: number | null;
};

const branchKey = (branchId: number | null) => (branchId == null ? 'no-branch' : branchId);

export const productsPageKeys = {
    all: (ctx: ProductsPageQueryContext) =>
        ['productsPage', ctx.tenantHost, ctx.locale, branchKey(ctx.branchId)] as const,
    products: (state: ProductsPageState, ctx: ProductsPageQueryContext) =>
        [...productsPageKeys.all(ctx), 'products', stableSerialize(state)] as const,
    filtersVars: (
        args: { search?: string; category_id?: string },
        ctx: ProductsPageQueryContext,
    ) => [...productsPageKeys.all(ctx), 'filters', stableSerialize(args)] as const,
} as const;

