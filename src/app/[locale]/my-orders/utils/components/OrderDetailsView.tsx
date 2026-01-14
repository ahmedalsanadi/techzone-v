//src/app/[locale]/my-orders/[id]/OrderDetailsView.tsx

import SubHeaderManager from "@/components/layouts/SubHeaderManager";
import { Order } from "@/lib/mock-data";
import { getTranslations } from "next-intl/server";

interface OrderDetailsViewProps {
    order: Order;
}

export default function OrderDetailsView({ order }: OrderDetailsViewProps) {
    // const local = useLocale();
    const t = getTranslations('Orders');
    return (
        // this will include all sub components and handles client logics ...etc

        <section className="min-h-screen pb-16 pt-6 px-2 md:px-4">
            
            {/* Manage SubHeader (Client Logic) */}
             <SubHeaderManager show={false} />
            
        </section>
    );
}   
