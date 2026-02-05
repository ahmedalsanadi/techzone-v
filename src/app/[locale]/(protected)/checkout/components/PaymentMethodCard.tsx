import { CreditCard, Banknote, Wallet, Check } from 'lucide-react';
import CheckoutCard from './CheckoutCard';
import {
    PaymentMethod,
    PaymentMethodType,
    PaymentGateway,
} from '@/types/orders';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PaymentMethodCardProps {
    methods: PaymentMethod[];
    selectedType: string | null;
    selectedGatewaySlug: string | null;
    onChange: (type: PaymentMethodType) => void;
    onGatewayChange: (slug: string) => void;
}

export default function PaymentMethodCard({
    methods,
    selectedType,
    selectedGatewaySlug,
    onChange,
    onGatewayChange,
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

    const selectedMethod = methods.find((m) => m.type === selectedType);

    return (
        <CheckoutCard title="طريقة الدفع">
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {methods
                        .filter((m) => m.type !== 'wallet') // Wallet is handled by WalletDiscountCard
                        .map((method) => {
                            const isSelected = selectedType === method.type;
                            // For now, epayment is allowed to be selected but gateways are placeholder
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
                                        <div className="font-bold text-gray-900 leading-tight">
                                            {method.name}
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

                {/* Gateway Selection for e-payment */}
                {selectedType === 'epayment' &&
                    selectedMethod?.gateways &&
                    selectedMethod.gateways.length > 0 && (
                        <div className="pt-4 border-t border-gray-100">
                            <label className="text-sm font-bold text-gray-700 block mb-5 text-center">
                                اختر بوابة الدفع
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {selectedMethod.gateways.map((gateway) => {
                                    return (
                                        <button
                                            key={gateway.id}
                                            disabled
                                            className={cn(
                                                'relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                                                'border-gray-100 bg-white opacity-80 cursor-not-allowed',
                                            )}>
                                            {/* Centered Top Badge */}
                                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gray-900 shadow-sm text-white text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-tighter whitespace-nowrap z-10 border border-white">
                                                Coming Soon
                                            </div>

                                            <div className="size-10 rounded-lg bg-white border border-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                                {gateway.logo ? (
                                                    <Image
                                                        src={gateway.logo}
                                                        alt={gateway.name}
                                                        width={32}
                                                        height={32}
                                                        className="object-contain"
                                                    />
                                                ) : (
                                                    <CreditCard className="size-5 text-gray-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 text-right">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {gateway.name}
                                                </div>
                                                <div className="text-[10px] text-gray-500 line-clamp-1">
                                                    {gateway.description}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
            </div>
        </CheckoutCard>
    );
}
