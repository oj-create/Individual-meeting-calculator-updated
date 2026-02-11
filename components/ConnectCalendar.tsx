import React from 'react';
import { Calendar, DollarSign, ArrowRight, ShieldCheck } from 'lucide-react';

interface ConnectCalendarProps {
    onConnect: () => void;
    isLoading: boolean;
    hourlyRate: number | string;
    setHourlyRate: (rate: number | string) => void;
}

export const ConnectCalendar: React.FC<ConnectCalendarProps> = ({
    onConnect,
    isLoading,
    hourlyRate,
    setHourlyRate
}) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-md w-full mx-auto mb-12 relative group hover:shadow-xl transition-all duration-300 transform">
            <div className="bg-slate-900 p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-[#814fdc]/20 p-2 rounded-lg">
                        <Calendar className="w-6 h-6 text-[#814fdc]" />
                    </div>
                    <h2 className="text-white font-bold text-lg">Individual Audit</h2>
                </div>
                <div className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Private
                </div>
            </div>

            <div className="p-8">
                <p className="text-slate-600 mb-8 text-sm leading-relaxed font-medium">
                    Connect your calendar to get a full breakdown of your meetings in the last <span className="font-bold text-slate-900">30 days</span>, and what it costs.
                </p>

                <div className="space-y-4 mb-8">
                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                        <DollarSign className="w-3 h-3" />
                        <span>Your Hourly Rate (Est.)</span>
                    </label>
                    <div className="relative group/input">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-400 font-bold">$</span>
                        </div>
                        <input
                            type="number"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            className="block w-full pl-8 pr-3 py-3 border-2 border-slate-200 rounded-lg focus:border-[#814fdc] outline-none transition-colors text-slate-900 font-bold bg-slate-50 focus:bg-white text-lg"
                            placeholder="50"
                        />
                    </div>
                </div>

                <button
                    onClick={onConnect}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-between py-4 px-6 rounded-lg text-sm font-bold text-white shadow-md transition-all ${isLoading
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-[#814fdc] hover:bg-[#6b3dbd] hover:shadow-lg transform hover:-translate-y-0.5'
                        }`}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center w-full">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Auditing Calendar...
                        </span>
                    ) : (
                        <>
                            <span>Connect Google Calendar</span>
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-center space-x-2 text-slate-500">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <p className="text-xs font-semibold">
                    100% Private. Read-only access. We do not store your data.
                </p>
            </div>
        </div>
    );
};
