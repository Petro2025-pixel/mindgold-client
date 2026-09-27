import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_URL } from "../../api/client";

/**
 * Formats a category slug for display in the datalist hint.
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
 * CategoryInput — controlled input with autocomplete from existing categories.
 *
 * On mount, fetches the list of existing category slugs from
 * GET /api/v1/categories and renders them as <datalist> options.
 *
 * The user can either:
 *   - Select an existing category (autocomplete fills the slug)
 *   - Type a new slug manually (creates a new category on the backend)
 *
 * Value is always a lowercase slug — no spaces. The display hint shows the
 * Title-Cased version for readability.
 *
 * @component
 * @param {object} props
 * @param {string} props.value - Current category slug (controlled).
 * @param {(value: string) => void} props.onChange - Change handler.
 * @param {boolean} [props.required] - Whether the field is required.
 * @returns {JSX.Element}
 */
export function CategoryInput({ value, onChange, required = false }) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch categories once on mount ────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/categories`)
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data.categories) ? data.categories : [];
        // Filter out the special "other" bucket and null slugs
        const clean = list.map((c) => c.slug).filter((s) => s && s !== "other");
        setCategories(clean);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Normalizes the input on change — lowercase, trimmed,
   * spaces → hyphens. Keeps the backend slug format consistent.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    const normalized = e.target.value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    onChange(normalized);
  };

  const datalistId = "category-options";

  return (
    <label className="editor-label">
      {t("editor.category", "Category")}
      <input
        type="text"
        className="editor-input"
        list={datalistId}
        value={value}
        onChange={handleChange}
        placeholder={
          loading
            ? t("editor.categoryLoading", "Loading categories…")
            : t("editor.categoryPlaceholder", "e.g. deutsch-b1")
        }
        required={required}
        autoComplete="off"
      />
      <datalist id={datalistId}>
        {categories.map((slug) => (
          <option key={slug} value={slug}>
            {formatCategory(slug)}
          </option>
        ))}
      </datalist>

      <span className="editor-hint-text">
        {t(
          "editor.categoryHint",
          "Pick an existing one or type a new slug (lowercase, hyphens).",
        )}
      </span>
    </label>
  );
}
