/**
 * Mutation hook for sending contact messages via POST /store/contact-messages.
 */

import { useMutation } from '@tanstack/react-query';
import { contactService } from '@/services/contact-services';
import type {
    SendContactMessageRequest,
    ContactFormValues,
} from '@/types/contacts';
import { getApiErrorMessage } from '@/lib/api';

export const contactMessagesKey = ['store', 'contact-messages'] as const;

function toRequestBody(values: ContactFormValues): SendContactMessageRequest {
    const payload: SendContactMessageRequest = {
        name: values.name.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
        channel: values.channel ?? 1,
    };
    const email = values.email?.trim();
    const phone = values.phone?.trim();
    if (email) payload.email = email;
    if (phone) payload.phone = phone;
    return payload;
}

export function useSendContactMessage() {
    return useMutation({
        mutationKey: [...contactMessagesKey, 'send'],
        mutationFn: async (values: ContactFormValues) => {
            const body = toRequestBody(values);
            return contactService.sendContactMessage(body);
        },
    });
}

/** Extract user-facing error message for contact form (toast / inline). */
export function getContactErrorMessage(error: unknown, fallback: string): string {
    return getApiErrorMessage(error, fallback);
}
