/**
 * Working hours related type definitions
 */

/**
 * Working hours time slot (from-to time range)
 */
export interface WorkingHoursTimeSlot {
    /** Start time in "HH:mm" format (e.g., "09:00") */
    from: string;
    /** End time in "HH:mm" format (e.g., "22:00") */
    to: string;
}

/**
 * Working hours days structure matching API response
 */
export interface BranchWorkingHoursDays {
    saturday: WorkingHoursTimeSlot[];
    sunday: WorkingHoursTimeSlot[];
    monday: WorkingHoursTimeSlot[];
    tuesday: WorkingHoursTimeSlot[];
    wednesday: WorkingHoursTimeSlot[];
    thursday: WorkingHoursTimeSlot[];
    friday: WorkingHoursTimeSlot[];
}

/**
 * Branch working hours structure matching API response
 */
export interface BranchWorkingHours {
    id: number;
    name: string;
    description: string;
    days: BranchWorkingHoursDays;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Working hours schedule item for display in modal
 * This is a utility type used for formatting working hours for display
 */
export interface WorkingHoursSchedule {
    day: string;
    hours: string[];
    closed?: boolean;
}

