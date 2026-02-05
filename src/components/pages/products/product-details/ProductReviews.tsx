// src/components/product/ProductReviews.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    Star,
    User,
    Calendar,
    Loader2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Filter,
    MessageSquare,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { reviewService } from '@/services/review-service';
import { Review } from '@/types/reviews';
import { cn } from '@/lib/utils';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/SelectField';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface ProductReviewsProps {
    productId: number;
}

// Review filter options
type SortOption = 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating';
type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1';

export default function ProductReviews({ productId }: ProductReviewsProps) {
    const t = useTranslations('Reviews');
    const [visibleCount, setVisibleCount] = useState(5);
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
    const [isExpanded, setIsExpanded] = useState(false);

    // Map sort option to API params
    const getSortParams = (sort: SortOption) => {
        switch (sort) {
            case 'newest':
                return { sort: 'created_at', order: 'desc' as const };
            case 'oldest':
                return { sort: 'created_at', order: 'asc' as const };
            case 'highest_rating':
                return { sort: 'rating', order: 'desc' as const };
            case 'lowest_rating':
                return { sort: 'rating', order: 'asc' as const };
            default:
                return { sort: 'created_at', order: 'desc' as const };
        }
    };

    // Fetch reviews with TanStack Query
    const {
        data: reviewsData,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: [
            'product-reviews',
            productId,
            sortBy,
            ratingFilter,
            visibleCount,
        ],
        queryFn: async () => {
            const sortParams = getSortParams(sortBy);
            const params = {
                product_id: productId,
                per_page: visibleCount,
                page: 1,
                ...sortParams,
                ...(ratingFilter !== 'all' && { rating: Number(ratingFilter) }),
            };

            const response = await reviewService.getReviews(params);
            return response.data || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        refetchOnWindowFocus: false,
    });

    const reviews = reviewsData || [];
    const totalReviews = reviews.length;
    const hasMoreReviews = totalReviews >= visibleCount;
    const averageRating =
        reviews.length > 0
            ? (
                  reviews.reduce((acc, review) => acc + review.rating, 0) /
                  reviews.length
              ).toFixed(1)
            : '0.0';

    // Calculate rating distribution
    const ratingDistribution = {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
    };

    // Load more reviews
    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 5);
    };

    // Show less reviews
    const handleShowLess = () => {
        setVisibleCount(5);
        setIsExpanded(false);
    };

    // Toggle review expansion
    const toggleExpand = () => {
        if (isExpanded) {
            setVisibleCount(5);
        } else {
            setVisibleCount((prev) => Math.min(prev + 10, 50)); // Limit to 50 reviews
        }
        setIsExpanded(!isExpanded);
    };

    // Loading state
    if (isLoading && !reviewsData) {
        return (
            <div className="mt-16 space-y-8">
                <div className="flex items-center justify-between border-b pb-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-20" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="p-6 bg-white rounded-[24px] border border-gray-100 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="mt-16 space-y-8">
                <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="text-2xl font-black text-gray-900">
                        {t('reviewsTitle') || 'التقييمات'}
                    </h3>
                </div>
                <div className="text-center py-12 bg-red-50 rounded-[32px] border border-red-200">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-600 font-medium mb-2">
                        {t('errorLoadingReviews') || 'فشل تحميل التقييمات'}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                        {error instanceof Error
                            ? error.message
                            : 'حدث خطأ غير متوقع'}
                    </p>
                    <Button
                        onClick={() => refetch()}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        disabled={isRefetching}>
                        {isRefetching ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t('retrying') || 'جاري إعادة المحاولة...'}
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {t('retry') || 'إعادة المحاولة'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-16 space-y-8">
            {/* Header with Stats */}
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3 space-y-6">
                    <div className="bg-linear-to-br from-theme-primary/5 to-theme-primary/10 rounded-[24px] p-6 border border-theme-primary/20">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-black text-gray-900">
                                {t('overallRating') || 'التقييم العام'}
                            </h3>
                            <MessageSquare className="w-6 h-6 text-theme-primary" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-4xl font-black text-gray-900">
                                    {averageRating}
                                </div>
                                <div className="flex gap-0.5 mt-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={14}
                                            className={cn(
                                                Number(averageRating) >= star
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-200 fill-gray-200',
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {t('basedOnReviews', { count: totalReviews }) ||
                                    `بناءً على ${totalReviews} تقييم${totalReviews !== 1 ? 'ات' : ''}`}
                            </div>
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">
                                {t('ratingDistribution') || 'توزيع التقييمات'}
                            </h4>
                            <Filter className="w-4 h-4 text-gray-400" />
                        </div>
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <button
                                key={rating}
                                onClick={() =>
                                    setRatingFilter(
                                        ratingFilter === rating.toString()
                                            ? 'all'
                                            : (rating.toString() as RatingFilter),
                                    )
                                }
                                className={cn(
                                    'flex items-center justify-between w-full p-2 rounded-lg transition-colors',
                                    ratingFilter === rating.toString()
                                        ? 'bg-theme-primary/10 border border-theme-primary/20'
                                        : 'hover:bg-gray-50',
                                )}>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">
                                        {rating}
                                    </span>
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400"
                                            style={{
                                                width: `${(ratingDistribution[rating as keyof typeof ratingDistribution] / Math.max(totalReviews, 1)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500 min-w-[2rem] text-right">
                                        {
                                            ratingDistribution[
                                                rating as keyof typeof ratingDistribution
                                            ]
                                        }
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="lg:w-2/3 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">
                                {t('reviewsTitle') || 'التقييمات'}
                            </h3>
                            {totalReviews > 0 && (
                                <span className="text-sm font-bold text-gray-400">
                                    {totalReviews}{' '}
                                    {t('reviewsCount') || 'تقييم'}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Select
                                value={sortBy}
                                onValueChange={(value: string) =>
                                    setSortBy(value as SortOption)
                                }>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue
                                        placeholder={t('sortBy') || 'ترتيب حسب'}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">
                                        {t('newest') || 'الأحدث'}
                                    </SelectItem>
                                    <SelectItem value="oldest">
                                        {t('oldest') || 'الأقدم'}
                                    </SelectItem>
                                    <SelectItem value="highest_rating">
                                        {t('highestRating') || 'الأعلى تقييماً'}
                                    </SelectItem>
                                    <SelectItem value="lowest_rating">
                                        {t('lowestRating') || 'الأقل تقييماً'}
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleExpand}
                                className="text-theme-primary hover:text-theme-primary/80">
                                {isExpanded ? (
                                    <>
                                        <ChevronUp className="w-4 h-4 ml-2" />
                                        {t('showLess') || 'عرض أقل'}
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4 ml-2" />
                                        {t('showMore') || 'عرض المزيد'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {isRefetching && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-theme-primary" />
                        </div>
                    )}

                    {totalReviews === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium">
                                {t('noReviews') ||
                                    'لا توجد تقييمات لهذا المنتج بعد'}
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                {t('beFirstToReview') ||
                                    'كن أول من يقيّم هذا المنتج'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {reviews.map((review) => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                    />
                                ))}
                            </div>

                            {/* Load More / Show Less Controls */}
                            {hasMoreReviews && (
                                <div className="flex justify-center pt-6">
                                    {isExpanded ? (
                                        <Button
                                            variant="outline"
                                            onClick={handleShowLess}
                                            className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                            <ChevronUp className="w-4 h-4 ml-2" />
                                            {t('showLess') || 'عرض أقل'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={handleLoadMore}
                                            className="border-theme-primary text-theme-primary hover:bg-theme-primary/5">
                                            <ChevronDown className="w-4 h-4 ml-2" />
                                            {t('loadMore') || 'تحميل المزيد'}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Separate Review Card Component for better performance
function ReviewCard({ review }: { review: Review }) {
    const t = useTranslations('Reviews');

    return (
        <div className="p-6 bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 group">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-theme-primary/10 flex items-center justify-center text-theme-primary group-hover:bg-theme-primary/20 transition-colors">
                        <User size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                            {review.user_name}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                            <Calendar size={10} />
                            <span>
                                {new Date(review.created_at).toLocaleDateString(
                                    'en-US'
                                )}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={14}
                            className={cn(
                                'transition-colors',
                                star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-100 fill-transparent',
                            )}
                        />
                    ))}
                </div>
            </div>

            {review.comment && (
                <div className="space-y-2">
                    <p className="text-gray-600 font-medium text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                        {review.comment}
                    </p>
                    {review.comment.length > 150 && (
                        <button className="text-xs text-theme-primary hover:text-theme-primary/80 font-medium">
                            {t('readMore') || 'قراءة المزيد'}
                        </button>
                    )}
                </div>
            )}

            {review.status === 'pending' && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200">
                    <span className="text-xs font-medium text-yellow-700">
                        {t('pendingReview') || 'قيد المراجعة'}
                    </span>
                </div>
            )}
        </div>
    );
}
