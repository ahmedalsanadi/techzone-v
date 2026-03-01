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
    /** Max 5 files; jpg, jpeg, png, webp, gif; max 5MB each. */
    attachments?: File[];
}

/** Form values for the complaint form; same shape for hooks and components. */
export type ComplaintFormValues = Omit<CreateComplaintRequest, 'attachments'> & {
    attachments?: FileList | File[];
};
