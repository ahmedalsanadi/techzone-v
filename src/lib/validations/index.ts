import { z } from 'zod';

/** Minimum phone length; reuse in schema and handlers. */
export const PHONE_MIN_LENGTH = 9;

export const phoneSchema = z.object({
    phone: z.string().min(PHONE_MIN_LENGTH, 'phoneMin'),
});

export const otpSchema = z.object({
    otp: z.string().length(4, 'otpLength'),
});

export const profileSchema = z.object({
    first_name: z.string().min(1, 'firstNameRequired'),
    middle_name: z.string().optional().nullable(),
    last_name: z.string().min(1, 'lastNameRequired'),
    email: z.string().email('invalidEmail').optional().or(z.literal('')),
});

export const addressSchema = z.object({
    label: z.string().min(1, 'required'),
    city_id: z.number().min(1, 'cityRequired'),
    district_id: z.number().optional().nullable(),
    street: z.string().min(1, 'streetRequired'),
    building_number: z.string().min(1, 'buildingRequired'),
    unit_number: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
    additional_number: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    phone: z.string().min(PHONE_MIN_LENGTH, 'phoneMin'),
    recipient_name: z.string().min(1, 'required'),
});

/** Contact form: name required; at least one of email or phone; subject & message required; channel optional (default 1). */
export const contactSchema = z
    .object({
        name: z.string().min(1, 'nameRequired'),
        email: z.string().email('invalidEmail').optional().or(z.literal('')),
        phone: z.string().min(9, 'phoneMin').optional().or(z.literal('')),
        subject: z.string().min(3, 'subjectMin'),
        message: z.string().min(10, 'messageMin'),
        channel: z.number().int().min(1).max(4).optional().default(1),
    })
    .refine(
        (data) => {
            const hasEmail = !!data.email?.trim();
            const hasPhone = !!data.phone?.trim();
            return hasEmail || hasPhone;
        },
        { message: 'emailOrPhoneRequired', path: ['email'] },
    );

/** Complaints API: category 1–5, priority 1–4 optional; subject & description trimmed and required; attachments validated in form. */
export const complaintSchema = z.object({
    category: z.number().int().min(1).max(5),
    priority: z.number().int().min(1).max(4).optional().default(2),
    subject: z.string().trim().min(1, 'required').min(3, 'subjectMin'),
    description: z.string().trim().min(1, 'required').min(10, 'descriptionMin'),
});
