import { z } from 'zod';

export const phoneSchema = z.object({
    phone: z.string().min(9, 'phoneMin'),
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
    phone: z.string().min(9, 'phoneMin'),
    recipient_name: z.string().min(1, 'required'),
});

export const contactSchema = z.object({
    email: z.string().email('invalidEmail'),
    subject: z.string().min(3, 'subjectMin'),
    message: z.string().min(10, 'messageMin'),
});

export const reportProblemSchema = z.object({
    problem_type: z.string().min(1, 'problemTypeRequired'),
    description: z.string().min(10, 'descriptionMin'),
});
