import { PublicClientApplication, EventType, AccountInfo } from '@azure/msal-browser';

const msalConfig = {
    auth: {
        clientId: '53c65d58-ca1d-438a-aed6-592236943b71', // User provided Client ID
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin, // e.g., http://localhost:5173
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
    },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL
let msalInitPromise: Promise<void> | null = null;

export const initMsal = async () => {
    if (msalInitPromise) return msalInitPromise;

    msalInitPromise = (async () => {
        try {
            // Check if already initialized (v3 specific check if available, or just try/catch)
            await msalInstance.initialize();
        } catch (err: any) {
            // Provide a way to recover if it's "already initialized"
            if (err.message && err.message.includes("already initialized")) {
                return;
            }
            console.error("MSAL Initialize Error:", err);
            throw err;
        }

        if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
            msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
        }
    })();

    return msalInitPromise;
};

export const signIn = async (): Promise<AccountInfo | null> => {
    try {
        const loginResponse = await msalInstance.loginPopup({
            scopes: ['User.Read', 'Calendars.Read'],
            prompt: 'select_account',
        });
        msalInstance.setActiveAccount(loginResponse.account);
        return loginResponse.account;
    } catch (err: any) {
        console.error('MSAL Login Failed:', err);
        // Handle interaction_in_progress specifically
        if (err.errorCode === 'interaction_in_progress' || err.message?.includes('interaction_in_progress')) {
            throw new Error("A login popup is already open. Please close it or refresh the page.");
        }
        throw err;
    }
};

export const getOutlookEvents = async (days = 30) => {
    const account = msalInstance.getActiveAccount();
    if (!account) {
        throw new Error('No active account! Please sign in first.');
    }

    const response = await msalInstance.acquireTokenSilent({
        scopes: ['Calendars.Read'],
        account: account,
    });

    const accessToken = response.accessToken;

    const today = new Date();
    const timeMin = new Date();
    timeMin.setDate(today.getDate() - days);

    // Microsoft Graph API endpoint for calendar view
    // https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime={start_datetime}&endDateTime={end_datetime}
    const startDateTime = timeMin.toISOString();
    const endDateTime = today.toISOString();

    const url = `https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=${startDateTime}&endDateTime=${endDateTime}&$top=1000&$orderby=start/dateTime`;

    const graphResponse = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Prefer: 'outlook.timezone="UTC"', // Request times in UTC appropriately
        },
    });

    if (!graphResponse.ok) {
        throw new Error(`Graph API failed: ${graphResponse.statusText}`);
    }

    const data = await graphResponse.json();
    return data.value.map((event: any) => ({
        // Map to Google Calendar Event structure used in calculator.ts
        // Google: { summary, start: { dateTime }, end: { dateTime }, attendees: [] }
        summary: event.subject,
        start: {
            dateTime: event.start.dateTime, // Graph returns { dateTime: "...", timeZone: "..." }
            timeZone: event.start.timeZone
        },
        end: {
            dateTime: event.end.dateTime,
            timeZone: event.end.timeZone
        },
        // Graph attendees: [{ emailAddress: { name, address }, type }]
        // Google attendees: [{ email }, ...] (calculator uses .length)
        attendees: event.attendees ? event.attendees.map((a: any) => ({ email: a.emailAddress.address })) : [],

        // Additional needed fields?
        // Calculator uses: summary, start.dateTime, end.dateTime, attendees
    }));
};
