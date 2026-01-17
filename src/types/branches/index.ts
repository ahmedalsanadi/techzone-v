/**
 * Branch-related types
 * 
 * This module exports all branch-related type definitions including:
 * - Branch interface and related types
 * - Working hours types
 * - Support channels and addresses
 */

export type {
    Branch,
    BranchSupportChannel,
    BranchAddress,
    BranchServices,
    BranchSettings,
} from './branch.types';

export type {
    BranchWorkingHours,
    BranchWorkingHoursDays,
    WorkingHoursTimeSlot,
    WorkingHoursSchedule,
} from './working-hours.types';
