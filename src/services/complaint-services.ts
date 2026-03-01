/**
 * Service for complaint-related API calls (create complaint).
 */

import { fetchLibero } from '@/lib/api';
import type { CreateComplaintRequest } from '@/types/complaints';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ATTACHMENTS = 5;

/** Single source of truth for accept attribute on file inputs. */
const COMPLAINT_ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(',');

/** Shared validation: whether a file is an accepted image type (used by form and buildFormData). */
export function isAcceptedComplaintAttachment(file: File): boolean {
    if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return true;
    if (!file.type && file.name) return /\.(jpe?g|png|webp|gif)$/i.test(file.name);
    return file.type.startsWith('image/');
}

function buildFormData(payload: CreateComplaintRequest): FormData {
    const form = new FormData();
    form.append('category', String(payload.category));
    form.append('priority', String(payload.priority ?? 2));
    form.append('subject', payload.subject.trim());
    form.append('description', payload.description.trim());

    if (payload.complainable_type && payload.complainable_id != null) {
        form.append('complainable_type', payload.complainable_type);
        form.append('complainable_id', String(payload.complainable_id));
    }

    const files = payload.attachments?.filter(Boolean) ?? [];
    const valid = files.slice(0, MAX_ATTACHMENTS).filter((file) => {
        if (!(file instanceof File)) return false;
        if (file.size > MAX_FILE_SIZE) return false;
        return isAcceptedComplaintAttachment(file);
    });
    valid.forEach((file) => form.append('attachments[]', file));

    return form;
}

export const complaintService = {
    /**
     * Create a complaint. POST /store/complaints (multipart/form-data).
     * Auth required.
     */
    createComplaint: (data: CreateComplaintRequest) => {
        const body = buildFormData(data);
        return fetchLibero<{ id?: number; message?: string }>('/store/complaints', {
            method: 'POST',
            body,
            cache: 'no-store',
            isProtected: true,
        });
    },
};

export {
    MAX_ATTACHMENTS,
    MAX_FILE_SIZE,
    ACCEPTED_IMAGE_TYPES,
    COMPLAINT_ACCEPT_ATTRIBUTE,
};
