import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../api/client";
import { Breadcrumb } from "../Breadcrumb/Breadcrumb";
import "./CheatSheet.css";

/**
 * Formats a category slug for display.
 * "deutsch-b1" → "Deutsch B1"
 *
 * @param {string} slug
 * @returns {string}
 */
const formatCategory = (slug) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/** Answer option prefixes: A / B / C / D */
const ANSWER_PREFIXES = ["A", "B", "C", "D"];

/**
 * CheatSheetQuiz — third level of the CheatSheet navigation.
 *
 * Renders a single quiz as a vertical list of structured cards:
 *   - Question number (Q1, Q2, ...)
 *   - Question text
 *   - Correct answer (marked with ✅ and letter prefix)
 *   - Hint / explanation (💡, optional)
 *
 * Includes a Breadcrumb with links back through the hierarchy.
 * Adds a floating "scroll to top" button when the user scrolls down.
 *
 * Route: /cheatsheet/:slug
 * Access: Private (any authenticated user — enforced via App.jsx).
 *
 * @component
 * @returns {JSX.Element}
 */
export default function CheatSheetQuiz() {
  const { slug } = useParams();
  const { t } = useTranslation();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTop, setShowTop] = useState(false);

  // Fetch cheat sheet content
  useEffect(() => {
    setLoading(true);
    apiFetch(`/cheatsheet/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Quiz not found (${r.status})`);
        return r.json();
      })
      .then((data) => {
        setQuiz(data.quiz);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // Toggle "scroll to top" button on scroll
  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Loading / error ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="cheatsheet-page">
        <div className="cheatsheet-status">
          {t("cheatsheet.loading", "Loading…")}
        </div>
      </div>
    );
  }
  if (error || !quiz) {
    return (
      <div className="cheatsheet-page">
        <div className="cheatsheet-status error">
          {t("cheatsheet.error", "Failed to load quiz")}
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────
  return (
    <div className="cheatsheet-page">
      <Breadcrumb
        items={[
          { label: t("cheatsheet.title", "CheatSheet"), to: "/cheatsheet" },
          {
            label: formatCategory(quiz.category),
            to: `/cheatsheet/category/${quiz.category}`,
          },
        ]}
      />

      <header className="cheatsheet-header">
        <h1 className="cheatsheet-title">📚 {quiz.quizTitle}</h1>
        <p className="cheatsheet-subtitle">
          {t("cheatsheet.questionCount", "{{count}} questions", {
            count: quiz.questions.length,
          })}
          {quiz.tags && quiz.tags.length > 0 && (
            <>
              {" · "}
              {quiz.tags.map((tag) => (
                <span key={tag} className="cheatsheet-tag">
                  [{tag}]
                </span>
              ))}
            </>
          )}
        </p>
      </header>

      <div className="cheatsheet-list">
        {quiz.questions.map((q, index) => {
          const correctText = q.answers[q.correct];
          const correctLetter = ANSWER_PREFIXES[q.correct];

          return (
            <article key={q.id || index} className="cheatsheet-question">
              <div className="cheatsheet-q-number">Q{index + 1}</div>
              <h3 className="cheatsheet-q-text">{q.question}</h3>
              <p className="cheatsheet-q-answer">
                <span className="cheatsheet-q-check">✅</span>{" "}
                <span className="cheatsheet-q-letter">{correctLetter})</span>{" "}
                {correctText}
              </p>
              {q.hint ? (
                <p className="cheatsheet-q-hint">
                  <span className="cheatsheet-q-bulb">💡</span> {q.hint}
                </p>
              ) : (
                <p className="cheatsheet-q-hint cheatsheet-q-hint--empty">
                  <span className="cheatsheet-q-bulb">💡</span>{" "}
                  {t("cheatsheet.noHint", "Explanation not available")}
                </p>
              )}
            </article>
          );
        })}
      </div>

      {showTop && (
        <button
          type="button"
          className="cheatsheet-top-btn"
          onClick={scrollToTop}
          title={t("cheatsheet.backToTop", "Back to top")}
        >
          ↑
        </button>
      )}
    </div>
  );
}
