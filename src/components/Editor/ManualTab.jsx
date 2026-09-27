import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/client";
import { LoginModal } from "../Login/LoginModal";
import { QuestionForm } from "./QuestionForm";
import { CategoryInput } from "./CategoryInput";
import { TestModeModal } from "./TestModeModal";

/**
 * Generates a stable, unique id for a new question.
 * Matches the backend schema (id: string, required).
 *
 * @returns {string} e.g. "Q-1730000000000-421"
 */
const newQuestionId = () =>
  `Q-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/**
 * Returns a fresh empty question object.
 * The default has 4 empty answers; the user can leave 2 of them blank
 * (the backend accepts 2–4 answers after trimming/filtering).
 *
 * @returns {object}
 */
const emptyQuestion = () => ({
  id: newQuestionId(),
  question: "",
  answers: ["", "", "", ""],
  correct: 0,
  hint: "",
});

/**
 * ManualTab — form-based quiz creation.
 *
 * Renders:
 *   - quizTitle input
 *   - CategoryInput (datalist from /api/v1/categories)
 *   - list of QuestionForm components
 *   - "+ Add question" button
 *   - "Save quiz" button
 *
 * On submit, POSTs to /api/v1/quizzes with JWT (via apiFetch).
 *
 * Response handling:
 *   201 → navigate to /game/category/<category>
 *   400 → display AJV details[] list
 *   401 → logout, open LoginModal
 *   429 → open TestModeModal with retryAfter
 *   other → generic error
 *
 * @component
 * @returns {JSX.Element}
 */
export function ManualTab() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // ── Form state ────────────────────────────────────────────────────
  const [quizTitle, setQuizTitle] = useState("");
  const [category, setCategory] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);

  // ── Submission state ──────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]); // AJV 400 details
  const [globalError, setGlobalError] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  // ── Question handlers ─────────────────────────────────────────────
  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions((prev) => {
      if (prev.length <= 1) return prev; // keep at least one
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    );
  };

  const handleAnswerChange = (qIndex, aIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const answers = [...q.answers];
        answers[aIndex] = value;
        return { ...q, answers };
      }),
    );
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setGlobalError(null);
    setSubmitting(true);

    // Sanitize payload:
    //   - trim strings
    //   - drop empty answers
    //   - include hint only if non-empty (AJV allows missing hint)
    const payload = {
      quizTitle: quizTitle.trim(),
      category: category.trim(),
      tags: [],
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question.trim(),
        answers: q.answers.map((a) => a.trim()).filter(Boolean),
        correct: q.correct,
        ...(q.hint.trim() ? { hint: q.hint.trim() } : {}),
      })),
    };

    try {
      const res = await apiFetch("/quizzes", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // ── 201: created ─────────────────────────────────────────────
      if (res.status === 201) {
        const data = await res.json();
        const newCategory = data.quiz?.category || payload.category;
        navigate(`/game/category/${newCategory}`);
        return;
      }

      // ── 400: validation errors ───────────────────────────────────
      if (res.status === 400) {
        const data = await res.json();
        setErrors(data.details || []);
        setSubmitting(false);
        return;
      }

      // ── 401: token expired ───────────────────────────────────────
      if (res.status === 401) {
        logout();
        setLoginOpen(true);
        setSubmitting(false);
        return;
      }

      // ── 429: rate limit ──────────────────────────────────────────
      if (res.status === 429) {
        const data = await res.json();
        setRetryAfter(data.retryAfter || 86400);
        setLimitOpen(true);
        setSubmitting(false);
        return;
      }

      // ── other (403, 500, ...) ────────────────────────────────────
      setGlobalError(
        t("editor.errors.server", "Server error. Please try again."),
      );
      setSubmitting(false);
    } catch {
      setGlobalError(
        t("editor.errors.network", "Network error. Check your connection."),
      );
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <form className="manual-tab" onSubmit={handleSubmit}>
      {/* ── Meta: title + category ────────────────────────────────── */}
      <div className="editor-meta">
        <label className="editor-label">
          {t("editor.quizTitle", "Quiz title")}
          <input
            type="text"
            className="editor-input"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder={t(
              "editor.quizTitlePlaceholder",
              "e.g. Rektion der Verben",
            )}
            maxLength={120}
            required
          />
        </label>

        <CategoryInput value={category} onChange={setCategory} required />
      </div>

      {/* ── Questions list ────────────────────────────────────────── */}
      <div className="editor-questions">
        <h2 className="editor-section-title">
          {t("editor.questions", "Questions ({{count}})", {
            count: questions.length,
          })}
        </h2>

        {questions.map((q, index) => (
          <QuestionForm
            key={q.id}
            index={index}
            question={q}
            onChange={handleQuestionChange}
            onAnswerChange={handleAnswerChange}
            onRemove={handleRemoveQuestion}
            canRemove={questions.length > 1}
          />
        ))}

        <button
          type="button"
          className="editor-add-btn"
          onClick={handleAddQuestion}
        >
          + {t("editor.addQuestion", "Add question")}
        </button>
      </div>

      {/* ── Errors ────────────────────────────────────────────────── */}
      {errors.length > 0 && (
        <div className="editor-errors">
          <h3>{t("editor.errors.validationTitle", "Validation errors")}</h3>
          <ul>
            {errors.map((err, i) => (
              <li key={i}>
                <strong>{err.field}</strong>: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {globalError && <p className="editor-error-line">{globalError}</p>}

      {/* ── Submit ────────────────────────────────────────────────── */}
      <div className="editor-actions">
        <button type="submit" className="btn-hex-game" disabled={submitting}>
          {submitting
            ? t("editor.saving", "Saving…")
            : t("editor.save", "Save quiz")}
        </button>
      </div>

      {/* ── Modals ────────────────────────────────────────────────── */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <TestModeModal
        isOpen={limitOpen}
        onClose={() => setLimitOpen(false)}
        retryAfter={retryAfter}
      />
    </form>
  );
}
