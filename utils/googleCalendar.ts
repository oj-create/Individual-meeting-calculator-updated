import { gapi } from 'gapi-script';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = ""; // Not needed for OAuth 2.0 flow with consistent consent, but sometimes used. reliable flow uses just Client ID + Access Token.
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const loadGoogleScripts = (callback: () => void) => {
  const script1 = document.createElement('script');
  script1.src = 'https://apis.google.com/js/api.js';
  script1.async = true;
  script1.defer = true;
  script1.onload = () => {
    gapi.load('client', async () => {
      await gapi.client.init({
        discoveryDocs: [DISCOVERY_DOC],
      });
      gapiInited = true;
      if (gisInited) callback();
    });
  };
  document.body.appendChild(script1);

  const script2 = document.createElement('script');
  script2.src = 'https://accounts.google.com/gsi/client';
  script2.async = true;
  script2.defer = true;
  script2.onload = () => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // defined at request time
    });
    gisInited = true;
    if (gapiInited) callback();
  };
  document.body.appendChild(script2);
};

export const handleAuthClick = () => {
  return new Promise<void>((resolve, reject) => {
    if (!tokenClient) {
        reject('Google Identity Services not initialized');
        return;
    }
    
    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
        throw (resp);
      }
      resolve();
    };

    if (gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({prompt: ''});
    }
  });
};

export const listUpcomingEvents = async (days = 30) => {
  const today = new Date();
  const timeMin = new Date();
  timeMin.setDate(today.getDate() - days);

  try {
    const request = {
      'calendarId': 'primary',
      'timeMin': timeMin.toISOString(),
      'timeMax': today.toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'orderBy': 'startTime',
      'maxResults': 2500 // Reasonable limit for performance
    };
    const response = await gapi.client.calendar.events.list(request);
    return response.result.items;
  } catch (err: any) {
    console.error('Error fetching events', err);
    throw err;
  }
};
