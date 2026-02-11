import { describe, it, expect } from 'vitest';
import { calculateMeetingStats, CalendarEvent } from './calculator';

describe('calculateMeetingStats', () => {
    const hourlyRate = 100;
    const periodDays = 30;

    it('should return zero stats for empty events', () => {
        const result = calculateMeetingStats([], hourlyRate, periodDays);
        expect(result.totalMeetings).toBe(0);
        expect(result.totalHours).toBe(0);
        expect(result.totalCost).toBe(0);
    });

    it('should calculate cost for a single valid meeting with 2 attendees', () => {
        const events: CalendarEvent[] = [{
            start: { dateTime: '2023-01-01T10:00:00Z' },
            end: { dateTime: '2023-01-01T11:00:00Z' }, // 1 hour
            attendees: [{}, {}] // 2 attendees
        }];
        const result = calculateMeetingStats(events, hourlyRate, periodDays);
        expect(result.totalMeetings).toBe(1);
        expect(result.totalHours).toBe(1);
        expect(result.totalCost).toBe(100);
    });

    it('should filter out meetings with only 1 attendee (likely focus time)', () => {
        const events: CalendarEvent[] = [{
            start: { dateTime: '2023-01-01T10:00:00Z' },
            end: { dateTime: '2023-01-01T11:00:00Z' }, // 1 hour
            attendees: [{}] // 1 attendee
        }];
        const result = calculateMeetingStats(events, hourlyRate, periodDays);
        expect(result.totalMeetings).toBe(0);
        expect(result.totalHours).toBe(0);
    });

    it('should default to 0 attendees if missing and filter out', () => {
        const events: CalendarEvent[] = [{
            start: { dateTime: '2023-01-01T10:00:00Z' },
            end: { dateTime: '2023-01-01T11:00:00Z' }
            // No attendees
        }];
        const result = calculateMeetingStats(events, hourlyRate, periodDays);
        expect(result.totalMeetings).toBe(0);
    });

    it('should filter out all-day events (no dateTime)', () => {
        const events: CalendarEvent[] = [{
            start: { date: '2023-01-01' },
            end: { date: '2023-01-02' },
            attendees: [{}, {}]
        }];
        const result = calculateMeetingStats(events, hourlyRate, periodDays);
        expect(result.totalMeetings).toBe(0);
    });

    it('should filter out meetings longer than 8 hours', () => {
        const events: CalendarEvent[] = [{
            start: { dateTime: '2023-01-01T09:00:00Z' },
            end: { dateTime: '2023-01-01T18:00:00Z' }, // 9 hours
            attendees: [{}, {}]
        }];
        const result = calculateMeetingStats(events, hourlyRate, periodDays);
        expect(result.totalMeetings).toBe(0);
    });

    it('should calculate people hours correctly with attendees', () => {
        const events: CalendarEvent[] = [{
            start: { dateTime: '2023-01-01T10:00:00Z' },
            end: { dateTime: '2023-01-01T11:00:00Z' }, // 1 hour
            attendees: [{}, {}, {}] // 3 attendees
        }];
        const result = calculateMeetingStats(events, hourlyRate, periodDays);
        expect(result.totalPeopleHours).toBe(3);
    });

    it('should handle empty attendees array as 0 people', () => {
        const events: CalendarEvent[] = [{
            start: { dateTime: '2023-01-01T10:00:00Z' },
            end: { dateTime: '2023-01-01T11:00:00Z' },
            attendees: []
        }];
        const result = calculateMeetingStats(events, hourlyRate, periodDays);
        expect(result.totalPeopleHours).toBe(0);
    });
});
