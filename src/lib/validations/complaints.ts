import { z } from 'zod';
import {
    COMPLAINT_CATEGORY_VALUES,
    COMPLAINT_DEFAULT_PRIORITY,
    COMPLAINT_PRIORITY_VALUES,
} from '@/constants/complaints';

const categoryMin = Math.min(...COMPLAINT_CATEGORY_VALUES);
const categoryMax = Math.max(...COMPLAINT_CATEGORY_VALUES);
const priorityMin = Math.min(...COMPLAINT_PRIORITY_VALUES);
const priorityMax = Math.max(...COMPLAINT_PRIORITY_VALUES);

/** POST /store/complaints — bounds follow `@/constants/complaints` tuples. */
export const complaintSchema = z.object({
    category: z.number().int().min(categoryMin).max(categoryMax),
    priority: z
        .number()
        .int()
        .min(priorityMin)
        .max(priorityMax)
        .optional()
        .default(COMPLAINT_DEFAULT_PRIORITY),
    subject: z.string().trim().min(1, 'required').min(3, 'subjectMin'),
    description: z.string().trim().min(1, 'required').min(10, 'descriptionMin'),
});
