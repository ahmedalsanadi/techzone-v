/**
 * Service for complaint-related API calls (create complaint).
 */

import { fetchLibero } from '@/lib/api';
import {
    type CreateComplaintRequest,
    type CreateComplaintResponse,
    COMPLAINT_ACCEPTED_IMAGE_TYPES,
    COMPLAINT_MAX_ATTACHMENTS,
    COMPLAINT_MAX_FILE_SIZE,
} from '@/types/complaints';

/** Shared validation: accepted image type (form + multipart build). */
export function isAcceptedComplaintAttachment(file: File): boolean {
    const types = COMPLAINT_ACCEPTED_IMAGE_TYPES as readonly string[];
    if (types.includes(file.type)) return true;
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
    const valid = files.slice(0, COMPLAINT_MAX_ATTACHMENTS).filter((file) => {
        if (!(file instanceof File)) return false;
        if (file.size > COMPLAINT_MAX_FILE_SIZE) return false;
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
        return fetchLibero<CreateComplaintResponse>('/store/complaints', {
            method: 'POST',
            body,
            cache: 'no-store',
            isProtected: true,
        });
    },
};
