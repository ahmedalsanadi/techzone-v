import CheckoutCard from './CheckoutCard';

interface WalletDiscountCardProps {
    balance: string;
    selected: 'yes' | 'no';
}

export default function WalletDiscountCard({
    balance,
    selected,
}: WalletDiscountCardProps) {
    return (
        <CheckoutCard>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-md sm:text-lg font-bold text-gray-800">
                    هل تريد خصم المبلغ من المحفظة؟
                </h2>
                <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 self-start sm:self-auto">
                    <span className="text-gray-500 text-sm">
                        رصيدك في المحفظة:
                    </span>
                    <span className="font-bold text-red-600">{balance}</span>
                </div>
            </div>

            <div className="space-y-3">
                {['yes', 'no'].map((value) => (
                    <label
                        key={value}
                        className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="radio"
                            checked={selected === value}
                            readOnly
                            className="sr-only peer"
                        />
                        <div className="w-5 h-5 rounded-full border-2 border-red-600 peer-checked:bg-red-600 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                        <span className="text-gray-700">
                            {value === 'yes' ? 'نعم' : 'لا'}
                        </span>
                    </label>
                ))}
            </div>
        </CheckoutCard>
    );
}
