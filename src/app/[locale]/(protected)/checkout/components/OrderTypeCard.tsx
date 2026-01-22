import { ChevronLeft, MapPin, Clock } from 'lucide-react';
import CheckoutCard from './CheckoutCard';

interface OrderTypeCardProps {
    addressLabel: string;
    address: string;
    deliveryType: string;
    date: string;
    time: string;
    onEdit?: () => void;
}

export default function OrderTypeCard({
    addressLabel,
    address,
    deliveryType,
    date,
    time,
    onEdit,
}: OrderTypeCardProps) {
    return (
        <CheckoutCard
            title="نوع الطلب ووقته"
            action={
                <button
                    onClick={onEdit}
                    className="bg-red-100 px-2 py-1 rounded-md flex items-center gap-1 text-red-600 text-md font-medium">
                    <span>تعديل</span>
                    <ChevronLeft className="w-4 h-4" />
                </button>
            }>
            <div className="text-md space-y-4">
                <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm font-medium">
                                {addressLabel}
                            </span>
                            <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
                                {deliveryType}
                            </span>
                        </div>
                        <span className="text-gray-800 font-medium leading-relaxed">
                            {address}
                        </span>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                        <Clock className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-gray-500 text-sm font-medium">
                            وقت التوصيل
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                            <span className="text-red-600">لاحقاً</span>
                            <span>{date}</span>
                            <span className="text-gray-300">|</span>
                            <span>{time}</span>
                        </div>
                    </div>
                </div>
            </div>
        </CheckoutCard>
    );
}
