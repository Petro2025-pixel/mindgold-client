import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Leaderboard.css";

/**
 * @constant {string} API_URL - Base API endpoint for score collection.
 */
const API_URL = "https://mindgold.top/api/v1";

/**
 * Leaderboard page — top players across all quizzes.
 * Fetches aggregated scores from backend and renders a ranked table.
 *
 * @component
 * @returns {JSX.Element} The rendered leaderboard page.
 */
export default function Leaderboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/scores/leaderboard?limit=20`)
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to load leaderboard (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  /**
   * Format ISO date to readable "DD.MM.YYYY".
   * @param {string} iso - ISO date string.
   * @returns {string}
   */
  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("de-AT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /**
   * Medal emoji for top-3 positions.
   * @param {number} rank - 1-based position.
   * @returns {string}
   */
  const getMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}`;
  };

  if (loading) {
    return (
      <div className="leaderboard-page text-center">
        <div className="leaderboard-status">
          {t("leaderboard.loading", "Loading leaderboard...")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-page text-center">
        <div className="leaderboard-status error">
          {t("leaderboard.error", "Error: {{message}}", { message: error })}
        </div>
        <button className="btn-hex-game" onClick={() => navigate("/")}>
          <span className="arrow-back">➔</span>{" "}
          {t("leaderboard.backToMenu", "Back to Menu")}
        </button>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      {/* Header */}
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">
          {t("leaderboard.title", "🏆 Hall of Fame")}
        </h1>
        <p className="leaderboard-subtitle">
          {t("leaderboard.subtitle", "Top players across all quizzes")}
        </p>
      </div>

      {/* Table */}
      {leaderboard.length === 0 ? (
        <div className="leaderboard-empty">
          {t(
            "leaderboard.empty",
            "No games played yet. Be the first to set a record!",
          )}
        </div>
      ) : (
        <div className="leaderboard-table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="col-rank">#</th>
                <th className="col-name">
                  {t("leaderboard.colPlayer", "Player")}
                </th>
                <th className="col-percent">%</th>
                <th className="col-score">
                  {t("leaderboard.colScore", "Score")}
                </th>
                <th className="col-games">
                  {t("leaderboard.colGames", "Games")}
                </th>
                <th className="col-date">
                  {t("leaderboard.colLastPlayed", "Last Played")}
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;
                return (
                  <tr
                    key={`${row.playerName}-${idx}`}
                    className={isTop3 ? "top-row" : ""}
                  >
                    <td className="col-rank">
                      <span className={`medal medal-${rank}`}>
                        {getMedal(rank)}
                      </span>
                    </td>
                    <td className="col-name">{row.playerName}</td>
                    <td className="col-percent">
                      <strong>{row.bestPercentage}%</strong>
                    </td>
                    <td className="col-score">
                      {row.bestScore}/{row.bestTotal}
                    </td>
                    <td className="col-games">{row.gamesPlayed}</td>
                    <td className="col-date">{formatDate(row.lastPlayed)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Back button */}
      <div className="leaderboard-actions">
        <button
          className="btn-hex-game btn-hex-game--secondary"
          onClick={() => navigate("/")}
        >
          <span className="arrow-back">➔</span>{" "}
          {t("leaderboard.backToMenu", "Back to Menu")}
        </button>
        <button className="btn-hex-game" onClick={() => navigate("/game")}>
          {t("leaderboard.playNow", "Play Now ➔")}
        </button>
      </div>
    </div>
  );
}
