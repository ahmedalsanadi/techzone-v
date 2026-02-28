/**
 * Contact message API types (store/contact-messages)
 * Available values for channel: 1=form, 2=whatsapp, 3=phone, 4=email
 */

export type ContactChannelValue = 1 | 2 | 3 | 4;

export interface ContactChannelOption {
    value: ContactChannelValue;
    name: string;
    label: string;
    description?: string;
    icon?: string;
    color?: string;
}

export interface ContactStatusOption {
    value: number;
    name: string;
    label: string;
    description?: string;
    icon?: string;
    color?: string;
}

export interface ContactMessageRecord {
    id: number;
    branch_id: number | null;
    customer_id: number | null;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    channel: ContactChannelOption;
    status: ContactStatusOption;
    created_at: string;
}

/** Request body for POST /store/contact-messages */
export interface SendContactMessageRequest {
    name: string;
    email?: string;
    phone?: string;
    subject: string;
    message: string;
    channel?: ContactChannelValue;
}

/** Form/UI shape for contact message; same as request, used by hooks and components. */
export type ContactFormValues = SendContactMessageRequest;
