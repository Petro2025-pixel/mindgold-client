import ReactGA from "react-ga4";

/**
 * Initializes Google Analytics 4 (GA4) tracking session with the provided Measurement ID.
 *
 * @function initGA
 * @param {string} trackingId - The GA4 Measurement ID (e.g., 'G-1YK6THRJWV').
 * @returns {void}
 */
export const initGA = (trackingId) => {
  if (!trackingId || trackingId === "G-XXXXXXXXXX") {
    console.warn("GA4 skipped: Valid Measurement ID is missing.");
    return;
  }

  ReactGA.initialize(trackingId);
  console.log("GA4 Initialized successfully with ID:", trackingId);
};

/**
 * Tracks custom user interactions and application events in Google Analytics 4.
 *
 * @function trackEvent
 * @param {string} category - The category of the event (e.g., 'Game', 'Editor', 'UI').
 * @param {string} action - The specific action performed (e.g., 'Start Quiz', 'Click Button').
 * @param {string} [label] - Optional additional label providing context for the event.
 * @returns {void}
 */
export const trackEvent = (category, action, label) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};