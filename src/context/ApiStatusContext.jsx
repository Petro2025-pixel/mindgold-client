import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

/**
 * Default fallback URL if VITE_API_URL is not defined.
 * @type {string}
 */
const FALLBACK_API_URL = "https://mindgold.top/api/v1";

/**
 * Minimum time a check is shown as "checking" before resolving.
 * Prevents flickering between states on fast responses.
 * @type {number}
 */
const MIN_CHECKING_DURATION = 1000;

/**
 * Polling interval for health checks (ms).
 * @type {number}
 */
const POLL_INTERVAL = 60000;

/**
 * ApiStatusContext.
 * Provides a shared API health status across the app, with built-in polling
 * that pauses when the tab is hidden and resumes instantly when it returns.
 *
 * @type {React.Context<{status: string, checkNow: () => Promise<void>}>}
 */
export const ApiStatusContext = createContext({
  status: "checking",
  checkNow: async () => {},
});

/**
 * Hook to consume the API status context.
 *
 * @returns {{status: string, checkNow: () => Promise<void>}}
 */
export const useApiStatus = () => useContext(ApiStatusContext);

/**
 * Provider that owns the single source of truth for API health.
 * All consumers share the same polled result — no duplicate requests.
 *
 * @param {{children: React.ReactNode}} props
 * @returns {React.ReactElement}
 */
export const ApiStatusProvider = ({ children }) => {
  const [status, setStatus] = useState("checking");
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  /**
   * Runs a single health check against the backend.
   * Enforces a minimum "checking" duration to avoid UI flicker.
   *
   * @async
   * @returns {Promise<void>}
   */
  const checkNow = useCallback(async () => {
    setStatus("checking");
    const startedAt = Date.now();
    let result = "error";

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || FALLBACK_API_URL}/health`,
      );
      result = res.ok ? "ok" : "error";
    } catch {
      result = "error";
    }

    const elapsed = Date.now() - startedAt;
    const remaining = MIN_CHECKING_DURATION - elapsed;
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }

    if (isMountedRef.current) {
      setStatus(result);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const startPolling = () => {
      checkNow();
      intervalRef.current = setInterval(checkNow, POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) stopPolling();
      else startPolling();
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isMountedRef.current = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [checkNow]);

  return (
    <ApiStatusContext.Provider value={{ status, checkNow }}>
      {children}
    </ApiStatusContext.Provider>
  );
};
