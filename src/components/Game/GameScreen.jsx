import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import confetti from "canvas-confetti";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/client";
import { LoginModal } from "../Login/LoginModal";
import "./GameScreen.css";

const API_URL = "https://mindgold.top/api/v1";
const QUESTION_TIMEOUT = 30;

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function GameScreen() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIMEOUT);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [correctAnswerIdx, setCorrectAnswerIdx] = useState(null);

  // Player name comes from the authenticated user (no manual input).
  const playerName = user?.name || "";

  const timerRef = useRef(null);
  const delayTimeoutRef = useRef(null);

  useEffect(() => {
    // Reset pending delay when switching quizzes
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
    setLoading(true);

    // Use /cheatsheet/:slug — it includes `correct` (needed for green highlight).
    // /quizzes/:slug strips `correct` on the backend to prevent cheating.
    apiFetch(`/cheatsheet/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Quiz not found (${res.status})`);
        return res.json();
      })
      .then((data) => {
        const quizData = data.quiz || data;
        if (!quizData?.questions) throw new Error("Invalid data format");

        const shuffledQuestions = shuffleArray([...quizData.questions]);

        const prepared = shuffledQuestions.map((q) => {
          // Track original index alongside text — safe against duplicate texts
          const pairs = q.answers.map((text, origIdx) => ({ text, origIdx }));
          const shuffledPairs = shuffleArray(pairs);
          const newCorrectIndex = shuffledPairs.findIndex(
            (p) => p.origIdx === q.correct,
          );

          return {
            ...q,
            answers: shuffledPairs.map((p) => p.text),
            correct: newCorrectIndex,
          };
        });

        setQuiz(quizData);
        setQuestions(prepared);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // Auto-open login modal when the user is not signed in
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user) {
      setLoginOpen(true);
    }
  }, [user]);

  // Cleanup pending timeout on unmount (prevents setState on unmounted component)
  useEffect(() => {
    return () => {
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
        delayTimeoutRef.current = null;
      }
    };
  }, []);

  const handleLoginClose = ({ success } = {}) => {
    setLoginOpen(false);
    if (!success) {
      const category = quiz?.category;
      navigate(category ? `/game/category/${category}` : "/game");
    }
  };

  // Save score to backend when game finishes
  useEffect(() => {
    if (!finished) return;
    if (!playerName) return;

    const payload = {
      playerName,
      slug,
      score: correctCount,
      total: questions.length,
    };

    fetch(`${API_URL}/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => {
      if (import.meta.env.DEV) {
        console.error("Failed to save score:", err);
      }
    });
  }, [finished]);

  useEffect(() => {
    if (!user || finished || isAnswered || loading) return;

    setTimeLeft(QUESTION_TIMEOUT);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [current, isAnswered, finished, loading, user]);

  // Small confetti for correct answer
  const triggerSmallConfetti = () => {
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.8 },
      scalar: 0.8,
    });
  };

  // Big confetti for game finish
  const triggerBigConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleTimeout = () => {
    setIsAnswered(true);
    setWrongCount((w) => w + 1);
    nextQuestionWithDelay();
  };

  const handleAnswer = async (index) => {
    if (isAnswered) return;
    clearInterval(timerRef.current);

    setSelectedAnswer(index);
    setIsAnswered(true);

    const currentQuestion = questions[current];

    const questionId = currentQuestion._id || currentQuestion.id;
    // Guard: if the question has no valid id, treat as wrong without a network call
    if (!questionId) {
      if (import.meta.env.DEV) {
        console.error("Question is missing a valid id:", currentQuestion);
      }
      setWrongCount((w) => w + 1);
      nextQuestionWithDelay();
      return;
    }

    try {
      const selectedText = currentQuestion.answers[index];

      const res = await fetch(
        `${API_URL}/quizzes/${slug}/questions/${questionId}/check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answerText: selectedText }),
        },
      );

      const data = await res.json();

      if (data.correct) {
        setCorrectCount((c) => c + 1);
        setCorrectAnswerIdx(index); // Green highlighting of the selected answer
        triggerSmallConfetti();
      } else {
        setWrongCount((w) => w + 1);
        // Highlight the correct answer locally
        setCorrectAnswerIdx(currentQuestion.correct);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Check error:", err);
      }
      setWrongCount((w) => w + 1);
    }

    nextQuestionWithDelay();
  };

  const nextQuestionWithDelay = () => {
    // Clear any pending timeout to avoid double-advance race conditions
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }

    delayTimeoutRef.current = setTimeout(() => {
      delayTimeoutRef.current = null;

      if (current + 1 < questions.length) {
        setCurrent((c) => c + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setCorrectAnswerIdx(null);
      } else {
        setFinished(true);
        triggerBigConfetti();
      }
    }, 1800);
  };

  if (loading)
    return <div className="game-page text-center">{t("game.loading")}</div>;
  if (error)
    return (
      <div className="game-page text-center">
        {t("game.error", { message: error })}
      </div>
    );

  // Step 1: Not signed in — show login modal instead of the game
  if (!user) {
    return (
      <div className="game-page text-center">
        <h1 className="quiz-main-title">
          {quiz?.quizTitle || quiz?.title || t("game.defaultTitle")}
        </h1>
        <LoginModal isOpen={loginOpen} onClose={handleLoginClose} />
      </div>
    );
  }

  // Step 2: Final Game Over Screen
  if (finished) {
    return (
      <div className="game-page text-center">
        <h1 className="quiz-main-title">{quiz?.quizTitle || quiz?.title}</h1>
        <div className="start-card">
          <h2>{t("game.congratulations", { name: playerName })}</h2>
          <p className="final-stats">
            {t("game.correct")}:{" "}
            <span className="correct-text">{correctCount}</span> |{" "}
            {t("game.wrong")}: <span className="wrong-text">{wrongCount}</span>
          </p>

          <div className="final-actions">
            <button
              className="btn-hex-game"
              onClick={() => window.location.reload()}
            >
              {t("game.tryAgain")}
            </button>

            <button
              className="btn-hex-game btn-hex-game--secondary"
              onClick={() => navigate("/game")}
            >
              {t("game.otherQuizzes")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const progressPercent = (timeLeft / QUESTION_TIMEOUT) * 100;

  return (
    <div className="game-page">
      {/* Quiz Header */}
      <div className="quiz-header text-center">
        <h1 className="quiz-main-title">{quiz?.quizTitle || quiz?.title}</h1>
        <div className="player-badge">
          👤 <strong>{t("game.player", { name: playerName })}</strong>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <span>
          {t("game.progress", {
            current: current + 1,
            total: questions.length,
          })}
        </span>
        <span className="correct-text">✅ {correctCount}</span>
        <span className="wrong-text">❌ {wrongCount}</span>
      </div>

      {/* Timer Bar */}
      <div className="timer-track">
        <div
          className="timer-fill"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Question */}
      <h2 className="question-title">{q.question}</h2>

      {/* Answers */}
      <div className="answers-grid">
        {q.answers.map((answerText, idx) => {
          let btnStateClass = "";
          if (isAnswered) {
            if (idx === correctAnswerIdx) btnStateClass = "correct";
            else if (idx === selectedAnswer) btnStateClass = "wrong";
          }
          const prefixes = ["A", "B", "C", "D"];
          return (
            <button
              key={idx}
              className={`answer-btn ${btnStateClass}`}
              onClick={() => handleAnswer(idx)}
              disabled={isAnswered}
            >
              <span className="prefix">{prefixes[idx]}:</span> {answerText}
            </button>
          );
        })}
      </div>
    </div>
  );
}
