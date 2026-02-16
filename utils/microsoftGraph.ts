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
let msalInitPromise: Promise<import('@azure/msal-browser').AuthenticationResult | null> | null = null;

export const initMsal = async () => {
    if (msalInitPromise) return msalInitPromise;

    msalInitPromise = (async () => {
        try {
            await msalInstance.initialize();

            // Handle redirect promise and return the result
            const result = await msalInstance.handleRedirectPromise();

            if (result && result.account) {
                msalInstance.setActiveAccount(result.account);
            } else if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
                msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
            }
            return result;

        } catch (err: any) {
            console.error("MSAL Initialize Error:", err);
            throw err;
        }
    })();

    return msalInitPromise;
};

export const signIn = async (): Promise<void> => {
    try {
        await msalInstance.loginRedirect({
            scopes: ['User.Read', 'Calendars.Read'],
            prompt: 'select_account',
        });
        // execution ends here as page redirects
    } catch (err) {
        console.error('MSAL Login Failed:', err);
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
