import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import confetti from "canvas-confetti";

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
    const end = Date.now() + 2 * 1000;
    const colors = ["#00d2ff", "#ff9f43", "#f1c40f"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
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
            <button type="submit" className="start-btn">
              Start Game ➔
            </button>
          </form>
        </div>
        <style>{`
          .quiz-main-title { color: #f1c40f; margin-bottom: 20px; font-size: 1.8rem; }
          .start-card { background: rgba(15, 23, 42, 0.8); padding: 30px; border-radius: 16px; border: 1px solid #00d2ff; max-width: 400px; margin: 0 auto; }
          .player-input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #fff; margin: 15px 0; text-align: center; font-size: 1.1rem; }
          .start-btn { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #00d2ff; color: #000; font-weight: bold; cursor: pointer; font-size: 1rem; }
        `}</style>
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
          <button
            className="start-btn"
            onClick={() => window.location.reload()}
          >
            Play Again 🔄
          </button>
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

      <style>{`
        .game-page { max-width: 800px; margin: 0 auto; padding: 20px; color: #fff; }
        .quiz-main-title { color: #f1c40f; font-size: 1.6rem; margin-bottom: 5px; }
        .player-badge { color: #94a3b8; font-size: 0.95rem; margin-bottom: 15px; }
        .stats-bar { display: flex; justify-content: center; gap: 20px; font-weight: bold; margin-bottom: 10px; }
        .correct-text { color: #2ecc71; }
        .wrong-text { color: #e74c3c; }
        .timer-track { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 25px; }
        .timer-fill { height: 100%; background: #f1c40f; transition: width 1s linear; }
        .question-title { text-align: center; font-size: 1.25rem; margin-bottom: 25px; line-height: 1.4; }
        .answers-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 600px) { .answers-grid { grid-template-columns: 1fr 1fr; } }
        .answer-btn { background: rgba(15, 23, 42, 0.7); border: 2px solid #00d2ff; border-radius: 12px; padding: 14px 18px; color: #fff; text-align: left; cursor: pointer; transition: all 0.2s; font-size: 1rem; }
        .answer-btn:hover:not(:disabled) { border-color: #ff9f43; }
        .answer-btn.correct { border-color: #2ecc71 !important; background: rgba(46, 204, 113, 0.25) !important; }
        .answer-btn.wrong { border-color: #e74c3c !important; background: rgba(231, 76, 60, 0.25) !important; }
        .prefix { color: #ff9f43; font-weight: bold; margin-right: 6px; }
      `}</style>
    </div>
  );
}
