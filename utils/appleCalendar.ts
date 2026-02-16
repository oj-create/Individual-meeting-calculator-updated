import ICAL from 'ical.js';

export interface CalendarEvent {
    id: string;
    summary: string;
    start: {
        dateTime: string;
        timeZone?: string;
    };
    end: {
        dateTime: string;
        timeZone?: string;
    };
    attendees?: {
        email?: string;
        responseStatus?: string;
    }[];
    durationMinutes: number;
}

export const parseICSFile = async (file: File): Promise<CalendarEvent[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                if (!content) {
                    reject(new Error("File is empty"));
                    return;
                }

                const jcalData = ICAL.parse(content);
                const comp = new ICAL.Component(jcalData);
                const vevents = comp.getAllSubcomponents('vevent');

                const events: CalendarEvent[] = vevents.map((vevent: any) => {
                    const event = new ICAL.Event(vevent);

                    const summary = event.summary || 'No Title';
                    const startDate = event.startDate;
                    const endDate = event.endDate;
                    const duration = event.duration;

                    // Convert ICAL time to JS Date then to ISO string
                    const startDateTime = startDate.toJSDate().toISOString();
                    const endDateTime = endDate.toJSDate().toISOString();

                    // Calculate duration in minutes if not explicitly provided (though usually calculated from start/end)
                    const durationMinutes = (new Date(endDateTime).getTime() - new Date(startDateTime).getTime()) / (1000 * 60);

                    // Attendees
                    const attendees = vevent.getAllProperties('attendee').map((attendeeProp: any) => {
                        // Basic extraction, often just mailto
                        const mailto = attendeeProp.getFirstValue();
                        return {
                            email: mailto ? mailto.replace('mailto:', '') : 'unknown',
                            responseStatus: 'accepted' // Defaulting as ICS export doesn't always have status easily accessible in simple view
                        };
                    });

                    return {
                        id: event.uid || Math.random().toString(36).substr(2, 9),
                        summary,
                        start: { dateTime: startDateTime },
                        end: { dateTime: endDateTime },
                        attendees,
                        durationMinutes
                    };
                });

                resolve(events);

            } catch (err) {
                console.error("Error parsing ICS file:", err);
                reject(new Error("Failed to parse calendar file. Please ensure it is a valid .ics file."));
            }
        };

        reader.onerror = () => {
            reject(new Error("Failed to read file"));
        };

        reader.readAsText(file);
    });
};
