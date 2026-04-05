import { z } from 'zod';

/** POST /store/complaints: category 1–5, priority 1–4 (default 2); subject & description trimmed. */
export const complaintSchema = z.object({
    category: z.number().int().min(1).max(5),
    priority: z.number().int().min(1).max(4).optional().default(2),
    subject: z.string().trim().min(1, 'required').min(3, 'subjectMin'),
    description: z.string().trim().min(1, 'required').min(10, 'descriptionMin'),
});
