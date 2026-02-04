import { ChevronLeft } from 'lucide-react';
import CheckoutCard from './CheckoutCard';

interface PaymentMethod {
    id: number;
    name: string;
    slug: string;
    isSelected: boolean;
}

interface PaymentMethodCardProps {
    methods: PaymentMethod[];
    onChange: (slug: string) => void;
}

export default function PaymentMethodCard({
    methods,
    onChange,
}: PaymentMethodCardProps) {
    return (
        <CheckoutCard title="طريقة الدفع">
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {methods.map((method) => (
                    <div
                        key={method.id}
                        onClick={() => onChange(method.slug)}
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
