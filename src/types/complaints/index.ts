import {
    COMPLAINT_CATEGORY_VALUES,
    COMPLAINT_PRIORITY_VALUES,
} from '@/constants/complaints';

/**
 * Complaints API types (POST /store/complaints)
 * category: 1=Order, 2=Shipping, 3=Payment, 4=Product, 5=Other
 * priority: 1=Low, 2=Medium, 3=High, 4=Urgent (optional, default 2)
 */

export type ComplaintCategory = (typeof COMPLAINT_CATEGORY_VALUES)[number];
export type ComplaintPriority = (typeof COMPLAINT_PRIORITY_VALUES)[number];

export type ComplainableType = 'order' | 'order_item' | 'product';

/** Request for POST /store/complaints (multipart/form-data). */
export interface CreateComplaintRequest {
    category: ComplaintCategory;
    priority?: ComplaintPriority;
    subject: string;
    description: string;
    complainable_type?: ComplainableType;
    complainable_id?: number;
    /** Limits: `@/constants/complaints`. */
    attachments?: File[];
}

/** Typical JSON body for successful create (shape may vary by API). */
export interface CreateComplaintResponse {
    id?: number;
    message?: string;
}

/**
 * Report-problem form state (react-hook-form).
 * Field bounds follow `COMPLAINT_*_VALUES` in `@/constants/complaints` and `complaintSchema`.
 */
export type ComplaintFormValues = {
    category: ComplaintCategory;
    priority: ComplaintPriority;
    subject: string;
    description: string;
};
