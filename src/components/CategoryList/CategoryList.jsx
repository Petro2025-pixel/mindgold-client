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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load categories");
        return r.json();
      })
      .then((data) => {
        const list = data.categories || [];
        setCategories(list.filter((c) => c.slug && c.slug !== "other"));
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
            key={cat.slug}
            className="quiz-card"
            onClick={() => navigate(`/game/category/${cat.slug}`)}
          >
            <div className="quiz-card-content">
              <span className="quiz-badge">
                {t("categoryList.quizzesCount", { count: cat.count })}
              </span>
              <h3 className="quiz-card-title">{formatCategory(cat.slug)}</h3>
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
