export interface CalendarEvent {
    summary?: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    attendees?: any[];
}

export interface CalculationResult {
    totalMeetings: number;
    totalHours: number;
    averageDurationMinutes: number;
    totalCost: number;
    meetingsPerWeek: number;
    hoursPerWeek: number;
    periodDays: number;
    averageAttendees: number;
    totalPeopleHours: number;
}

export interface FilterOptions {
    minAttendees: number;
    specificParticipant?: string;
    workHoursOnly: boolean; // 9am - 6pm (Mon-Fri)
}

export const calculateMeetingStats = (
    events: CalendarEvent[],
    hourlyRate: number,
    periodDays: number,
    filters: FilterOptions = { minAttendees: 2, workHoursOnly: false }
): CalculationResult => {
    let totalMinutes = 0;
    let totalMeetings = 0;

    events.forEach(event => {
        if (event.start.dateTime && event.end.dateTime) {
            const start = new Date(event.start.dateTime);
            const end = new Date(event.end.dateTime);
            const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes

            // 1. Participant Count Filter
            const attendeeCount = event.attendees ? event.attendees.length : 1; // Default to 1 if no attendees (self)

            // 2. Specific Participant Filter
            let hasSpecificParticipant = true;
            if (filters.specificParticipant && filters.specificParticipant.trim() !== '') {
                const search = filters.specificParticipant.toLowerCase();
                const attendees = event.attendees || [];
                // Check if any attendee email or displayName matches the search string
                // Also check creator/organizer if available (but simplistic interface here only has attendees)
                // We'll rely on attendees list for now.
                const match = attendees.some((a: any) =>
                    (a.email && a.email.toLowerCase().includes(search)) ||
                    (a.displayName && a.displayName.toLowerCase().includes(search))
                );

                // If it's a 1:1 with that person, OR they are in the group
                hasSpecificParticipant = match;
            }

            // 3. Work Hours Filter (Mon-Fri, 9am-6pm)
            let isWorkHours = true;
            if (filters.workHoursOnly) {
                const day = start.getDay();
                const hour = start.getHours();
                const isWeekend = day === 0 || day === 6;
                const isOutsideHours = hour < 9 || hour >= 18; // 9:00 - 18:00
                if (isWeekend || isOutsideHours) {
                    isWorkHours = false;
                }
            }

            // Apply all filters
            if (
                duration > 0 &&
                duration < 480 &&
                attendeeCount >= filters.minAttendees &&
                hasSpecificParticipant &&
                isWorkHours
            ) {
                totalMinutes += duration;
                totalMeetings++;
            }
        }
    });

    const totalHours = totalMinutes / 60;
    const totalCost = totalHours * hourlyRate;

    // Weekly averages
    const weeks = periodDays / 7;
    const meetingsPerWeek = totalMeetings / weeks;
    const hoursPerWeek = totalHours / weeks;
    const averageDurationMinutes = totalMeetings > 0 ? totalMinutes / totalMeetings : 0;

    // Additional metrics for detailed report
    let totalPeopleHours = 0;
    let totalAttendees = 0;
    let meetingsWithAttendees = 0;

    events.forEach(event => {
        if (event.start.dateTime && event.end.dateTime) {
            const start = new Date(event.start.dateTime);
            const end = new Date(event.end.dateTime);
            const duration = (end.getTime() - start.getTime()) / (1000 * 60);

            // Re-apply filters for consistency in detailed metrics
            const attendeeCount = event.attendees ? event.attendees.length : 1;

            let hasSpecificParticipant = true;
            if (filters.specificParticipant && filters.specificParticipant.trim() !== '') {
                const search = filters.specificParticipant.toLowerCase();
                const attendees = event.attendees || [];
                hasSpecificParticipant = attendees.some((a: any) =>
                    (a.email && a.email.toLowerCase().includes(search)) ||
                    (a.displayName && a.displayName.toLowerCase().includes(search))
                );
            }

            let isWorkHours = true;
            if (filters.workHoursOnly) {
                const day = start.getDay();
                const hour = start.getHours();
                const isWeekend = day === 0 || day === 6;
                const isOutsideHours = hour < 9 || hour >= 18;
                if (isWeekend || isOutsideHours) {
                    isWorkHours = false;
                }
            }

            if (
                duration > 0 &&
                duration < 480 &&
                attendeeCount >= filters.minAttendees &&
                hasSpecificParticipant &&
                isWorkHours
            ) {
                totalPeopleHours += (duration / 60) * attendeeCount;

                if (event.attendees && event.attendees.length > 0) {
                    totalAttendees += event.attendees.length;
                    meetingsWithAttendees++;
                }
            }
        }
    });

    // Fallback if no attendee data (common in some calendar permissions)
    const averageAttendees = meetingsWithAttendees > 0 ? Math.round(totalAttendees / meetingsWithAttendees) : 1;

    return {
        totalMeetings,
        totalHours,
        averageDurationMinutes,
        totalCost,
        meetingsPerWeek,
        hoursPerWeek,
        periodDays,
        averageAttendees,
        totalPeopleHours
    };
};
