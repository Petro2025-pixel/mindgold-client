import { useTranslation } from "react-i18next";

/**
 * Prefixes for the four answer options.
 * @constant {string[]}
 */
const ANSWER_PREFIXES = ["A", "B", "C", "D"];

/**
 * QuestionForm — form for a single quiz question.
 *
 * Controlled component: the parent (ManualTab) owns the state and
 * passes down `question`, `onChange`, `onAnswerChange`, `onRemove`.
 *
 * Renders:
 *   - Question text (input)
 *   - Hint / explanation (textarea, optional but recommended for CheatSheet)
 *   - 4 answer inputs (A / B / C / D)
 *   - Radio buttons to mark the correct answer
 *   - "Remove question" button (hidden when canRemove === false)
 *
 * @component
 * @param {object} props
 * @param {number} props.index - Zero-based question index (for the header).
 * @param {object} props.question - Question object:
 *   { id, question, answers: string[], correct: number, hint: string }.
 * @param {(index: number, field: string, value: any) => void} props.onChange
 *   Called when a top-level field (`question`, `correct`, `hint`) changes.
 * @param {(qIndex: number, aIndex: number, value: string) => void} props.onAnswerChange
 *   Called when a specific answer text changes.
 * @param {(index: number) => void} props.onRemove - Removes the question.
 * @param {boolean} props.canRemove - False when only one question remains.
 * @returns {JSX.Element}
 */
export function QuestionForm({
  index,
  question,
  onChange,
  onAnswerChange,
  onRemove,
  canRemove,
}) {
  const { t } = useTranslation();

  return (
    <div className="question-form">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="question-form-header">
        <h3 className="question-form-title">
          {t("editor.questionNumber", "Question {{n}}", { n: index + 1 })}
        </h3>

        {canRemove && (
          <button
            type="button"
            className="question-remove-btn"
            onClick={() => onRemove(index)}
            title={t("editor.removeQuestion", "Remove question")}
          >
            ✕ {t("editor.remove", "Remove")}
          </button>
        )}
      </div>

      {/* ── Question text ──────────────────────────────────────── */}
      <label className="editor-label">
        {t("editor.questionText", "Question")}
        <input
          type="text"
          className="editor-input"
          value={question.question}
          onChange={(e) => onChange(index, "question", e.target.value)}
          placeholder={t(
            "editor.questionPlaceholder",
            "e.g. Was ist die Hauptstadt von Österreich?",
          )}
          required
        />
      </label>

      {/* ── Hint ───────────────────────────────────────────────── */}
      <label className="editor-label">
        <span>
          {t("editor.hint", "Hint / explanation")}{" "}
          <span className="editor-label-optional">
            ({t("editor.optional", "optional")})
          </span>
        </span>
        <textarea
          className="editor-textarea"
          value={question.hint}
          onChange={(e) => onChange(index, "hint", e.target.value)}
          placeholder={t(
            "editor.hintPlaceholder",
            "1–3 sentences explaining why the answer is correct (used in CheatSheet)",
          )}
          rows={2}
        />
      </label>

      {/* ── Answers ────────────────────────────────────────────── */}
      <div className="question-answers">
        <p className="question-answers-label">
          {t("editor.answers", "Answers")} —{" "}
          <span className="editor-label-optional">
            {t("editor.markCorrect", "mark the correct one")}
          </span>
        </p>

        {question.answers.map((answer, aIndex) => (
          <div key={aIndex} className="question-answer-row">
            <label className="question-answer-radio">
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={question.correct === aIndex}
                onChange={() => onChange(index, "correct", aIndex)}
                aria-label={t("editor.markAsCorrect", "Mark as correct")}
              />
              <span className="question-answer-prefix">
                {ANSWER_PREFIXES[aIndex]}
              </span>
            </label>

            <input
              type="text"
              className="editor-input question-answer-input"
              value={answer}
              onChange={(e) => onAnswerChange(index, aIndex, e.target.value)}
              placeholder={t("editor.answerPlaceholder", "Answer option")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
