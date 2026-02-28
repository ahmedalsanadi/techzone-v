/**
 * Service for contact-related API calls (contact form, messages).
 */

import { fetchLibero } from '@/lib/api';
import type {
    SendContactMessageRequest,
    ContactMessageRecord,
} from '@/types/contacts';

export const contactService = {
    /**
     * Send a contact message (guest or authenticated).
     * POST /store/contact-messages
     */
    sendContactMessage: (data: SendContactMessageRequest) =>
        fetchLibero<ContactMessageRecord>('/store/contact-messages', {
            method: 'POST',
            body: JSON.stringify({
                ...data,
                channel: data.channel ?? 1,
            }),
            cache: 'no-store',
        }),
};
