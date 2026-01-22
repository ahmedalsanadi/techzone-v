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
                    className="bg-theme-primary/10 px-2.5 py-1.5 rounded-md flex items-center gap-1 text-theme-primary text-md font-medium hover:brightness-[0.95] transition-all">
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
                                ? 'border-theme-primary border-2 bg-theme-primary/5'
                                : 'border border-gray-300 hover:border-theme-primary-border'
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
