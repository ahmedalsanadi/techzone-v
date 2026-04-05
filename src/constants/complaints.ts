
/** POST /store/complaints — allowed category ids (single source for schema + UI). */
export const COMPLAINT_CATEGORY_VALUES = [1, 2, 3, 4, 5] as const;

/** Allowed priority ids (single source for schema + UI). */
export const COMPLAINT_PRIORITY_VALUES = [1, 2, 3, 4] as const;

/** API default when priority is omitted (must be in COMPLAINT_PRIORITY_VALUES). */
export const COMPLAINT_DEFAULT_PRIORITY = 2 satisfies (typeof COMPLAINT_PRIORITY_VALUES)[number];

/** Allowed image MIME types for complaint attachments. */
export const COMPLAINT_ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
] as const;

/** Max size per attachment (bytes). */
export const COMPLAINT_MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Max attachments per complaint. */
export const COMPLAINT_MAX_ATTACHMENTS = 5;

/** `accept` attribute for complaint file inputs. */
export const COMPLAINT_ACCEPT_ATTRIBUTE =
    COMPLAINT_ACCEPTED_IMAGE_TYPES.join(',');
