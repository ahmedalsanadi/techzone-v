/**
 * Branch utility functions for calculating status, formatting data, etc.
 */

import type {
    Branch,
    BranchWorkingHours,
    WorkingHoursTimeSlot,
    WorkingHoursSchedule,
} from '@/types/branches';

/**
 * Day name mapping for JavaScript Date.getDay()
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
const DAY_NAMES = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
] as const;

type DayName = (typeof DAY_NAMES)[number];

/**
 * Parse time string (HH:mm) to minutes since midnight
 * @param timeString - Time in "HH:mm" format
 * @returns Minutes since midnight, or null if invalid
 */
function parseTimeToMinutes(timeString: string): number | null {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (
        isNaN(hours) ||
        isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return null;
    }
    return hours * 60 + minutes;
}

/**
 * Check if current time falls within a time slot
 * @param currentMinutes - Current time in minutes since midnight
 * @param slot - Time slot to check
 * @returns true if current time is within the slot
 */
function isTimeInSlot(
    currentMinutes: number,
    slot: WorkingHoursTimeSlot,
): boolean {
    const fromMinutes = parseTimeToMinutes(slot.from);
    const toMinutes = parseTimeToMinutes(slot.to);

    if (fromMinutes === null || toMinutes === null) {
        return false;
    }

    // Handle time slots that span midnight (e.g., 22:00 to 02:00)
    if (fromMinutes > toMinutes) {
        return currentMinutes >= fromMinutes || currentMinutes <= toMinutes;
    }

    return currentMinutes >= fromMinutes && currentMinutes <= toMinutes;
}

/**
 * Calculate if a branch is currently open based on working hours
 * @param branch - Branch object with working_hours
 * @returns true if branch is currently open, false otherwise
 */
export function calculateBranchIsOpen(branch: Branch): boolean {
    // If branch is inactive, it's closed
    if (!branch.working_hours?.is_active) {
        return false;
    }

    // If branch status is inactive, it's closed
    if (branch.status !== 1) {
        return false;
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const dayName = DAY_NAMES[currentDay] as DayName;

    // Get working hours for current day
    const dayHours = branch.working_hours.days[dayName];

    // If no hours defined for this day, branch is closed
    if (!dayHours || dayHours.length === 0) {
        return false;
    }

    // Get current time in minutes since midnight
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Check if current time falls within any time slot for this day
    return dayHours.some((slot) => isTimeInSlot(currentMinutes, slot));
}

/**
 * Format time string from "HH:mm" to readable format (e.g., "9 am - 10 pm")
 * @param from - Start time in "HH:mm" format
 * @param to - End time in "HH:mm" format
 * @returns Formatted time string
 */
function formatTimeRange(from: string, to: string): string {
    const [fromHours, fromMinutes] = from.split(':').map(Number);
    const [toHours, toMinutes] = to.split(':').map(Number);

    const formatTime = (hours: number, minutes: number): string => {
        const period = hours >= 12 ? 'pm' : 'am';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        const displayMinutes = minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : '';
        return `${displayHours}${displayMinutes} ${period}`;
    };

    return `${formatTime(fromHours, fromMinutes)} - ${formatTime(toHours, toMinutes)}`;
}

/**
 * Convert API working hours days structure to format expected by WorkingHoursModal
 * @param workingHours - Branch working hours from API
 * @returns Array of schedule items for display
 */
export function formatWorkingHoursDays(
    workingHours: BranchWorkingHours,
): WorkingHoursSchedule[] {
    const dayOrder: DayName[] = [
        'saturday',
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
    ];

    return dayOrder.map((dayName) => {
        const dayHours = workingHours.days[dayName];

        // If no hours or empty array, day is closed
        if (!dayHours || dayHours.length === 0) {
            return {
                day: dayName.charAt(0).toUpperCase() + dayName.slice(1), // Capitalize first letter
                hours: ['Closed'],
                closed: true,
            };
        }

        // Format each time slot
        const formattedHours = dayHours.map((slot) =>
            formatTimeRange(slot.from, slot.to),
        );

        return {
            day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            hours: formattedHours,
            closed: false,
        };
    });
}

/**
 * Get localized status label for branch
 * Note: This function requires translations to be passed or accessed via hook
 * For now, returns English labels. Components should use translations directly.
 * @param branch - Branch object
 * @returns Status label string
 */
export function getBranchStatusLabel(branch: Branch): string {
    // Calculate if open
    const isOpen = calculateBranchIsOpen(branch);

    // If branch status is inactive, return closed
    if (branch.status !== 1) {
        return branch.status_label || 'Closed';
    }

    // Return based on calculated is_open
    return isOpen ? 'Open' : 'Closed';
}

/**
 * Get next opening time for a closed branch
 * @param branch - Branch object
 * @returns Date of next opening time, or null if no future opening
 */
export function getNextOpeningTime(branch: Branch): Date | null {
    if (!branch.working_hours?.is_active || branch.status !== 1) {
        return null;
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Check next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const checkDay = (currentDay + dayOffset) % 7;
        const dayName = DAY_NAMES[checkDay] as DayName;
        const dayHours = branch.working_hours.days[dayName];

        if (!dayHours || dayHours.length === 0) {
            continue;
        }

        for (const slot of dayHours) {
            const fromMinutes = parseTimeToMinutes(slot.from);
            if (fromMinutes === null) continue;

            if (dayOffset === 0) {
                // Today - check if slot is in the future
                if (currentMinutes < fromMinutes) {
                    const result = new Date(now);
                    result.setHours(Math.floor(fromMinutes / 60));
                    result.setMinutes(fromMinutes % 60);
                    result.setSeconds(0);
                    result.setMilliseconds(0);
                    return result;
                }
            } else {
                // Future day - return first slot of that day
                const result = new Date(now);
                result.setDate(result.getDate() + dayOffset);
                result.setHours(Math.floor(fromMinutes / 60));
                result.setMinutes(fromMinutes % 60);
                result.setSeconds(0);
                result.setMilliseconds(0);
                return result;
            }
        }
    }

    return null;
}
