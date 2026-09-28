import { useState } from "react";
import { useTranslation } from "react-i18next";

/** Answer option prefixes: A / B / C / D */
const ANSWER_PREFIXES = ["A", "B", "C", "D"];

/**
 * CheatSheetCards — flip-card study mode.
 *
 * Shows one question at a time. Click "Show answer" to reveal the
 * correct answer + hint. Navigate with prev/next buttons.
 *
 * The flip is CSS-driven (3D transform). The `flipped` state is reset
 * to false on every navigation, so each new card starts with the
 * question facing up.
 *
 * @component
 * @param {object} props
 * @param {Array<object>} props.questions - Array of questions with
 *   { id, question, answers, correct, hint }.
 * @returns {JSX.Element}
 */
export function CheatSheetCards({ questions }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="cheatsheet-status">
        {t("cheatsheet.empty", "No questions")}
      </div>
    );
  }

  const q = questions[currentIndex];
  const correctText = q.answers[q.correct];
  const correctLetter = ANSWER_PREFIXES[q.correct];
  const total = questions.length;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  const handleShow = () => setFlipped(true);
  const handleHide = () => setFlipped(false);

  return (
    <div className="cards-container">
      {/* ── Progress ─────────────────────────────────────────── */}
      <div className="cards-progress">
        {t("cheatsheet.cardProgress", "Card {{current}} / {{total}}", {
          current: currentIndex + 1,
          total,
        })}
      </div>

      {/* ── Card ─────────────────────────────────────────────── */}
      <div
        className={`cards-card-wrapper ${flipped ? "cards-card-wrapper--flipped" : ""}`}
      >
        <div className="cards-card-inner">
          {/* Front — question */}
          <div className="cards-card cards-card--front">
            <div className="cards-q-number">Q{currentIndex + 1}</div>
            <h3 className="cards-q-text">{q.question}</h3>
            <button
              type="button"
              className="btn-hex-game cards-show-btn"
              onClick={handleShow}
            >
              {t("cheatsheet.showAnswer", "Show answer")}
            </button>
          </div>

          {/* Back — answer + hint */}
          <div className="cards-card cards-card--back">
            <div className="cards-q-number">
              Q{currentIndex + 1} — {t("cheatsheet.answer", "Answer")}
            </div>
            <h3 className="cards-q-question-small">{q.question}</h3>
            <p className="cards-q-answer">
              <span className="cards-q-check">✅</span>{" "}
              <span className="cards-q-letter">{correctLetter})</span>{" "}
              {correctText}
            </p>
            {q.hint ? (
              <p className="cards-q-hint">
                <span className="cards-q-bulb">💡</span> {q.hint}
              </p>
            ) : (
              <p className="cards-q-hint cards-q-hint--empty">
                <span className="cards-q-bulb">💡</span>{" "}
                {t("cheatsheet.noHint", "Explanation not available")}
              </p>
            )}
            <button
              type="button"
              className="cards-hide-btn"
              onClick={handleHide}
            >
              ↩ {t("cheatsheet.showQuestion", "Show question")}
            </button>
          </div>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────── */}
      <div className="cards-nav">
        <button
          type="button"
          className="cards-nav-btn"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          ← {t("cheatsheet.prev", "Previous")}
        </button>
        <button
          type="button"
          className="cards-nav-btn"
          onClick={handleNext}
          disabled={currentIndex === total - 1}
        >
          {t("cheatsheet.next", "Next")} →
        </button>
      </div>
    </div>
  );
}
