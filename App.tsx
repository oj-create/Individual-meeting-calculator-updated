import React, { useState, useEffect } from 'react';
import { ConnectCalendar } from './components/ConnectCalendar';
import { ResultsDisplay } from './components/ResultsDisplay';
// Ensuring correct import path
import { MethodologyDisclosure } from './components/MethodologyDisclosure';
import { loadGoogleScripts, handleAuthClick, listUpcomingEvents, getUserProfile } from './utils/googleCalendar';
import { calculateMeetingStats, type CalculationResult } from './utils/calculator';
import { initMixpanel, trackEvent, identifyUser } from './utils/analytics';
import { ArrowRight, Copy, CheckCircle2 } from 'lucide-react';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CalculationResult | null>(null);
  // hourlyRate removed, defaulting to 50 internally
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // New state for time range filtering
  const [allEvents, setAllEvents] = useState<any[]>([]); // Store raw 90-day events
  const [periodDays, setPeriodDays] = useState<number>(30); // Default to 30 days

  useEffect(() => {
    loadGoogleScripts(() => {
      console.log('Google Scripts Loaded');
    });
    initMixpanel();
    trackEvent('page_view', { page: 'individual_calculator' });
  }, []);

  // Re-calculate stats when periodDays or allEvents changes
  useEffect(() => {
    if (allEvents.length === 0) return;

    const rate = 50; // Hardcoded default rate

    // Filter events based on selected periodDays
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    const filteredEvents = allEvents.filter(event => {
      if (!event.start.dateTime) return false;
      const eventDate = new Date(event.start.dateTime);
      return eventDate >= cutoffDate;
    });

    const stats = calculateMeetingStats(filteredEvents, rate, periodDays);
    setResults(stats);

  }, [periodDays, allEvents]);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await handleAuthClick();

      // Identify user
      const userProfile = await getUserProfile();
      if (userProfile.email) {
        identifyUser(userProfile.email);
        trackEvent('user_identified', { email: userProfile.email });
      }

      setIsConnected(true);
      trackEvent('calendar_connected', { success: true });

      // Fetch 90 days of data upfront to allow client-side filtering
      const maxDays = 90;
      const events = await listUpcomingEvents(maxDays);
      setAllEvents(events); // This triggers the useEffect above
      setPeriodDays(30); // Default to 30 days on new connect

      // Initial stats for 30 days (calculated in useEffect, but could be done here for immediate feedback if needed)
      // The useEffect will handle the initial calculation once allEvents is set.

      trackEvent('data_fetched', {
        count: events.length,
        period: maxDays
      });

    } catch (err: any) {
      console.error('Connection failed', err);
      setError(err.message || 'Failed to connect to Google Calendar. Please try again.');
      trackEvent('calendar_connected', { success: false, error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setAllEvents([]);
    setIsConnected(false);
    trackEvent('calculator_reset');
  };

  const getReportText = () => {
    if (!results) return '';

    // Helper formatters
    const fmtCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    const fmtNumber = (val: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(val);

    return `
🗓️ MEETING COST REALITY CHECK

"You spent ${Math.round(results.totalHours)} hours across ${results.totalMeetings} meetings in the last ${results.periodDays} days..."
...and it cost roughly ${fmtCurrency(results.totalCost)} in focus time. 💸

That is ${Math.round((results.hoursPerWeek / 40) * 100)}% of your entire work month gone to meetings.

Total Meetings: ${results.totalMeetings}
Avg Duration: ${Math.round(results.averageDurationMinutes)} min

Check your own stats at Quely.io/meeting-cost-calculator
    `.trim();
  };

  const handleCopyReport = () => {
    if (!results) return;
    navigator.clipboard.writeText(getReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackEvent('copy_report');
  };

  const handleLinkedinShare = () => {
    if (!results) return;
    const roundedHours = Math.round(results.totalHours);
    const cost = Math.round(results.totalCost);

    const text = `Just used Quely meeting calculator to review my meetings for the past month,

${roundedHours} hours across ${results.totalMeetings} meetings.
$${cost} of my time.

Check yours at Quely.io/meeting-cost-calculator`;

    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    trackEvent('share_linkedin');
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header with Background Image */}
      <header
        className="relative bg-cover bg-center bg-no-repeat text-white pt-12 pb-12 px-4 sm:px-6 lg:px-8"
        style={{ backgroundImage: "url('/cals_bg_new.png')" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Logo Area */}
          <div className="mb-8">
            <img
              src="/logo.png"
              alt="Quely Logo"
              className="h-12 w-auto"
            />
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-white">
            Individual Meeting Cost Calculator
          </h1>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <p className="text-xl text-white max-w-2xl leading-relaxed opacity-90 drop-shadow-md">
              Connect your calendar to reveal how much time you have spent in meetings so far.
            </p>

            <a
              href="https://meetings.hubspot.com/admin3094/quely"
              target="_blank"
              rel="noopener noreferrer"
              className="group whitespace-nowrap bg-white hover:bg-slate-50 text-black font-bold py-3 px-8 rounded-full shadow-2xl transition-all transform hover:scale-105 flex items-center gap-4"
            >
              <span className="flex items-center gap-2">
                Try out <span className="text-[#814fdc]">Quely</span>
              </span>
              <ArrowRight className="w-6 h-6 text-[#814fdc] group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content - Overlapping Header */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10 w-full">

        {error && (
          <div className="mb-6 mx-auto max-w-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative animate-fade-in shadow-sm border-l-4 border-red-500" role="alert">
            <p className="font-bold">Connection Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!results ? (
          <ConnectCalendar
            onConnect={handleConnect}
            isLoading={isLoading}
          />
        ) : (
          <>
            <ResultsDisplay
              results={results}
              onReset={handleReset}
              periodDays={periodDays}
              onPeriodChange={setPeriodDays}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12 mt-8">
              <button
                type="button"
                onClick={handleCopyReport}
                className={`
                    shadow-xl transition-all transform hover:scale-105 active:scale-95
                    flex items-center space-x-3 px-8 py-5 rounded-full font-bold text-lg w-full sm:w-auto justify-center
                    ${copied ? 'bg-green-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}
                    `}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-6 h-6" />
                    <span>Copy Your Result</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLinkedinShare}
                className="shadow-xl transition-all transform hover:scale-105 active:scale-95 bg-white px-8 py-5 rounded-full flex items-center space-x-3 hover:bg-slate-50 border border-slate-200 w-full sm:w-auto justify-center"
              >
                <span className="font-bold text-lg text-slate-900">Share on Linkedin</span>
                <img
                  src="/Linkedin_icon.png"
                  alt="LinkedIn"
                  className="w-6 h-6 object-contain"
                />
              </button>
            </div>

            <MethodologyDisclosure
              data={results}
              hourlyRate={50}
              periodDays={30} // default
            />
          </>
        )}

        <div className="text-center text-slate-400 text-sm pb-8 mt-12">
          <p>&copy; {new Date().getFullYear()} Quely. Calculations based on estimated hourly rate.</p>
        </div>

      </main>
    </div>
  );
}

export default App;