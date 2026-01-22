import { ChevronLeft } from 'lucide-react';
import CheckoutCard from './CheckoutCard';

interface PaymentMethod {
    id: number;
    name: string;
    isSelected: boolean;
}

interface PaymentMethodCardProps {
    methods: PaymentMethod[];
    onChange?: () => void;
}

export default function PaymentMethodCard({
    methods,
    onChange,
}: PaymentMethodCardProps) {
    return (
        <CheckoutCard
            title="طريقة الدفع"
            action={
                <button
                    onClick={onChange}
                    className="bg-red-100 px-2 py-1 rounded-md flex items-center gap-1 text-red-600 text-md font-medium">
                    <span>تغيير</span>
                    <ChevronLeft className="w-4 h-4" />
                </button>
            }>
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {methods.map((method) => (
                    <div
                        key={method.id}
                        className={`group relative flex-1 min-w-[80px] sm:flex-none sm:w-24 h-14 flex items-center justify-center rounded-lg cursor-pointer transition-all hover:scale-105
                        ${
                            method.isSelected
                                ? 'border-red-600 border-2 bg-red-50'
                                : 'border border-gray-300 hover:border-gray-400'
                        }`}>
                        <span className="text-purple-900 font-bold text-lg">
                            {method.name}
                        </span>
                    </div>
                ))}
            </div>
        </CheckoutCard>
    );
}
