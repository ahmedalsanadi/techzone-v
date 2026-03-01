/**
 * Shared layout and styling for report-problem form sections.
 */

import type { ComplaintCategory, ComplaintPriority } from '@/types/complaints';

export const CATEGORIES: ComplaintCategory[] = [1, 2, 3, 4, 5];
export const PRIORITIES: ComplaintPriority[] = [1, 2, 3, 4];

/** Card wrapper for each form section (category, priority, subject, description, attachments). */
export const SECTION_CARD_CLASS =
    'bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100';

/**
 * Container styling for the Subject Input only.
 * Input applies this to its single bordered container div (no extra wrapper), so one border.
 * Do NOT use for Textarea: Textarea’s wrapper would get a border while the inner <textarea>
 * already has its own border → double border.
 */
export const COMPLAINT_INPUT_CONTAINER =
    'rounded-xl border-gray-200 bg-gray-50 min-h-[48px] px-4 focus-within:border-theme-primary focus-within:ring-2 focus-within:ring-theme-primary/20 shadow-none';
