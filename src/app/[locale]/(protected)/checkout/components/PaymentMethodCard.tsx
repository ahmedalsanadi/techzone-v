import { CreditCard, Banknote, Wallet, Check } from 'lucide-react';
import CheckoutCard from './CheckoutCard';
import { PaymentMethod, PaymentMethodType } from '@/types/orders';
import { cn } from '@/lib/utils';

interface PaymentMethodCardProps {
    methods: PaymentMethod[];
    selectedType: string | null;
    onChange: (type: PaymentMethodType) => void;
}

export default function PaymentMethodCard({
    methods,
    selectedType,
    onChange,
}: PaymentMethodCardProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'epayment':
                return <CreditCard className="w-5 h-5" />;
            case 'cod':
                return <Banknote className="w-5 h-5" />;
            case 'wallet':
                return <Wallet className="w-5 h-5" />;
            default:
                return <CreditCard className="w-5 h-5" />;
        }
    };

    return (
        <CheckoutCard title="طريقة الدفع">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {methods
                    .filter((m) => m.type !== 'wallet') // Wallet is handled by WalletDiscountCard
                    .map((method) => {
                        const isSelected = selectedType === method.type;
                        return (
                            <button
                                key={method.type}
                                onClick={() => onChange(method.type)}
                                className={cn(
                                    'relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-right',
                                    isSelected
                                        ? 'border-theme-primary bg-theme-primary/5'
                                        : 'border-gray-100 hover:border-gray-200 bg-white',
                                )}>
                                <div
                                    className={cn(
                                        'size-10 rounded-xl flex items-center justify-center transition-colors',
                                        isSelected
                                            ? 'bg-theme-primary text-white'
                                            : 'bg-gray-100 text-gray-400',
                                    )}>
                                    {getIcon(method.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-gray-900">
                                        {method.name}
                                    </div>
                                    <div className="text-xs text-gray-500 line-clamp-1">
                                        {method.description}
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-2 left-2 size-5 rounded-full bg-theme-primary flex items-center justify-center">
                                        <Check className="size-3 text-white" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
            </div>
        </CheckoutCard>
    );
}
