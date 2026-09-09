
/** * @file SystemCheck.jsx
 * @module components/SystemCheck
 * @description
 * Diagnostic panel for the MindGold client. Runs a sequence of live checks
 * against the mindgold-api backend (health endpoint, auth flow, quiz listing)
 * and renders the result of each check inline. Intended both as a temporary
 * infrastructure smoke-test during early deployment and as a permanent
 * developer-facing diagnostics view (e.g. mounted behind a hidden /status route).
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Ordered list of checks executed by {@link SystemCheck}.
 * Each entry describes one backend capability being verified.
 *
 * @typedef {Object} SystemCheckItem
 * @property {string} key - Unique identifier, also used as the React list key
 *   and as the results-map key.
 * @property {string} translationKey - Key for i18n translation lookup.
 * @property {string} fallbackLabel - Human-readable description shown next to the result as fallback.
 * @property {() => Promise<Response>} run - Executes the check and resolves
 *   with the raw fetch Response.
 */

/** @type {SystemCheckItem[]} */
const CHECKS = [
  {
    key: 'health',
    translationKey: 'diagnostics.serverConnection',
    fallbackLabel: 'Server connection',
    run: () => fetch(`${API_URL}/health`),
  },
  {
    key: 'auth',
    translationKey: 'diagnostics.registrationAuth',
    fallbackLabel: 'Registration / authentication',
    run: () =>
      fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `diag_${Date.now()}`, password: 'diagnostics1234' }),
      }),
  },
  {
    key: 'quizzes',
    translationKey: 'diagnostics.quizList',
    fallbackLabel: 'Quiz list',
    run: () => fetch(`${API_URL}/quizzes`),
  },
];

/**
 * Renders a button that sequentially runs every entry in {@link CHECKS}
 * against the API and displays a pass/fail indicator for each one.
 *
 * State machine per check: `idle` (never run) → `pending` (in flight) →
 * `ok` | `error-<httpStatus>` | `error-network`.
 *
 * @component
 * @returns {JSX.Element}
 *
 * @example
 * <SystemCheck />
 */
export default function SystemCheck() {
  const { t } = useTranslation();

  /**
   * Maps each check's `key` to its current status string.
   * @type {[Record<string, string>, Function]}
   */
  const [results, setResults] = useState({});

  /** Whether a check sequence is currently in progress. */
  const [running, setRunning] = useState(false);

  /**
   * Runs all {@link CHECKS} one after another, updating `results` as each
   * one settles. Sequential (not parallel) so results appear progressively
   * in a predictable order.
   *
   * @async
   * @returns {Promise<void>}
   */
  const runAll = async () => {
    setRunning(true);
    if (window.triggerHeaderCheck) window.triggerHeaderCheck();
    for (const check of CHECKS) {
      setResults((r) => ({ ...r, [check.key]: 'pending' }));
      try {
        const res = await check.run();
        setResults((r) => ({ ...r, [check.key]: res.ok ? 'ok' : `error-${res.status}` }));
      } catch {
        setResults((r) => ({ ...r, [check.key]: 'error-network' }));
      }
    }
    setRunning(false);
  };

  return (
    <div className="system-check">
      <h3>{t('diagnostics.title', 'System diagnostics:')}</h3>
      <button className="btn-hex" onClick={runAll} disabled={running}>
        {running
          ? t('diagnostics.checking', 'Checking...')
          : t('diagnostics.run', 'Run diagnostics')}
      </button>
      <ul>
        {CHECKS.map((c) => (
          <li key={c.key} className={`check-${results[c.key] ?? 'idle'}`}>
            {t(c.translationKey, c.fallbackLabel)}: {' '}
            {results[c.key] === 'ok' ? '✅' : results[c.key] ? '❌' : '—'}
          </li>
        ))}
      </ul>
    </div>
  );
}