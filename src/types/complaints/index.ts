/**
 * Complaints API types (POST /store/complaints)
 * category: 1=Order, 2=Shipping, 3=Payment, 4=Product, 5=Other
 * priority: 1=Low, 2=Medium, 3=High, 4=Urgent (optional, default 2)
 */

export type ComplaintCategory = 1 | 2 | 3 | 4 | 5;
export type ComplaintPriority = 1 | 2 | 3 | 4;

export type ComplainableType = 'order' | 'order_item' | 'product';

/** Request for POST /store/complaints (multipart/form-data). */
export interface CreateComplaintRequest {
    category: ComplaintCategory;
    priority?: ComplaintPriority;
    subject: string;
    description: string;
    complainable_type?: ComplainableType;
    complainable_id?: number;
    /** Max COMPLAINT_MAX_ATTACHMENTS files; see COMPLAINT_ACCEPTED_IMAGE_TYPES. */
    attachments?: File[];
}

/** Typical JSON body for successful create (shape may vary by API). */
export interface CreateComplaintResponse {
    id?: number;
    message?: string;
}

/**
 * Report-problem form state (react-hook-form).
 * Field names and bounds must match `complaintSchema` in `@/lib/validations/complaints`.
 */
export type ComplaintFormValues = {
    category: ComplaintCategory;
    priority: ComplaintPriority;
    subject: string;
    description: string;
};

export const defaultComplaintFormValues: ComplaintFormValues = {
    category: 1,
    priority: 2,
    subject: '',
    description: '',
};

/** Category ids for report-problem UI (same range as API). */
export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [1, 2, 3, 4, 5];

/** Priority ids for report-problem UI (same range as API). */
export const COMPLAINT_PRIORITIES: ComplaintPriority[] = [1, 2, 3, 4];

/** Allowed image MIME types for complaint attachments. */
export const COMPLAINT_ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
] as const;

/** Max size per attachment (bytes). */
export const COMPLAINT_MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Max number of attachments per complaint. */
export const COMPLAINT_MAX_ATTACHMENTS = 5;

/** Value for `<input type="file" accept={...} />` on complaint forms. */
export const COMPLAINT_ACCEPT_ATTRIBUTE =
    COMPLAINT_ACCEPTED_IMAGE_TYPES.join(',');
