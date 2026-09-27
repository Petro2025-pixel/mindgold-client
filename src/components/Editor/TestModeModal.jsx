import { useTranslation } from "react-i18next";
import { Modal } from "../Modal/Modal";

/**
 * Formats a duration in seconds into a short human-readable string.
 *   - 3661  → "1h 1m"
 *   - 1800  → "30m"
 *   - 45    → "45s"
 *
 * @param {number} seconds - Remaining time in seconds.
 * @returns {string}
 */
const formatRetryAfter = (seconds) => {
  if (!seconds || seconds <= 0) return "—";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
};

/**
 * TestModeModal — shown when the user hits the quiz creation rate limit.
 *
 * Triggered by a 429 response with `code: "QUIZ_LIMIT_REACHED"` from
 * POST /api/v1/quizzes. The backend returns `retryAfter` in seconds,
 * which is formatted as "Xh Ym" and displayed.
 *
 * Uses the shared <Modal> component so it inherits the MindGold theme.
 *
 * @component
 * @param {object} props
 * @param {boolean} props.isOpen - Controls visibility.
 * @param {() => void} props.onClose - Close handler.
 * @param {number} props.retryAfter - Seconds until the limit resets.
 * @returns {JSX.Element | null}
 */
export function TestModeModal({ isOpen, onClose, retryAfter }) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("editor.limitModal.title", "Test Mode")}
    >
      <p className="modal-text-muted">
        {t(
          "editor.limitModal.text",
          "You can create up to 3 quizzes per day during the test phase.",
        )}
      </p>

      <p className="modal-text-primary">
        {t("editor.limitModal.retryIn", "Try again in")}:{" "}
        {formatRetryAfter(retryAfter)}
      </p>

      <div className="modal-actions">
        <button
          type="button"
          className="btn-modal btn-modal-success"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </Modal>
  );
}
