import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./QuizList.css";

/**
 * @constant {string} API_URL - Base API endpoint for quiz collection retrieval.
 */
const API_URL = "https://mindgold.top/api/v1";
/**
 * Formats category slug for display: "deutsch-b1" → "Deutsch B1"
 * @param {string} slug
 * @returns {string}
 */
const formatCategory = (slug) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/**
 * Quiz selection list component.
 * Fetches available quizzes and displays them as dynamic cards.
 *
 * @component
 * @returns {JSX.Element} Grid interface of available quizzes.
 */
export default function QuizList() {
  const { category } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  /**
   * Fetches quiz list from backend API on mount.
   */
  useEffect(() => {
    fetch(`${API_URL}/quizzes`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load quizzes");
        return res.json();
      })
      .then((data) => {
        const list = data.data || data.quizzes || data;
        const arr = Array.isArray(list) ? list : [];
        setQuizzes(arr.filter((q) => (q.category || "other") === category));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  if (loading) return <div className="quiz-status">Loading quizzes...</div>;
  if (error) return <div className="quiz-status error">Error: {error}</div>;

  return (
    <div className="quiz-select-container">
      {/* Header section */}
      <div className="quiz-header">
        <h1>{formatCategory(category)}</h1>
        <p>{t("quizList.subtitle")}</p>
      </div>

      {/* Quiz card grid */}
      <div className="quiz-grid">
        {quizzes.map((quiz) => {
          const qCount = quiz.questions?.length || 0;

          return (
            <div
              key={quiz.slug || quiz._id}
              className="quiz-card"
              onClick={() => navigate(`/game/${quiz.slug}`)}
            >
              <div className="quiz-card-content">
                <span className="quiz-badge">
                  {t("quizList.questions", { count: qCount })}
                </span>
                <h3 className="quiz-card-title">{quiz.quizTitle}</h3>
              </div>
              <div className="quiz-card-footer">
                <span className="play-link">{t("quizList.startButton")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
