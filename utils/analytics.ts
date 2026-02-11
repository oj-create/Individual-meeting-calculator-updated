import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

export const initMixpanel = () => {
    if (MIXPANEL_TOKEN && MIXPANEL_TOKEN !== 'REPLACE_WITH_YOUR_MIXPANEL_TOKEN') {
        mixpanel.init(MIXPANEL_TOKEN, {
            debug: import.meta.env.DEV,
            track_pageview: true,
            persistence: 'localStorage'
        });
    } else {
        console.warn('Mixpanel token not found or invalid. Analytics disabled.');
    }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (MIXPANEL_TOKEN && MIXPANEL_TOKEN !== 'REPLACE_WITH_YOUR_MIXPANEL_TOKEN') {
        mixpanel.track(eventName, properties);
    } else {
        console.log(`[Mixpanel Mock] Event: ${eventName}`, properties);
    }
};
