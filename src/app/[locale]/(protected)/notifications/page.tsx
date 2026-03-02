import NotificationsView, {
    NotificationItem,
} from '@/components/notifications/NotificationsView';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
    // Simulate network latency so the loading skeleton is visible while testing.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // TODO: Replace with real API call when backend is ready.
    // For now we use static, themed dummy data.
    const dummyNotifications: NotificationItem[] = [
        {
            id: '1',
            type: 'order',
            title_en: 'Your order #1023 is being prepared',
            title_ar: 'يتم تحضير طلبك رقم 1023',
            message_en:
                'Our team has started preparing your order. We will notify you once it is ready for pickup or delivery.',
            message_ar:
                'بدأ فريقنا في تحضير طلبك، وسنخبرك عندما يصبح جاهزاً للتسليم أو الاستلام.',
            type_label_en: 'Order',
            type_label_ar: 'طلب',
            createdAt: '5 min ago',
            isRead: false,
        },
        {
            id: '2',
            type: 'promotion',
            title_en: 'Limited-time offer: 20% off on pizzas',
            title_ar: 'عرض لفترة محدودة: خصم 20٪ على جميع البيتزا',
            message_en:
                'Enjoy 20% off all pizzas today only when you order through the app. Use it with your next order before midnight.',
            message_ar:
                'استمتع بخصم 20٪ على جميع أنواع البيتزا اليوم فقط عند الطلب من التطبيق. استخدم العرض في طلبك القادم قبل منتصف الليل.',
            type_label_en: 'Offer',
            type_label_ar: 'عرض',
            createdAt: '30 min ago',
            isRead: false,
        },
        {
            id: '3',
            type: 'system',
            title_en: 'Profile completed successfully',
            title_ar: 'تم إكمال ملفك الشخصي بنجاح',
            message_en:
                'Thank you for completing your profile. This helps us serve you better and keep your orders safe.',
            message_ar:
                'شكراً لك على إكمال ملفك الشخصي، هذا يساعدنا على خدمتك بشكل أفضل ويحافظ على أمان طلباتك.',
            type_label_en: 'System',
            type_label_ar: 'نظام',
            createdAt: '2 hours ago',
            isRead: true,
        },
        {
            id: '4',
            type: 'order',
            title_en: 'Order #1018 has been delivered',
            title_ar: 'تم توصيل طلبك رقم 1018',
            message_en:
                'We hope you enjoyed your meal! Tap here to rate your experience and share your feedback with us.',
            message_ar:
                'نتمنى أن تكون وجبتك قد نالت إعجابك! اضغط هنا لتقييم تجربتك ومشاركتنا رأيك.',
            type_label_en: 'Order',
            type_label_ar: 'طلب',
            createdAt: 'Yesterday',
            isRead: true,
        },
    ];

    return <NotificationsView initialNotifications={dummyNotifications} />;
}

