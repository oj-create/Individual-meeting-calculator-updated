import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calculator, ArrowRight } from 'lucide-react';
import { CalculationResult } from '../utils/calculator';
import { BURDEN_MULTIPLIER, WORK_WEEKS_PER_YEAR, AVG_MEETING_DURATION_HOURS, CONTEXT_SWITCH_HOURS } from '../constants';

interface MethodologyProps {
  data: CalculationResult;
  hourlyRate: number;
  periodDays: number;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const formatNumber = (val: number, digits = 0) => {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(val);
};

export const MethodologyDisclosure: React.FC<MethodologyProps> = ({
  data,
  hourlyRate,
  periodDays
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Derived values for display
  // For individual calculator, we don't have 'salary' or 'region' explicitly unless inferred generally or input.
  // We used hourlyRate as the source of truth.
  // Reverse engineer "Base Salary" for display if needed: Rate * 40 * 48 / 1.3
  const impliedBurdenedHourly = hourlyRate; // The user inputs their "Rate", we treat it as fully burdened cost to company usually, or just their rate.
  // Let's assume the input IS the effective cost/hr.

  // Annualize for the methodology view to match the "Design" of the other calculator
  const annualizedMeetingCost = data.hoursPerWeek * hourlyRate * WORK_WEEKS_PER_YEAR;

  // Distraction
  const meetingsPerWeek = data.meetingsPerWeek;
  const switchMinutes = Math.round(CONTEXT_SWITCH_HOURS * 60);
  const distractionHoursPerWeek = meetingsPerWeek * CONTEXT_SWITCH_HOURS;
  const annualizedDistractionCost = distractionHoursPerWeek * hourlyRate * WORK_WEEKS_PER_YEAR;
  const totalAnnualWaste = annualizedMeetingCost + annualizedDistractionCost;

  return (
    <div className="mb-24 mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-5xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-slate-200 p-2 rounded-lg">
            <Calculator className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">How is this calculated?</h4>
            <p className="text-xs text-slate-500">See the math behind your personal meeting tax</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-6 border-t border-slate-200 text-sm text-slate-600 space-y-8 animate-in fade-in slide-in-from-top-2 duration-200">

          {/* Step 1: Meeting Time */}
          <section className="space-y-3">
            <h5 className="font-bold text-slate-900 flex items-center uppercase tracking-wide text-xs">
              <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded mr-2">Step 1</span>
              Smart Meeting Filtering
            </h5>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-sm mb-2">
                We don't just sum up every event on your calendar. To get an accurate picture of your <strong>collaborative load</strong>, we apply smart filters:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li><strong>Excludes solo work:</strong> Events with fewer than 2 attendees are counted as focus time, not meetings.</li>
                <li><strong>Excludes all-day events:</strong> We ignore full-day blocks (OOO, holidays) to prevent skewing the data.</li>
                <li><strong>Validates duration:</strong> Only meetings with realistic durations (under 8 hours) are included.</li>
              </ul>
            </div>
          </section>

          {/* Step 2: Context Switching */}
          <section className="space-y-3">
            <h5 className="font-bold text-slate-900 flex items-center uppercase tracking-wide text-xs">
              <span className="bg-orange-100 text-orange-700 py-0.5 px-2 rounded mr-2">Step 2</span>
              The "Switching Tax" (Science-Backed)
            </h5>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-sm mb-3">
                Research from the <strong>University of California, Irvine</strong> found that it takes an average of <strong>23 minutes and 15 seconds</strong> to get back on task after an interruption.
              </p>
              <div className="font-mono text-xs md:text-sm bg-white p-3 rounded border border-slate-200">
                <p className="font-bold text-slate-700">Formula:</p>
                <p className="text-slate-500">Total Meetings × 23 minutes = <span className="text-orange-600 font-bold">Total Lost Focus Time</span></p>
              </div>
              <p className="text-xs text-slate-400 mt-2 italic">
                This "fragmentation" of your day is often more costly than the meeting itself.
              </p>
            </div>
          </section>

          {/* Step 3: Cost Valuation */}
          <section className="space-y-3">
            <h5 className="font-bold text-slate-900 flex items-center uppercase tracking-wide text-xs">
              <span className="bg-green-100 text-green-700 py-0.5 px-2 rounded mr-2">Step 3</span>
              Value Calculation
            </h5>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-sm">
                To estimate the financial impact, we apply a standardized blended hourly rate of <strong>{formatCurrency(hourlyRate)}/hr</strong> to your total meeting and context switching hours.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                This provides a baseline for the "company cost" of your time spent in these activities.
              </p>
            </div>
          </section>

        </div>
      )}
    </div>
  );
};