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
            <div className="text-md space-y-3">
                <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                        <span className="text-gray-600">{addressLabel}</span>
                        <span className="text-red-600 font-medium">
                            {deliveryType}
                        </span>
                        <span className="text-gray-600">{address}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div className="flex items-center gap-1">
                        <span className="text-red-600 font-medium">لاحقاً</span>
                        <span className="text-gray-600">{date}</span>
                        <span className="text-gray-400">،</span>
                        <span className="text-gray-600">{time}</span>
                    </div>
                </div>
            </div>
        </CheckoutCard>
    );
}
