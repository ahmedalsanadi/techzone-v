import {
    COMPLAINT_CATEGORY_VALUES,
    COMPLAINT_DEFAULT_PRIORITY,
} from '@/constants/complaints';
import type { ComplaintFormValues } from '@/types/complaints';

export const defaultComplaintFormValues: ComplaintFormValues = {
    category: COMPLAINT_CATEGORY_VALUES[0],
    priority: COMPLAINT_DEFAULT_PRIORITY,
    subject: '',
    description: '',
};
