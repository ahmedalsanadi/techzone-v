export interface Category {
    id: string;
    slug: string;
    key: string;
    image?: string;
    isMain?: boolean;
    children?: Category[];
}

export interface Product {
    id: number;
    nameKey: string;
    image: string;
    price: number;
    oldPrice?: number;
    discountAmount?: string;
    categoryId: string;
    subCategoryId?: string;
}

export const CATEGORIES: Category[] = [
    { id: '1', slug: 'all', key: 'all', isMain: true },
    {
        id: '2',
        slug: 'pizza',
        key: 'pizza',
        image: '/images/images/pizza-slice.png',
        children: [
            { id: '2-1', slug: 'all', key: 'all' },
            {
                id: '2-2',
                slug: 'chicken-pizza',
                key: 'chickenPizza',
                image: '/images/images/dish.png',
            },
            {
                id: '2-3',
                slug: 'beef-pizza',
                key: 'beefPizza',
                image: '/images/images/dish.png',
            },
            {
                id: '2-4',
                slug: 'veggie-pizza',
                key: 'veggiePizza',
                image: '/images/images/dish.png',
            },
        ],
    },
    {
        id: '3',
        slug: 'burger',
        key: 'burger',
        image: '/images/images/burgar.png',
    },
    {
        id: '4',
        slug: 'sweets',
        key: 'sweets',
        image: '/images/images/sweets.png',
    },
    {
        id: '5',
        slug: 'drinks',
        key: 'drinks',
        image: '/images/images/drink-can.png',
    },
    { id: '6', slug: 'meals', key: 'meals', image: '/images/images/food.png' },
];

export const PRODUCTS: Product[] = [
    {
        id: 1,
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discountAmount: '5%',
        categoryId: '2',
        subCategoryId: '2-2',
    },
    {
        id: 2,
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discountAmount: '5%',
        categoryId: '2',
        subCategoryId: '2-3',
    },
    {
        id: 3,
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discountAmount: '5%',
        categoryId: '3',
    },
    {
        id: 4,
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 180,
        discountAmount: '10%',
        categoryId: '6',
    },
    {
        id: 5,
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 25,
        categoryId: '5',
    },
    // ... add more to make it look full
    ...Array.from({ length: 12 }).map((_, i) => ({
        id: i + 10,
        nameKey: 'dishName',
        image: '/images/images/dish.png',
        price: 230,
        oldPrice: 250,
        discountAmount: '5%',
        categoryId: ((i % 5) + 2).toString(),
    })),
];

export const fetchCategories = async (): Promise<Category[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return CATEGORIES;
};

export const fetchProducts = async (): Promise<Product[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 150));
    return PRODUCTS;
};
