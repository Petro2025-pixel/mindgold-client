import ReactGA from 'react-ga4';

/**
 * Internal initialization state guard.
 * Prevents multiple GA4 script injections caused by React StrictMode or component remounts.
 * @type {boolean}
 */
let gaInitialized = false;

/**
 * Initializes Google Analytics 4 if a valid Measurement ID is provided
 * and has not been initialized previously.
 *
 * @param {string} trackingId - GA4 Measurement ID (e.g., "G-XXXXXXXXXX").
 */
export const initGA = (trackingId) => {
  if (gaInitialized) return;

  if (!trackingId || trackingId === 'G-XXXXXXXXXX') {
    if (import.meta.env.DEV) {
      console.warn('GA4 skipped: Valid Measurement ID is missing.');
    }
    return;
  }

  ReactGA.initialize(trackingId);
  gaInitialized = true;

  if (import.meta.env.DEV) {
    console.log('GA4 Initialized successfully with ID:', trackingId);
  }
};

/**
 * Safely dispatches a custom event to GA4 only if analytics is active.
 *
 * @param {string} category - Event category descriptor.
 * @param {string} action - Event action type.
 * @param {string} [label] - Optional event label.
 */
export const trackEvent = (category, action, label) => {
  if (!gaInitialized) return;

  ReactGA.event({
    category,
    action,
    label,
  });
};