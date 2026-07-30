"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const QUIZ_STATS_KEY = "quizStats";
const MAX_QUIZ_HISTORY = 50;

const languageOptions = {
  en: {
    buttonLabel: "🇬🇧 Angličtina → čeština",
    sourceLabel: "Angličtina",
    description: "anglických slov a českých překladů",
  },
  de: {
    buttonLabel: "🇩🇪 Němčina → čeština",
    sourceLabel: "Němčina",
    description: "německých slov a českých překladů",
  },
  cs: {
    buttonLabel: "🇨🇿 Čeština → ruština",
    sourceLabel: "Čeština",
    description: "českých slov a ruských překladů",
  },
};

const storyOptions = {
  rabbit: {
    buttonLabel: "🐰 Králík – Oliver",
    title: "Oliver a tajemný les",
    icon: "🐰",
  },
  horse: {
    buttonLabel: "🐴 Statečný kůň",
    title: "Statečný kůň",
    icon: "🐴",
  },
  fox: {
    buttonLabel: "🦊 Chytrá liška",
    title: "Chytrá liška a tajemství Stříbrného pramene",
    icon: "🦊",
  },
};

function safelyParse(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeQuizSummary(summary) {
  const gamesCompleted = Math.max(0, Number(summary?.gamesCompleted || 0));
  const totalCorrect = Math.max(0, Number(summary?.totalCorrect || 0));
  const totalQuestions = Math.max(0, Number(summary?.totalQuestions || 0));
  const totalPercentage = Math.max(0, Number(summary?.totalPercentage || 0));
  const bestPercentage = Number(summary?.bestPercentage);

  return {
    gamesCompleted,
    totalCorrect,
    totalQuestions,
    totalPercentage,
    bestPercentage:
      Number.isFinite(bestPercentage) && bestPercentage >= 0
        ? Math.min(100, bestPercentage)
        : null,
    lastPlayedAt: summary?.lastPlayedAt || null,
  };
}

function updateQuizSummary(
  summary,
  correctAnswers,
  questionCount,
  percentage,
  playedAt,
) {
  const current = normalizeQuizSummary(summary);

  return {
    gamesCompleted: current.gamesCompleted + 1,
    totalCorrect: current.totalCorrect + correctAnswers,
    totalQuestions: current.totalQuestions + questionCount,
    totalPercentage: current.totalPercentage + percentage,
    bestPercentage:
      current.bestPercentage === null
        ? percentage
        : Math.max(current.bestPercentage, percentage),
    lastPlayedAt: playedAt,
  };
}

function getQuizRating(percentage) {
  if (percentage === 100) {
    return "Bezchybný výkon";
  }

  if (percentage >= 80) {
    return "Výborný výsledek";
  }

  if (percentage >= 60) {
    return "Velmi dobrý výsledek";
  }

  if (percentage >= 40) {
    return "Dobrý základ";
  }

  return "Zkuste to ještě jednou";
}

function saveQuizResult({
  gameId,
  language,
  story,
  correctAnswers,
  questionCount,
}) {
  const percentage =
    questionCount > 0 ? Math.round((correctAnswers / questionCount) * 100) : 0;
  const playedAt = new Date().toISOString();
  const parsed = safelyParse(localStorage.getItem(QUIZ_STATS_KEY), {});
  const previousHistory = Array.isArray(parsed?.history) ? parsed.history : [];

  if (previousHistory.some((item) => item?.id === gameId)) {
    return {
      percentage,
      rating: getQuizRating(percentage),
    };
  }

  const result = {
    id: gameId,
    language,
    story,
    correctAnswers,
    questionCount,
    percentage,
    playedAt,
  };

  const nextStats = {
    version: 1,
    ...updateQuizSummary(
      parsed,
      correctAnswers,
      questionCount,
      percentage,
      playedAt,
    ),
    byLanguage: {
      ...(parsed?.byLanguage || {}),
      [language]: updateQuizSummary(
        parsed?.byLanguage?.[language],
        correctAnswers,
        questionCount,
        percentage,
        playedAt,
      ),
    },
    byStory: {
      ...(parsed?.byStory || {}),
      [story]: updateQuizSummary(
        parsed?.byStory?.[story],
        correctAnswers,
        questionCount,
        percentage,
        playedAt,
      ),
    },
    history: [result, ...previousHistory].slice(0, MAX_QUIZ_HISTORY),
  };

  localStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(nextStats));
  window.dispatchEvent(new Event("quiz-stats-updated"));

  return {
    percentage,
    rating: getQuizRating(percentage),
  };
}

export default function QuizPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedStory, setSelectedStory] = useState("rabbit");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedResult, setSavedResult] = useState(null);
  const requestNumber = useRef(0);
  const gameId = useRef("");
  const savedGameId = useRef("");

  const currentLanguage = languageOptions[selectedLanguage];
  const currentStory = storyOptions[selectedStory];
  const currentQuestion = questions[currentQuestionIndex] || null;
  const currentAnswer = currentQuestion
    ? answers.find((answer) => answer.questionId === currentQuestion.id)
    : null;

  const correctAnswers = useMemo(
    () => answers.filter((answer) => answer.isCorrect).length,
    [answers],
  );

  const progressPercentage =
    questions.length > 0
      ? Math.round(
          ((currentQuestionIndex + (currentAnswer ? 1 : 0)) /
            questions.length) *
            100,
        )
      : 0;

  const startQuiz = useCallback(async () => {
    const currentRequest = requestNumber.current + 1;
    requestNumber.current = currentRequest;

    setIsLoading(true);
    setError("");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsFinished(false);
    setSavedResult(null);
    gameId.current = "";
    savedGameId.current = "";

    try {
      const parameters = new URLSearchParams({
        language: selectedLanguage,
        story: selectedStory,
      });
      const response = await fetch(`/api/kviz?${parameters.toString()}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kvíz se nepodařilo načíst.");
      }

      if (currentRequest !== requestNumber.current) {
        return;
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("Kvíz neobsahuje žádné otázky.");
      }

      setQuestions(data.questions);
      gameId.current = `${selectedLanguage}-${selectedStory}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
    } catch (quizError) {
      if (currentRequest !== requestNumber.current) {
        return;
      }

      setError(
        quizError instanceof Error
          ? quizError.message
          : "Kvíz se nepodařilo načíst.",
      );
    } finally {
      if (currentRequest === requestNumber.current) {
        setIsLoading(false);
      }
    }
  }, [selectedLanguage, selectedStory]);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  useEffect(() => {
    if (
      !isFinished ||
      !gameId.current ||
      savedGameId.current === gameId.current
    ) {
      return;
    }

    savedGameId.current = gameId.current;

    const result = saveQuizResult({
      gameId: gameId.current,
      language: selectedLanguage,
      story: selectedStory,
      correctAnswers,
      questionCount: questions.length,
    });

    setSavedResult(result);
  }, [
    isFinished,
    selectedLanguage,
    selectedStory,
    correctAnswers,
    questions.length,
  ]);

  function selectAnswer(optionIndex) {
    if (!currentQuestion || currentAnswer || isFinished) {
      return;
    }

    setAnswers((currentAnswers) => [
      ...currentAnswers,
      {
        questionId: currentQuestion.id,
        selectedIndex: optionIndex,
        correctIndex: currentQuestion.correctIndex,
        isCorrect: optionIndex === currentQuestion.correctIndex,
      },
    ]);
  }

  function continueQuiz() {
    if (!currentAnswer) {
      return;
    }

    if (currentQuestionIndex >= questions.length - 1) {
      setIsFinished(true);
      return;
    }

    setCurrentQuestionIndex((index) => index + 1);
  }

  function getOptionClass(optionIndex) {
    if (!currentAnswer) {
      return "";
    }

    if (optionIndex === currentQuestion.correctIndex) {
      return "correct";
    }

    if (optionIndex === currentAnswer.selectedIndex) {
      return "wrong";
    }

    return "muted";
  }

  return (
    <main className="quizPage">
      <div className="quizContainer">
        <nav className="quizNavigation" aria-label="Navigace kvízu">
          <Link href="/" className="quizBackLink">
            ← Zpět na hlavní stránku
          </Link>
        </nav>

        <header className="quizHeader">
          <span className="quizEyebrow">❓ Procvičování znalostí</span>
          <h1>Jazykový kvíz</h1>
          <p>
            Ověřte si znalost {currentLanguage.description} z příběhu{" "}
            <strong>„{currentStory.title}“</strong>.
          </p>
        </header>

        <section className="quizSelector">
          <h2>1. Vyberte jazykovou verzi</h2>

          <div className="quizSelectorGrid" aria-label="Výběr jazyka">
            {Object.entries(languageOptions).map(([language, option]) => (
              <button
                key={language}
                className={selectedLanguage === language ? "active" : ""}
                type="button"
                onClick={() => setSelectedLanguage(language)}
                aria-pressed={selectedLanguage === language}
              >
                {option.buttonLabel}
              </button>
            ))}
          </div>

          <h2>2. Vyberte příběh</h2>

          <div className="quizSelectorGrid" aria-label="Výběr příběhu">
            {Object.entries(storyOptions).map(([story, option]) => (
              <button
                key={story}
                className={selectedStory === story ? "active" : ""}
                type="button"
                onClick={() => setSelectedStory(story)}
                aria-pressed={selectedStory === story}
              >
                {option.buttonLabel}
              </button>
            ))}
          </div>
        </section>

        <section className="quizGame">
          {isLoading && (
            <div className="quizMessage" role="status">
              <span className="quizLoader" aria-hidden="true" />
              Připravuji otázky z vybraného příběhu…
            </div>
          )}

          {!isLoading && error && (
            <div className="quizError" role="alert">
              <strong>Kvíz se nepodařilo spustit.</strong>
              <p>{error}</p>
              <button type="button" onClick={startQuiz}>
                Zkusit znovu
              </button>
            </div>
          )}

          {!isLoading && !error && isFinished && (
            <div className="quizResult" role="status">
              <div className="quizResultIcon">
                {savedResult?.percentage === 100 ? "🏆" : "🎓"}
              </div>

              <span className="quizResultStory">
                {currentStory.icon} {currentStory.title}
              </span>

              <h2>{savedResult?.rating || "Kvíz dokončen"}</h2>

              <strong className="quizResultScore">
                {correctAnswers} / {questions.length}
              </strong>

              <p>
                Správně jste odpověděli na {correctAnswers} z {questions.length}{" "}
                otázek. Výsledek:{" "}
                <strong>
                  {savedResult?.percentage ??
                    Math.round((correctAnswers / questions.length) * 100)}{" "}
                  %
                </strong>
                .
              </p>

              <p className="quizSavedMessage">
                ✅ Výsledek této hry byl uložený v prohlížeči.
              </p>

              <div className="quizResultActions">
                <button type="button" onClick={startQuiz}>
                  🔄 Nový kvíz
                </button>

                <Link href="/">Hlavní stránka</Link>
              </div>
            </div>
          )}

          {!isLoading && !error && !isFinished && currentQuestion && (
            <>
              <div className="quizToolbar">
                <div>
                  <span>
                    Otázka {currentQuestionIndex + 1} z {questions.length}
                  </span>
                  <strong>
                    {currentStory.icon} {currentStory.title}
                  </strong>
                </div>

                <div className="quizCorrectCounter">
                  <span>Správně</span>
                  <strong>{correctAnswers}</strong>
                </div>
              </div>

              <div className="quizProgress" aria-hidden="true">
                <span
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>

              <article className="quizQuestionCard">
                <span className="quizType">{currentQuestion.typeLabel}</span>
                <h2>{currentQuestion.question}</h2>
                <div className="quizPrompt">{currentQuestion.prompt}</div>

                <div className="quizOptions">
                  {currentQuestion.options.map((option, optionIndex) => (
                    <button
                      key={`${currentQuestion.id}-${optionIndex}`}
                      className={getOptionClass(optionIndex)}
                      type="button"
                      onClick={() => selectAnswer(optionIndex)}
                      disabled={Boolean(currentAnswer)}
                    >
                      <span>{String.fromCharCode(65 + optionIndex)}</span>
                      <strong>{option}</strong>
                    </button>
                  ))}
                </div>

                {currentAnswer && (
                  <div
                    className={`quizFeedback ${
                      currentAnswer.isCorrect ? "success" : "failure"
                    }`}
                    role="status"
                  >
                    <strong>
                      {currentAnswer.isCorrect
                        ? "✅ Správná odpověď!"
                        : "❌ Tato odpověď není správně."}
                    </strong>

                    <p>{currentQuestion.explanation}</p>

                    {currentQuestion.example && (
                      <small>
                        Příklad: {currentQuestion.example}
                        {currentQuestion.exampleTranslation
                          ? ` — ${currentQuestion.exampleTranslation}`
                          : ""}
                      </small>
                    )}
                  </div>
                )}

                <div className="quizQuestionFooter">
                  <span>
                    {currentAnswer
                      ? "Odpověď je vyhodnocena."
                      : "Vyberte jednu ze čtyř možností."}
                  </span>

                  <button
                    type="button"
                    onClick={continueQuiz}
                    disabled={!currentAnswer}
                  >
                    {currentQuestionIndex === questions.length - 1
                      ? "Zobrazit výsledek"
                      : "Další otázka →"}
                  </button>
                </div>
              </article>
            </>
          )}
        </section>
      </div>

      <style jsx>{`
        .quizPage {
          min-height: 100vh;
          padding: 42px 18px 80px;
          background:
            radial-gradient(circle at top, #ede9fe 0%, transparent 35%),
            linear-gradient(135deg, #faf5ff 0%, #f8fafc 52%, #eff6ff 100%);
          color: #172033;
        }

        .quizContainer {
          width: 100%;
          max-width: 1040px;
          margin: 0 auto;
        }

        .quizNavigation {
          margin-bottom: 32px;
        }

        .quizBackLink {
          color: #7e22ce;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
        }

        .quizBackLink:hover {
          text-decoration: underline;
        }

        .quizHeader {
          max-width: 780px;
          margin: 0 auto 30px;
          text-align: center;
        }

        .quizEyebrow,
        .quizType,
        .quizResultStory {
          display: inline-block;
          padding: 7px 11px;
          border-radius: 999px;
          background: #f3e8ff;
          color: #7e22ce;
          font-size: 13px;
          font-weight: 900;
        }

        .quizHeader h1 {
          margin: 15px 0 12px;
          font-size: clamp(38px, 6vw, 56px);
          line-height: 1.05;
        }

        .quizHeader p {
          margin: 0;
          color: #64748b;
          font-size: 18px;
          line-height: 1.7;
        }

        .quizSelector {
          margin-bottom: 24px;
          padding: 23px;
          border: 1px solid #e9d5ff;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 14px 38px rgba(88, 28, 135, 0.08);
        }

        .quizSelector h2 {
          margin: 0 0 11px;
          font-size: 16px;
        }

        .quizSelector h2:not(:first-child) {
          margin-top: 20px;
        }

        .quizSelectorGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 11px;
        }

        .quizSelectorGrid button {
          padding: 13px 12px;
          border: 1px solid #ddd6fe;
          border-radius: 13px;
          background: #ffffff;
          color: #475569;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease;
        }

        .quizSelectorGrid button:hover {
          border-color: #a855f7;
          transform: translateY(-1px);
        }

        .quizSelectorGrid button.active {
          border-color: #9333ea;
          background: linear-gradient(135deg, #9333ea, #7e22ce);
          color: #ffffff;
          box-shadow: 0 9px 22px rgba(126, 34, 206, 0.2);
        }

        .quizGame {
          min-height: 420px;
          padding: 28px;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.97);
          box-shadow: 0 20px 55px rgba(15, 23, 42, 0.1);
        }

        .quizMessage,
        .quizError {
          min-height: 330px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 14px;
          text-align: center;
        }

        .quizLoader {
          width: 42px;
          height: 42px;
          border: 4px solid #e9d5ff;
          border-top-color: #9333ea;
          border-radius: 50%;
          animation: quizSpin 0.8s linear infinite;
        }

        .quizError {
          color: #b91c1c;
        }

        .quizError strong {
          font-size: 22px;
        }

        .quizError p {
          margin: 0;
          color: #64748b;
        }

        .quizError button,
        .quizQuestionFooter button,
        .quizResultActions button,
        .quizResultActions a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 17px;
          border: 0;
          border-radius: 11px;
          background: #9333ea;
          color: #ffffff;
          font-weight: 900;
          text-decoration: none;
          cursor: pointer;
        }

        .quizToolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 15px;
        }

        .quizToolbar > div:first-child {
          display: grid;
          gap: 5px;
        }

        .quizToolbar span {
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
        }

        .quizToolbar strong {
          font-size: 16px;
        }

        .quizCorrectCounter {
          min-width: 82px;
          padding: 9px 12px;
          border-radius: 13px;
          background: #f0fdf4;
          text-align: center;
        }

        .quizCorrectCounter span {
          display: block;
          font-size: 11px;
        }

        .quizCorrectCounter strong {
          color: #15803d;
          font-size: 22px;
        }

        .quizProgress {
          height: 9px;
          overflow: hidden;
          margin-bottom: 24px;
          border-radius: 999px;
          background: #ede9fe;
        }

        .quizProgress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #a855f7, #7e22ce);
          transition: width 0.25s ease;
        }

        .quizQuestionCard {
          padding: 25px;
          border: 1px solid #e9d5ff;
          border-radius: 20px;
          background: linear-gradient(135deg, #ffffff, #faf5ff);
        }

        .quizQuestionCard h2 {
          margin: 15px 0 10px;
          font-size: clamp(22px, 4vw, 31px);
          line-height: 1.3;
        }

        .quizPrompt {
          margin-bottom: 22px;
          padding: 17px;
          border-radius: 14px;
          background: #f8fafc;
          color: #4c1d95;
          font-size: clamp(20px, 4vw, 29px);
          font-weight: 900;
          line-height: 1.45;
          text-align: center;
        }

        .quizOptions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .quizOptions button {
          min-height: 68px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 13px;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          background: #ffffff;
          color: #334155;
          text-align: left;
          cursor: pointer;
          transition:
            border-color 0.18s ease,
            transform 0.18s ease,
            background 0.18s ease;
        }

        .quizOptions button:not(:disabled):hover {
          border-color: #a855f7;
          transform: translateY(-1px);
        }

        .quizOptions button > span {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #f3e8ff;
          color: #7e22ce;
          font-weight: 900;
        }

        .quizOptions button strong {
          overflow-wrap: anywhere;
          font-size: 15px;
        }

        .quizOptions button.correct {
          border-color: #22c55e;
          background: #f0fdf4;
          color: #166534;
        }

        .quizOptions button.correct > span {
          background: #dcfce7;
          color: #15803d;
        }

        .quizOptions button.wrong {
          border-color: #ef4444;
          background: #fef2f2;
          color: #991b1b;
        }

        .quizOptions button.wrong > span {
          background: #fee2e2;
          color: #b91c1c;
        }

        .quizOptions button.muted {
          opacity: 0.55;
        }

        .quizFeedback {
          margin-top: 18px;
          padding: 16px;
          border-radius: 14px;
        }

        .quizFeedback.success {
          border: 1px solid #86efac;
          background: #f0fdf4;
          color: #166534;
        }

        .quizFeedback.failure {
          border: 1px solid #fecaca;
          background: #fff7ed;
          color: #9a3412;
        }

        .quizFeedback p {
          margin: 6px 0;
          font-weight: 800;
        }

        .quizFeedback small {
          display: block;
          color: #475569;
          line-height: 1.55;
        }

        .quizQuestionFooter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-top: 21px;
        }

        .quizQuestionFooter > span {
          color: #64748b;
          font-size: 13px;
        }

        .quizQuestionFooter button:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        .quizResult {
          min-height: 410px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
        }

        .quizResultIcon {
          width: 88px;
          height: 88px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          border-radius: 26px;
          background: #f3e8ff;
          font-size: 43px;
        }

        .quizResult h2 {
          margin: 17px 0 8px;
          font-size: 31px;
        }

        .quizResultScore {
          color: #7e22ce;
          font-size: 46px;
        }

        .quizResult > p {
          max-width: 620px;
          margin: 10px 0 0;
          color: #64748b;
          line-height: 1.65;
        }

        .quizResult .quizSavedMessage {
          margin-top: 16px;
          padding: 10px 13px;
          border-radius: 11px;
          background: #f0fdf4;
          color: #15803d;
          font-weight: 800;
        }

        .quizResultActions {
          display: flex;
          gap: 11px;
          margin-top: 22px;
        }

        .quizResultActions a {
          background: #475569;
        }

        @keyframes quizSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 720px) {
          .quizPage {
            padding: 25px 11px 60px;
          }

          .quizSelector,
          .quizGame,
          .quizQuestionCard {
            padding: 18px 13px;
          }

          .quizSelectorGrid,
          .quizOptions {
            grid-template-columns: 1fr;
          }

          .quizToolbar,
          .quizQuestionFooter {
            align-items: stretch;
            flex-direction: column;
          }

          .quizCorrectCounter {
            align-self: flex-start;
          }

          .quizQuestionFooter button {
            width: 100%;
          }

          .quizResultActions {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}