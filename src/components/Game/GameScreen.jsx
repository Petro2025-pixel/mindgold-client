import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
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

  // Player Name State
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem("mg_player_name") || "",
  );
  const [gameStarted, setGameStarted] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/quizzes/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Quiz not found (${res.status})`);
        return res.json();
      })
      .then((data) => {
        const quizData = data.data || data.quiz || data;
        if (!quizData?.questions) throw new Error("Invalid data format");

        const shuffledQuestions = shuffleArray([...quizData.questions]);

        const prepared = shuffledQuestions.map((q) => {
          const shuffledAnswers = shuffleArray([...q.answers]);

          const correctText = q.answers[q.correct];

          const newCorrectIndex = shuffledAnswers.indexOf(correctText);

          return {
            ...q,
            answers: shuffledAnswers,
            correct: newCorrectIndex,
          };
        });

        setQuiz(quizData);
        setQuestions(prepared);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!gameStarted || finished || isAnswered || loading) return;

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
  }, [current, isAnswered, finished, loading, gameStarted]);

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

  const handleStartGame = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    localStorage.setItem("mg_player_name", playerName.trim());
    setGameStarted(true);
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
      console.error("Question is missing a valid id:", currentQuestion);
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
        // If the server returns the text of the correct answer, find its index in the current shuffled array
        if (data.correctAnswerText) {
          const correctIdx = currentQuestion.answers.indexOf(
            data.correctAnswerText,
          );
          setCorrectAnswerIdx(correctIdx);
        }
      }
    } catch (err) {
      console.error("Check error:", err);
      setWrongCount((w) => w + 1);
    }

    nextQuestionWithDelay();
  };

  const nextQuestionWithDelay = () => {
    setTimeout(() => {
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
    return <div className="game-page text-center">Loading quiz...</div>;
  if (error) return <div className="game-page text-center">Error: {error}</div>;

  // Step 1: Player Name Entry Screen
  if (!gameStarted) {
    return (
      <div className="game-page text-center">
        <h1 className="quiz-main-title">
          {quiz?.quizTitle || quiz?.title || "MindGold Quiz"}
        </h1>
        <div className="start-card">
          <h3>Enter your name to start</h3>
          <form onSubmit={handleStartGame}>
            <input
              type="text"
              className="player-input"
              placeholder="Player Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              required
            />
            <button type="submit" className="btn-hex-game">
              Start Game ➔
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: Final Game Over Screen
  if (finished) {
    return (
      <div className="game-page text-center">
        <h1 className="quiz-main-title">{quiz?.quizTitle || quiz?.title}</h1>
        <div className="start-card">
          <h2>🎉 Congratulations, {playerName}!</h2>
          <p className="final-stats">
            Correct: <span className="correct-text">{correctCount}</span> |
            Wrong: <span className="wrong-text">{wrongCount}</span>
          </p>

          <div className="final-actions">
            <button
              className="btn-hex-game"
              onClick={() => window.location.reload()}
            >
              Try Again 🔄
            </button>

            <button
              className="btn-hex-game btn-hex-game--secondary"
              onClick={() => navigate("/game")}
            >
              ← Other Quizzes
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
          👤 Player: <strong>{playerName}</strong>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <span>
          Q: {current + 1}/{questions.length}
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
