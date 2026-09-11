import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * @constant {string} API_URL - Base API endpoint for quiz collection retrieval.
 */
const API_URL = "https://mindgold.top/api/v1";

/**
 * Quiz selection list component.
 * Fetches available quizzes and displays them as dynamic cards.
 *
 * @component
 * @returns {JSX.Element} Grid interface of available quizzes.
 */
export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        setQuizzes(Array.isArray(list) ? list : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="quiz-status">Loading quizzes...</div>;
  if (error) return <div className="quiz-status error">Error: {error}</div>;

  return (
    <div className="quiz-select-container">
      {/* Header section */}
      <div className="quiz-header">
        <h1>Select a Quiz</h1>
        <p>Test your knowledge in an interactive game mode</p>
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
                  {qCount} {qCount === 1 ? "question" : "questions"}
                </span>
                <h3 className="quiz-card-title">{quiz.quizTitle}</h3>
              </div>
              <div className="quiz-card-footer">
                <span className="play-link">Start Game →</span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .quiz-select-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 20px;
          color: #fff;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .quiz-status {
          text-align: center;
          padding: 50px;
          color: #a0a5ba;
          font-size: 1.2rem;
        }
        .quiz-status.error { color: #ff6b81; }

        .quiz-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .quiz-header h1 {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #fff 0%, #a0a5ba 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .quiz-header p {
          color: #8a8d9b;
          font-size: 1.05rem;
        }

        /* Responsive grid: 3 columns on desktop, 2 on tablet, 1 on mobile */
        .quiz-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .quiz-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(0, 210, 255, 0.25);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .quiz-card:hover {
          transform: translateY(-5px);
          border-color: #ff9f43;
          box-shadow: 0 10px 25px rgba(255, 159, 67, 0.2),
                      0 0 15px rgba(0, 210, 255, 0.15);
        }

        .quiz-badge {
          display: inline-block;
          background: rgba(0, 210, 255, 0.1);
          border: 1px solid rgba(0, 210, 255, 0.3);
          color: #00d2ff;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          margin-bottom: 14px;
        }

        .quiz-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          line-height: 1.4;
          color: #ffffff;
          margin: 0 0 20px 0;
        }

        .quiz-card-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 14px;
        }

        .play-link {
          color: #ff9f43;
          font-weight: 600;
          font-size: 0.95rem;
          transition: transform 0.2s;
        }

        .quiz-card:hover .play-link {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
