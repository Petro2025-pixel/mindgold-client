import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_URL } from "../../api/client";
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
 * CheatSheetCategories — first level of the CheatSheet navigation.
 *
 * Shows all quiz categories (excluding the "other" bucket) with the
 * number of quizzes in each. Clicking a category opens the list of
 * quizzes in that category.
 *
 * Route: /cheatsheet
 * Access: Private (any authenticated user — enforced via App.jsx).
 *
 * @component
 * @returns {JSX.Element}
 */
export default function CheatSheetCategories() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    return (
      <div className="cheatsheet-page">
        <div className="cheatsheet-status">
          {t("cheatsheet.loading", "Loading…")}
        </div>
      </div>
    );
  if (error)
    return (
      <div className="cheatsheet-page">
        <div className="cheatsheet-status error">
          {t("cheatsheet.error", "Failed to load categories")}
        </div>
      </div>
    );

  return (
    <div className="cheatsheet-page">
      <header className="cheatsheet-header">
        <h1 className="cheatsheet-title">
          📚 {t("cheatsheet.title", "CheatSheet")}
        </h1>
        <p className="cheatsheet-subtitle">
          {t(
            "cheatsheet.subtitle",
            "Study and review quizzes at your own pace",
          )}
        </p>
      </header>

      <div className="cheatsheet-grid">
        {categories.map((cat) => (
          <div
            key={cat.slug}
            className="cheatsheet-card"
            onClick={() => navigate(`/cheatsheet/category/${cat.slug}`)}
          >
            <div className="cheatsheet-card-content">
              <span className="cheatsheet-badge">
                {t("cheatsheet.quizCount", "{{count}} quizzes", {
                  count: cat.count,
                })}
              </span>
              <h3 className="cheatsheet-card-title">
                {formatCategory(cat.slug)}
              </h3>
            </div>
            <div className="cheatsheet-card-footer">
              <span className="cheatsheet-open">
                {t("cheatsheet.open", "Study")} →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
