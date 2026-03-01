/**
 * Form shape for the report-problem flow. Shared by ReportProblemForm and field components.
 */

export type ComplaintFormValues = {
    category: number;
    priority: number;
    subject: string;
    description: string;
};

export const defaultComplaintFormValues: ComplaintFormValues = {
    category: 1,
    priority: 2,
    subject: '',
    description: '',
};
