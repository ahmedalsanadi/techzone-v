import type { PaginationMeta } from '@/types/api';

export type ProductsPageSort =
    | 'display_order'
    | 'created_at'
    | 'price'
    | 'title';
export type ProductsPageOrder = 'asc' | 'desc';

export type ProductsPageFiltersState = {
    search: string;
    categoryIds: string[]; // API: category_id=1,2
    brandIds: string[]; // API: brand_id=1,2
    collectionIds: string[]; // API: collection_id=1,2
    availability?: 'in_stock' | 'out_of_stock' | 'low_stock';
    min_price?: number;
    max_price?: number;
    has_discount?: boolean;
    has_variants?: boolean;
    is_featured?: boolean;
    is_latest?: boolean;
    sort: ProductsPageSort;
    order: ProductsPageOrder;
    // Dynamic attributes: key = slug, value = selected options
    attributes: Record<string, Array<string | number>>;
};

export type ProductsPagePaginationState = {
    page: number;
    per_page: number;
};

export type ProductsPageState = {
    filters: ProductsPageFiltersState;
    pagination: ProductsPagePaginationState;
};

export const DEFAULT_PER_PAGE = 8;

export function createInitialProductsPageState(): ProductsPageState {
    return {
        filters: {
            search: '',
            categoryIds: [],
            brandIds: [],
            collectionIds: [],
            availability: undefined,
            min_price: undefined,
            max_price: undefined,
            has_discount: undefined,
            has_variants: undefined,
            is_featured: undefined,
            is_latest: undefined,
            sort: 'display_order',
            order: 'asc',
            attributes: {},
        },
        pagination: { page: 1, per_page: DEFAULT_PER_PAGE },
    };
}

export type ProductsPageAction =
    | { type: 'setAll'; state: ProductsPageState }
    | { type: 'setSearch'; value: string }
    | { type: 'toggleCategory'; id: string }
    | { type: 'toggleBrand'; id: string }
    | { type: 'toggleCollection'; id: string }
    | { type: 'toggleAttributeOption'; slug: string; value: string | number }
    | { type: 'clearAttribute'; slug: string }
    | {
          type: 'setPriceRange';
          min?: number;
          max?: number;
      }
    | {
          type: 'setAvailability';
          value?: 'in_stock' | 'out_of_stock' | 'low_stock';
      }
    | { type: 'toggleFlag'; key: 'has_discount' | 'has_variants' | 'is_featured' | 'is_latest' }
    | { type: 'setSort'; sort: ProductsPageSort; order: ProductsPageOrder }
    | { type: 'setPage'; page: number }
    | { type: 'setPerPage'; per_page: number }
    | { type: 'resetAll' };

function toggleInArray(arr: string[], id: string): string[] {
    return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
}

function sortIds(arr: string[]): string[] {
    return [...arr].sort((a, b) => String(a).localeCompare(String(b)));
}

function normalizeAttributes(
    attributes: Record<string, Array<string | number>>,
): Record<string, Array<string | number>> {
    const next: Record<string, Array<string | number>> = {};
    Object.entries(attributes).forEach(([slug, values]) => {
        if (!values?.length) return;
        const uniq = Array.from(new Set(values.map((v) => v)));
        next[slug] = uniq.sort((a, b) =>
            String(a ?? '').localeCompare(String(b ?? '')),
        );
    });
    return next;
}

function normalizeRange(min?: number, max?: number): { min?: number; max?: number } {
    if (min == null && max == null) return { min, max };
    const a = min ?? 0;
    const b = max ?? a;
    return a <= b ? { min, max } : { min: b, max: a };
}

export function productsPageReducer(
    state: ProductsPageState,
    action: ProductsPageAction,
): ProductsPageState {
    switch (action.type) {
        case 'setAll':
            return action.state;
        case 'setSearch':
            return {
                ...state,
                pagination: { ...state.pagination, page: 1 },
                filters: { ...state.filters, search: action.value },
            };
        case 'toggleCategory':
            return {
                ...state,
                pagination: { ...state.pagination, page: 1 },
                filters: {
                    ...state.filters,
                    categoryIds: sortIds(
                        toggleInArray(state.filters.categoryIds, action.id),
                    ),
                },
            };
        case 'toggleBrand':
            return {
                ...state,
                pagination: { ...state.pagination, page: 1 },
                filters: {
                    ...state.filters,
                    brandIds: sortIds(
                        toggleInArray(state.filters.brandIds, action.id),
                    ),
                },
            };
        case 'toggleCollection':
            return {
                ...state,
                pagination: { ...state.pagination, page: 1 },
                filters: {
                    ...state.filters,
                    collectionIds: sortIds(
                        toggleInArray(state.filters.collectionIds, action.id),
                    ),
                },
            };
        case 'toggleAttributeOption': {
            const existing = state.filters.attributes[action.slug] || [];
            const nextValues = existing.some((v) => String(v) === String(action.value))
                ? existing.filter((v) => String(v) !== String(action.value))
                : [...existing, action.value];
            const nextAttributes = {
                ...state.filters.attributes,
                [action.slug]: nextValues,
            };
            if (nextValues.length === 0) {
                delete nextAttributes[action.slug];
            }
            return {
                ...state,
                pagination: { ...state.pagination, page: 1 },
                filters: {
                    ...state.filters,
                    attributes: normalizeAttributes(nextAttributes),
                },
            };
        }
        case 'clearAttribute': {
            const nextAttributes = { ...state.filters.attributes };
            delete nextAttributes[action.slug];
            return {
                ...state,
                pagination: { ...state.pagination, page: 1 },
                filters: {
                    ...state.filters,
                    attributes: normalizeAttributes(nextAttributes),
                },
            };
        }
        case 'setPriceRange': {
            const r = normalizeRange(action.min, action.max);
            return {
                ...state,
                pagination: { ...state.pagination, page: 1 },
                filters: {
                    ...state.filters,
                    min_price: r.min,
                    max_price: r.max,
                },
            };
        }
        case 'setAvailability':
            return {
                ...state,
                pagination: { ...state.pagination, page: 1 },
                filters: { ...state.filters, availability: action.value },
            };
        case 'toggleFlag': {
            const next = !state.filters[action.key];
            return {
                ...state,
                pagination: { ...state.pagination, page: 1 },
                filters: {
                    ...state.filters,
                    [action.key]: next ? true : undefined,
                } as ProductsPageFiltersState,
            };
        }
        case 'setSort':
            return {
                ...state,
                pagination: { ...state.pagination, page: 1 },
                filters: { ...state.filters, sort: action.sort, order: action.order },
            };
        case 'setPage':
            return { ...state, pagination: { ...state.pagination, page: action.page } };
        case 'setPerPage':
            return {
                ...state,
                pagination: { page: 1, per_page: action.per_page },
            };
        case 'resetAll':
            return createInitialProductsPageState();
        default:
            return state;
    }
}

function parseBoolean(value: string | undefined): boolean {
    if (!value) return false;
    const v = value.trim().toLowerCase();
    return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function parseIntOr(value: string | undefined, fallback: number): number {
    const n = value ? Number(value) : NaN;
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function parseNumberOrUndef(value: string | undefined): number | undefined {
    if (value == null || value === '') return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
}

function splitCsv(value: string | undefined): string[] {
    if (!value) return [];
    return value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

function parseAttributeValues(value: string | undefined): Array<string | number> {
    const raw = splitCsv(value);
    return raw.map((v) => {
        const n = Number(v);
        return Number.isFinite(n) && String(n) === v ? n : v;
    });
}

export type ProductsPageUrlParams = Record<string, string | undefined>;

export function productsPageStateFromUrlParams(
    params: ProductsPageUrlParams,
): ProductsPageState {
    const base = createInitialProductsPageState();
    const per_page = parseIntOr(params.per_page, base.pagination.per_page);
    const page = Math.max(1, parseIntOr(params.page, base.pagination.page));

    const filters: ProductsPageFiltersState = {
        ...base.filters,
        search: params.search ?? '',
        categoryIds: sortIds(splitCsv(params.category_id)),
        brandIds: sortIds(splitCsv(params.brand_id)),
        collectionIds: sortIds(splitCsv(params.collection_id)),
        availability: (params.availability as ProductsPageFiltersState['availability']) ?? undefined,
        min_price: parseNumberOrUndef(params.min_price),
        max_price: parseNumberOrUndef(params.max_price),
        has_discount: parseBoolean(params.has_discount) ? true : undefined,
        has_variants: parseBoolean(params.has_variants) ? true : undefined,
        is_featured: parseBoolean(params.is_featured) ? true : undefined,
        is_latest: parseBoolean(params.is_latest) ? true : undefined,
        sort: (params.sort as ProductsPageSort) || base.filters.sort,
        order: (params.order as ProductsPageOrder) || base.filters.order,
        attributes: {},
    };

    // Dynamic attributes are stored as attributes[slug]=a,b
    const attributes: Record<string, Array<string | number>> = {};
    Object.entries(params).forEach(([k, v]) => {
        const m = /^attributes\[(.+)\]$/.exec(k);
        if (!m) return;
        const slug = m[1];
        const values = parseAttributeValues(v);
        if (values.length) attributes[slug] = values;
    });
    filters.attributes = normalizeAttributes(attributes);

    return {
        filters,
        pagination: { page, per_page: Math.max(1, per_page) },
    };
}

export function productsPageStateToUrlParams(
    state: ProductsPageState,
): ProductsPageUrlParams {
    const { filters, pagination } = state;
    const params: ProductsPageUrlParams = {
        page: pagination.page > 1 ? String(pagination.page) : undefined,
        per_page:
            pagination.per_page !== DEFAULT_PER_PAGE
                ? String(pagination.per_page)
                : undefined,
        sort:
            filters.sort !== 'display_order' ? String(filters.sort) : undefined,
        order: filters.order !== 'asc' ? String(filters.order) : undefined,
    };

    if (filters.search.trim()) params.search = filters.search.trim();
    if (filters.categoryIds.length) params.category_id = sortIds(filters.categoryIds).join(',');
    if (filters.brandIds.length) params.brand_id = sortIds(filters.brandIds).join(',');
    if (filters.collectionIds.length) params.collection_id = sortIds(filters.collectionIds).join(',');
    if (filters.availability) params.availability = filters.availability;
    if (filters.min_price != null) params.min_price = String(filters.min_price);
    if (filters.max_price != null) params.max_price = String(filters.max_price);
    if (filters.has_discount) params.has_discount = '1';
    if (filters.has_variants) params.has_variants = '1';
    if (filters.is_featured) params.is_featured = '1';
    if (filters.is_latest) params.is_latest = '1';

    Object.entries(normalizeAttributes(filters.attributes)).forEach(([slug, values]) => {
        if (!values.length) return;
        params[`attributes[${slug}]`] = values.join(',');
    });

    return params;
}

export function urlSearchParamsToUrlParams(
    searchParams: URLSearchParams,
): ProductsPageUrlParams {
    const params: ProductsPageUrlParams = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return params;
}

export function buildProductsListParams(state: ProductsPageState): Record<string, string | number | boolean | undefined> {
    const { filters, pagination } = state;

    const params: Record<string, string | number | boolean | undefined> = {
        page: pagination.page,
        per_page: pagination.per_page,
        sort: filters.sort,
        order: filters.order,
    };

    if (filters.search.trim()) params.search = filters.search.trim();
    if (filters.categoryIds.length) params.category_id = sortIds(filters.categoryIds).join(',');
    if (filters.brandIds.length) params.brand_id = sortIds(filters.brandIds).join(',');
    if (filters.collectionIds.length) params.collection_id = sortIds(filters.collectionIds).join(',');
    if (filters.availability) params.availability = filters.availability;
    if (filters.min_price != null) params.min_price = filters.min_price;
    if (filters.max_price != null) params.max_price = filters.max_price;
    if (filters.has_discount) params.has_discount = true;
    if (filters.has_variants) params.has_variants = true;
    if (filters.is_featured) params.is_featured = true;
    if (filters.is_latest) params.is_latest = true;

    Object.entries(normalizeAttributes(filters.attributes)).forEach(([slug, values]) => {
        if (!values?.length) return;
        params[`attributes[${slug}]`] = values.join(',');
    });

    return params;
}

export function getSafePaginationMeta(meta: PaginationMeta | undefined, state: ProductsPageState): PaginationMeta {
    // Some APIs return inconsistent `current_page/last_page` even when `total` is correct.
    // `total` is the number of products, not pages.
    const total = meta?.total ?? 0;
    const perPage = meta?.per_page ?? state.pagination.per_page;
    const computedLast = Math.max(1, Math.ceil(total / Math.max(1, perPage)));
    const last = Math.max(
        1,
        meta?.last_page != null ? Math.max(meta.last_page, computedLast) : computedLast,
    );
    const current = meta?.current_page ?? state.pagination.page;
    const clampedCurrent = Math.min(Math.max(1, current), last);
    return {
        current_page: clampedCurrent,
        last_page: last,
        per_page: perPage,
        total,
    };
}

