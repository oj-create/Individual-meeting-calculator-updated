import React from 'react';
import { Filter, Clock, Users, User, CalendarDays } from 'lucide-react';

interface FilterControlsProps {
    periodDays: number;
    onPeriodChange: (days: number) => void;
    minAttendees: number;
    onMinAttendeesChange: (num: number) => void;
    specificParticipant: string;
    onSpecificParticipantChange: (name: string) => void;
    workHoursOnly: boolean;
    onWorkHoursChange: (enabled: boolean) => void;
    totalEvents: number;
    filteredEvents: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
    periodDays,
    onPeriodChange,
    minAttendees,
    onMinAttendeesChange,
    specificParticipant,
    onSpecificParticipantChange,
    workHoursOnly,
    onWorkHoursChange,
    totalEvents,
    filteredEvents
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 animate-fade-in-up">
            <div className="flex items-center space-x-2 mb-4 border-b border-slate-100 pb-4">
                <Filter className="w-5 h-5 text-[#814fdc]" />
                <h3 className="text-lg font-bold text-slate-900">Filter Meetings</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 ml-auto">
                    Showing {filteredEvents} of {totalEvents} events
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* 1. Time Range */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center">
                        <CalendarDays className="w-3 h-3 mr-1" /> Time Range
                    </label>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        {[7, 14, 30, 90].map((days) => (
                            <button
                                key={days}
                                onClick={() => onPeriodChange(days)}
                                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-all ${periodDays === days
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                    }`}
                            >
                                {days}d
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Min Attendees */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center">
                        <Users className="w-3 h-3 mr-1" /> Min Attendees
                    </label>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        {[1, 2, 3, 5].map((num) => (
                            <button
                                key={num}
                                onClick={() => onMinAttendeesChange(num)}
                                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-all ${minAttendees === num
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                    }`}
                            >
                                {num === 1 ? 'All' : `${num}+`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Specific Participant */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center">
                        <User className="w-3 h-3 mr-1" /> Specific Person
                    </label>
                    <input
                        type="text"
                        value={specificParticipant}
                        onChange={(e) => onSpecificParticipantChange(e.target.value)}
                        placeholder="Search name or email..."
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-[#814fdc] focus:ring-2 focus:ring-[#814fdc]/20 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* 4. Work Hours Toggle */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> Work Hours
                    </label>
                    <button
                        onClick={() => onWorkHoursChange(!workHoursOnly)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-sm group ${workHoursOnly
                                ? 'bg-[#814fdc]/5 border-[#814fdc] text-[#814fdc]'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                    >
                        <span className="font-medium">9 AM - 6 PM (M-F)</span>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${workHoursOnly ? 'bg-[#814fdc]' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${workHoursOnly ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                    </button>
                </div>

            </div>
        </div>
    );
};
