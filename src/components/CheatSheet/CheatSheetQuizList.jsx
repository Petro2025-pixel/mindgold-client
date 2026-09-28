import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_URL } from "../../api/client";
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

/**
 * CheatSheetQuizList — second level of the CheatSheet navigation.
 *
 * Shows all quizzes inside the given category. Clicking a quiz opens
 * the CheatSheet for that quiz (question + correct answer + hint).
 *
 * Includes a Breadcrumb with a link back to /cheatsheet.
 *
 * Route: /cheatsheet/category/:category
 * Access: Private (any authenticated user — enforced via App.jsx).
 *
 * @component
 * @returns {JSX.Element}
 */
export default function CheatSheetQuizList() {
  const { category } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/quizzes?category=${encodeURIComponent(category)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load quizzes");
        return r.json();
      })
      .then((data) => {
        const list = data.data || data.quizzes || data;
        setQuizzes(Array.isArray(list) ? list : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="cheatsheet-page">
      <Breadcrumb
        items={[
          { label: t("cheatsheet.title", "CheatSheet"), to: "/cheatsheet" },
        ]}
      />

      <header className="cheatsheet-header">
        <h1 className="cheatsheet-title">📚 {formatCategory(category)}</h1>
        <p className="cheatsheet-subtitle">
          {t("cheatsheet.quizCount", "{{count}} quizzes", {
            count: quizzes.length,
          })}
        </p>
      </header>

      {loading && (
        <div className="cheatsheet-status">
          {t("cheatsheet.loading", "Loading…")}
        </div>
      )}

      {error && (
        <div className="cheatsheet-status error">
          {t("cheatsheet.error", "Failed to load quizzes")}
        </div>
      )}

      {!loading && !error && quizzes.length === 0 && (
        <div className="cheatsheet-status">
          {t("cheatsheet.empty", "No quizzes in this category yet.")}
        </div>
      )}

      <div className="cheatsheet-grid">
        {quizzes.map((quiz) => {
          const qCount = quiz.questions?.length || 0;
          return (
            <div
              key={quiz.slug || quiz._id}
              className="cheatsheet-card"
              onClick={() => navigate(`/cheatsheet/${quiz.slug}`)}
            >
              <div className="cheatsheet-card-content">
                <span className="cheatsheet-badge">
                  {t("cheatsheet.questionCount", "{{count}} questions", {
                    count: qCount,
                  })}
                </span>
                <h3 className="cheatsheet-card-title">{quiz.quizTitle}</h3>
              </div>
              <div className="cheatsheet-card-footer">
                <span className="cheatsheet-open">
                  {t("cheatsheet.study", "Study")} →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
