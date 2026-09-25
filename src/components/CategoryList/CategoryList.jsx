import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./CategoryList.css";

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

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/quizzes/categories`).then((r) => r.json()),
      fetch(`${API_URL}/quizzes`).then((r) => r.json()),
    ])
      .then(([cats, quizzesData]) => {
        const list = quizzesData.data || quizzesData.quizzes || quizzesData;
        const arr = Array.isArray(list) ? list : [];
        setCategories(cats);

        const c = {};
        arr.forEach((q) => {
          const key = q.category || "other";
          c[key] = (c[key] || 0) + 1;
        });
        setCounts(c);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="quiz-status">{t("categoryList.loading")}</div>;
  if (error)
    return <div className="quiz-status error">{t("categoryList.error")}</div>;

  return (
    <div className="quiz-select-container">
      <div className="quiz-header">
        <h1>{t("categoryList.title")}</h1>
        <p>{t("categoryList.subtitle")}</p>
      </div>

      <div className="quiz-grid">
        {categories.map((cat) => (
          <div
            key={cat}
            className="quiz-card"
            onClick={() => navigate(`/game/category/${cat}`)}
          >
            <div className="quiz-card-content">
              <span className="quiz-badge">
                {t("categoryList.quizzesCount", { count: counts[cat] || 0 })}
              </span>
              <h3 className="quiz-card-title">{formatCategory(cat)}</h3>
            </div>
            <div className="quiz-card-footer">
              <span className="play-link">{t("categoryList.open")} →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
