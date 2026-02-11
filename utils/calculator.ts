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

export const calculateMeetingStats = (events: CalendarEvent[], hourlyRate: number, periodDays: number): CalculationResult => {
    let totalMinutes = 0;
    let totalMeetings = 0;

    events.forEach(event => {
        // frequent 'all day' events might just have dates, ignore or count as 8h? 
        // Usually meeting calculator focuses on actual scheduled time.
        // Let's focus on dateTime events which are meetings.
        if (event.start.dateTime && event.end.dateTime) {
            const start = new Date(event.start.dateTime);
            const end = new Date(event.end.dateTime);
            const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes

            // Filter out weirdly long events (e.g. > 8 hours) possibly OOO or blocking
            // Filter out meetings with fewer than 2 attendees (solo work/focus time)
            const attendeeCount = event.attendees ? event.attendees.length : 0;
            if (duration > 0 && duration < 480 && attendeeCount >= 2) {
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

            if (duration > 0 && duration < 480) {
                const attendeeCount = event.attendees ? event.attendees.length : 1; // Assume 1 (self) if no attendees listed? Or 0? Usually self + others.
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
