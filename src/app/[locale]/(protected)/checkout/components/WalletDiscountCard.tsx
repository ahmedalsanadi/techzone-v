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
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-md font-bold">
                    هل تريد خصم المبلغ من المحفظة؟
                </h2>

                <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
                    <span className="text-gray-600 text-sm">
                        رصيدك في المحفظة:
                    </span>
                    <span className="font-bold">{balance}</span>
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
