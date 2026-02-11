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

          {/* Step 1: Hourly Rate */}
          <section className="space-y-3">
            <h5 className="font-bold text-slate-900 flex items-center uppercase tracking-wide text-xs">
              <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded mr-2">Step 1</span>
              Your Value Rate
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="md:col-span-3">
                <p className="text-sm">
                  We use your input of <span className="font-bold text-slate-900">{formatCurrency(hourlyRate)}/hr</span>.
                  <br />
                  <span className="text-xs text-slate-400 italic">
                    (If you entered a salary, we'd typically add a {BURDEN_MULTIPLIER}x burden multiplier for taxes/benefits, but here we use your direct input).
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Step 2: Direct Costs */}
          <section className="space-y-3">
            <h5 className="font-bold text-slate-900 flex items-center uppercase tracking-wide text-xs">
              <span className="bg-red-100 text-red-700 py-0.5 px-2 rounded mr-2">Step 2</span>
              Your Direct Meeting Cost (Annualized)
            </h5>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 font-mono text-xs md:text-sm">
              <p className="flex flex-wrap items-center gap-2">
                <span>{formatCurrency(hourlyRate)}/hr</span>
                <span className="text-slate-400">×</span>
                <span>{formatNumber(data.hoursPerWeek, 1)} hrs/wk</span>
                <span className="text-slate-400">×</span>
                <span>{WORK_WEEKS_PER_YEAR} weeks</span>
                <span className="text-slate-400">=</span>
                <span className="font-bold text-red-600 border-b-2 border-red-200">{formatCurrency(annualizedMeetingCost)}</span>
              </p>
            </div>
          </section>

          {/* Step 3: Distraction Tax */}
          <section className="space-y-3">
            <h5 className="font-bold text-slate-900 flex items-center uppercase tracking-wide text-xs">
              <span className="bg-orange-100 text-orange-700 py-0.5 px-2 rounded mr-2">Step 3</span>
              The Distraction Tax
            </h5>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="mb-3 text-sm">
                You average <span className="font-bold">{formatNumber(meetingsPerWeek, 1)} meetings/week</span>.
              </p>
              <div className="font-mono text-xs md:text-sm space-y-2">
                <p className="text-slate-500 italic mb-2">Formula: Meetings × {switchMinutes}min Penalty (UC Irvine research) × Rate × Weeks</p>
                <p className="flex flex-wrap items-center gap-2">
                  <span>{formatNumber(meetingsPerWeek, 1)} mtgs</span>
                  <span className="text-slate-400">×</span>
                  <span>{formatNumber(CONTEXT_SWITCH_HOURS, 2)} hrs ({switchMinutes}m)</span>
                  <span className="text-slate-400">×</span>
                  <span>{formatCurrency(hourlyRate)}</span>
                  <span className="text-slate-400">×</span>
                  <span>{WORK_WEEKS_PER_YEAR} weeks</span>
                  <span className="text-slate-400">=</span>
                  <span className="font-bold text-orange-600 border-b-2 border-orange-200">{formatCurrency(annualizedDistractionCost)}</span>
                </p>
              </div>
            </div>
          </section>

          <div className="text-center pt-4">
            <p className="font-bold text-slate-900">Total Projected Annual Waste</p>
            <p className="text-2xl font-black text-slate-900">
              {formatCurrency(annualizedMeetingCost)} <span className="text-slate-400 font-normal text-lg">+</span> {formatCurrency(annualizedDistractionCost)} <span className="text-slate-400 font-normal text-lg">=</span> {formatCurrency(totalAnnualWaste)}
            </p>
          </div>

        </div>
      )}
    </div>
  );
};