import React from 'react';
import type { CalculationResult } from '../utils/calculator';
import { Clock, Users, DollarSign, CalendarCheck, AlertTriangle, Brain, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ResultsDisplayProps {
    results: CalculationResult;
    onReset: () => void;
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(val);
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onReset }) => {
    // Determine wasted hours vs productive hours (assuming 40h work week)
    const workHours = Math.max(0, 40 - results.hoursPerWeek);

    // Distraction Tax: 23 mins per meeting
    const distractionHoursPerWeek = (results.meetingsPerWeek * 23) / 60;
    const districtionCostAnnual = distractionHoursPerWeek * (results.totalCost / results.totalHours) * 52; // annualized approximation based on rate
    // Note: totalCost in results is for the period (30 days). We should extrapolate.
    const weeklyCost = results.totalCost / (results.periodDays / 7);
    const annualCost = weeklyCost * 48; // 48 working weeks

    const chartData = [
        { name: 'Productive Work', value: workHours, color: '#94a3b8' }, // Slate-400
        { name: 'Meetings', value: results.hoursPerWeek, color: '#ef4444' }, // Red-500
        { name: 'Context Switching', value: distractionHoursPerWeek, color: '#f97316' }, // Orange-500
    ];

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in-up space-y-8">

            <div className="flex justify-between items-center px-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Your Personal Audit</h2>
                    <p className="text-slate-500 text-sm">Based on {results.periodDays} days of calendar data</p>
                </div>
                <button
                    onClick={onReset}
                    className="flex items-center space-x-2 text-sm text-slate-500 hover:text-[#814fdc] transition-colors font-medium"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Audit another calendar</span>
                </button>
            </div>

            {/* 1. Key Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Total Meetings</p>
                    <p className="text-4xl font-black text-slate-900 mb-1">{results.totalMeetings}</p>
                    <p className="text-xs text-slate-400">In last {results.periodDays} days</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Avg Duration</p>
                    <p className="text-4xl font-black text-slate-900 mb-1">{Math.round(results.averageDurationMinutes)}m</p>
                    <p className="text-xs text-slate-400">Per meeting</p>
                </div>
            </div>

            {/* 2. Weekly Allocation Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[400px] relative">
                <div className="absolute top-6 left-6 z-10 pointer-events-none">
                    <h3 className="text-slate-700 font-bold text-lg">Your Weekly Time Allocation</h3>
                </div>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="55%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `${formatNumber(value)} hrs/week`}
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '20px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-center text-xs text-slate-400 mt-4">
                    Assumes a standard 40-hour work week.
                </p>
            </div>

            {/* 3. Distraction Tax */}
            <div className="bg-slate-900 text-white rounded-xl shadow-lg p-6 relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Brain className="w-24 h-24 text-orange-400" />
                </div>
                <div className="flex items-center mb-4">
                    <Brain className="w-5 h-5 text-orange-400 mr-2" />
                    <h3 className="text-orange-400 font-bold text-sm uppercase tracking-widest">The Distraction Tax</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-3xl font-bold mb-1 text-orange-400">{formatNumber(distractionHoursPerWeek)} hrs</p>
                        <p className="text-xs text-slate-400">Lost weekly to context switching</p>
                    </div>
                </div>
                <p className="mt-4 text-xs text-slate-500 leading-relaxed border-t border-slate-800 pt-4">
                    Based on UC Irvine research: it takes ~23 minutes to refocus after each interruption.
                </p>
            </div>


        </div>
    );
};
