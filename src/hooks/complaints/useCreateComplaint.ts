/**
 * Mutation hook for creating a complaint via POST /store/complaints.
 * Use getApiErrorMessage from @/lib/api for error messages in the UI.
 */

import { useMutation } from '@tanstack/react-query';
import { complaintService } from '@/services/complaint-services';
import type { CreateComplaintRequest } from '@/types/complaints';

export const complaintsKey = ['store', 'complaints'] as const;

export function useCreateComplaint() {
    return useMutation({
        mutationKey: [...complaintsKey, 'create'],
        mutationFn: (payload: CreateComplaintRequest) =>
            complaintService.createComplaint(payload),
    });
}
