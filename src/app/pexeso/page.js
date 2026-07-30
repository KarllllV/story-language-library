"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const languageOptions = {
  en: {
    buttonLabel: "🇬🇧 Angličtina → čeština",
    sourceLabel: "Anglicky",
    description: "anglických slov a jejich českých překladů",
    hintWord: "anglické",
    targetMeaning: "český",
  },
  de: {
    buttonLabel: "🇩🇪 Němčina → čeština",
    sourceLabel: "Německy",
    description: "německých slov a jejich českých překladů",
    hintWord: "německé",
    targetMeaning: "český",
  },
  cs: {
    buttonLabel: "🇨🇿 Čeština → ruština",
    sourceLabel: "Česky",
    description: "českých slov a jejich ruských překladů",
    hintWord: "české",
    targetMeaning: "ruský",
  },
};

const storyOptions = {
  rabbit: {
    buttonLabel: "🐰 Králík – Oliver",
    title: "Oliver a tajemný les",
  },
  horse: {
    buttonLabel: "🐴 Statečný kůň",
    title: "Statečný kůň",
  },
  fox: {
    buttonLabel: "🦊 Chytrá liška",
    title: "Chytrá liška a tajemství Stříbrného pramene",
  },
};

const selectionTitleStyle = {
  margin: "22px 0 10px",
  color: "#172033",
  fontSize: "1.05rem",
  fontWeight: 800,
};

const PEXESO_STATS_KEY = "pexesoStats";
const MAX_PEXESO_HISTORY = 50;

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

function normalizeSummary(summary) {
  const gamesCompleted = Math.max(0, Number(summary?.gamesCompleted || 0));
  const totalMoves = Math.max(0, Number(summary?.totalMoves || 0));
  const totalScore = Math.max(0, Number(summary?.totalScore || 0));
  const bestMoves = Number(summary?.bestMoves);

  return {
    gamesCompleted,
    totalMoves,
    totalScore,
    bestMoves: Number.isFinite(bestMoves) && bestMoves > 0 ? bestMoves : null,
    lastPlayedAt: summary?.lastPlayedAt || null,
  };
}

function calculatePexesoScore(moves, pairCount) {
  if (!Number.isFinite(moves) || moves <= 0 || pairCount <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round((pairCount / moves) * 100)));
}

function getPexesoRating(score) {
  if (score >= 90) {
    return "Vynikající paměť";
  }

  if (score >= 75) {
    return "Skvělý výsledek";
  }

  if (score >= 55) {
    return "Dobrý výsledek";
  }

  if (score >= 35) {
    return "Pěkný trénink";
  }

  return "Každá hra vás zlepšuje";
}

function updateSummary(summary, moves, score, playedAt) {
  const current = normalizeSummary(summary);

  return {
    gamesCompleted: current.gamesCompleted + 1,
    totalMoves: current.totalMoves + moves,
    totalScore: current.totalScore + score,
    bestMoves:
      current.bestMoves === null ? moves : Math.min(current.bestMoves, moves),
    lastPlayedAt: playedAt,
  };
}

function savePexesoResult({ gameId, language, story, moves, pairCount }) {
  const score = calculatePexesoScore(moves, pairCount);
  const playedAt = new Date().toISOString();
  const parsed = safelyParse(localStorage.getItem(PEXESO_STATS_KEY), {});
  const previousHistory = Array.isArray(parsed?.history) ? parsed.history : [];

  if (previousHistory.some((item) => item?.id === gameId)) {
    return {
      score,
      rating: getPexesoRating(score),
    };
  }

  const result = {
    id: gameId,
    language,
    story,
    moves,
    pairCount,
    score,
    playedAt,
  };

  const nextStats = {
    version: 1,
    ...updateSummary(parsed, moves, score, playedAt),
    byLanguage: {
      ...(parsed?.byLanguage || {}),
      [language]: updateSummary(
        parsed?.byLanguage?.[language],
        moves,
        score,
        playedAt,
      ),
    },
    byStory: {
      ...(parsed?.byStory || {}),
      [story]: updateSummary(parsed?.byStory?.[story], moves, score, playedAt),
    },
    history: [result, ...previousHistory].slice(0, MAX_PEXESO_HISTORY),
  };

  localStorage.setItem(PEXESO_STATS_KEY, JSON.stringify(nextStats));
  window.dispatchEvent(new Event("pexeso-stats-updated"));

  return {
    score,
    rating: getPexesoRating(score),
  };
}

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function createCards(pairs, sourceLabel, targetLabel) {
  const cards = pairs.flatMap((pair) => [
    {
      id: `${pair.id}-word`,
      pairId: pair.id,
      kind: "word",
      label: sourceLabel,
      text: pair.word,
    },
    {
      id: `${pair.id}-translation`,
      pairId: pair.id,
      kind: "translation",
      label: targetLabel,
      text: pair.translation,
    },
  ]);

  return shuffle(cards);
}

export default function PexesoPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedStory, setSelectedStory] = useState("rabbit");
  const [cards, setCards] = useState([]);
  const [pairCount, setPairCount] = useState(0);
  const [openCards, setOpenCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [boardLocked, setBoardLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedResult, setSavedResult] = useState(null);
  const requestNumber = useRef(0);
  const gameId = useRef("");
  const savedGameId = useRef("");

  const currentLanguage = languageOptions[selectedLanguage];
  const currentStory = storyOptions[selectedStory];

  const startNewGame = useCallback(async () => {
    const currentRequest = requestNumber.current + 1;
    requestNumber.current = currentRequest;

    setIsLoading(true);
    setError("");
    setCards([]);
    setPairCount(0);
    setOpenCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setBoardLocked(false);
    setSavedResult(null);
    gameId.current = "";
    savedGameId.current = "";

    try {
      const parameters = new URLSearchParams({
        language: selectedLanguage,
        story: selectedStory,
      });
      const response = await fetch(`/api/pexeso?${parameters.toString()}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Pexeso se nepodařilo načíst.");
      }

      if (currentRequest !== requestNumber.current) {
        return;
      }

      setCards(createCards(data.pairs, data.sourceLabel, data.targetLabel));
      setPairCount(data.pairCount);
      gameId.current = `${selectedLanguage}-${selectedStory}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
    } catch (gameError) {
      if (currentRequest !== requestNumber.current) {
        return;
      }

      setError(
        gameError instanceof Error
          ? gameError.message
          : "Pexeso se nepodařilo načíst.",
      );
    } finally {
      if (currentRequest === requestNumber.current) {
        setIsLoading(false);
      }
    }
  }, [selectedLanguage, selectedStory]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  useEffect(() => {
    if (openCards.length !== 2) {
      return undefined;
    }

    const firstCard = cards.find((card) => card.id === openCards[0]);
    const secondCard = cards.find((card) => card.id === openCards[1]);

    if (!firstCard || !secondCard) {
      return undefined;
    }

    const isMatch = firstCard.pairId === secondCard.pairId;

    setMoves((currentMoves) => currentMoves + 1);
    setBoardLocked(true);

    const timer = window.setTimeout(
      () => {
        if (isMatch) {
          setMatchedPairs((currentPairs) =>
            currentPairs.includes(firstCard.pairId)
              ? currentPairs
              : [...currentPairs, firstCard.pairId],
          );
        }

        setOpenCards([]);
        setBoardLocked(false);
      },
      isMatch ? 450 : 900,
    );

    return () => window.clearTimeout(timer);
  }, [cards, openCards]);

  const gameFinished =
    pairCount > 0 && matchedPairs.length === pairCount && !isLoading;

  useEffect(() => {
    if (
      !gameFinished ||
      !gameId.current ||
      savedGameId.current === gameId.current
    ) {
      return;
    }

    savedGameId.current = gameId.current;

    const result = savePexesoResult({
      gameId: gameId.current,
      language: selectedLanguage,
      story: selectedStory,
      moves,
      pairCount,
    });

    setSavedResult(result);
  }, [gameFinished, moves, pairCount, selectedLanguage, selectedStory]);

  const progressText = useMemo(
    () => `${matchedPairs.length} / ${pairCount || 8}`,
    [matchedPairs.length, pairCount],
  );

  function turnCard(card) {
    const cardIsOpen = openCards.includes(card.id);
    const pairIsMatched = matchedPairs.includes(card.pairId);

    if (boardLocked || cardIsOpen || pairIsMatched || openCards.length >= 2) {
      return;
    }

    setOpenCards((currentCards) => [...currentCards, card.id]);
  }

  return (
    <main className="memoryPage">
      <div className="memoryContainer">
        <nav className="memoryNavigation" aria-label="Navigace pexesa">
          <Link href="/" className="memoryBackLink">
            ← Zpět na hlavní stránku
          </Link>
        </nav>

        <header className="memoryHeader">
          <span className="memoryEyebrow">🧠 Učení hrou</span>

          <h1>Jazykové pexeso</h1>

          <p>
            Najděte správné dvojice {currentLanguage.description} z příběhu{" "}
            <strong>„{currentStory.title}“</strong>.
          </p>
        </header>

        <h2 style={selectionTitleStyle}>1. Vyberte jazykovou verzi</h2>

        <section className="memoryLanguagePanel" aria-label="Výběr jazyka">
          {Object.entries(languageOptions).map(([language, option]) => (
            <button
              key={language}
              className={`memoryLanguageButton ${
                selectedLanguage === language ? "active" : ""
              }`}
              type="button"
              onClick={() => setSelectedLanguage(language)}
              aria-pressed={selectedLanguage === language}
            >
              {option.buttonLabel}
            </button>
          ))}
        </section>

        <h2 style={selectionTitleStyle}>2. Vyberte příběh</h2>

        <section className="memoryLanguagePanel" aria-label="Výběr příběhu">
          {Object.entries(storyOptions).map(([story, option]) => (
            <button
              key={story}
              className={`memoryLanguageButton ${
                selectedStory === story ? "active" : ""
              }`}
              type="button"
              onClick={() => setSelectedStory(story)}
              aria-pressed={selectedStory === story}
            >
              {option.buttonLabel}
            </button>
          ))}
        </section>

        <section className="memoryGamePanel">
          <div className="memoryToolbar">
            <div className="memoryStats" aria-live="polite">
              <div className="memoryStat">
                <span>Vybraný příběh</span>
                <strong>{currentStory.title}</strong>
              </div>

              <div className="memoryStat">
                <span>Nalezené dvojice</span>
                <strong>{progressText}</strong>
              </div>

              <div className="memoryStat">
                <span>Počet pokusů</span>
                <strong>{moves}</strong>
              </div>
            </div>

            <button
              className="memoryNewGameButton"
              type="button"
              onClick={startNewGame}
              disabled={isLoading}
            >
              {isLoading ? "Načítám…" : "🔄 Nová hra"}
            </button>
          </div>

          {isLoading && (
            <div className="memoryMessage" role="status">
              <span className="memoryLoader" aria-hidden="true" />
              Připravuji slovíčka z vybraného příběhu…
            </div>
          )}

          {!isLoading && error && (
            <div className="memoryError" role="alert">
              <strong>Pexeso se nepodařilo spustit.</strong>
              <p>{error}</p>
              <button type="button" onClick={startNewGame}>
                Zkusit znovu
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {gameFinished && (
                <div className="memoryWinMessage" role="status">
                  <span aria-hidden="true">🏆</span>
                  <div>
                    <strong>Výborně, našli jste všechny dvojice!</strong>
                    <p>
                      Hru jste dokončili na {moves} pokusů.
                      {savedResult &&
                        ` Hodnocení: ${savedResult.score} % – ${savedResult.rating}.`}
                    </p>
                    <p>
                      Výsledek je uložený v{" "}
                      <Link href="/pokrok">Mém pokroku →</Link>
                    </p>
                  </div>
                  <button type="button" onClick={startNewGame}>
                    Hrát znovu
                  </button>
                </div>
              )}

              <div
                className="memoryGrid"
                aria-label="Hrací plocha jazykového pexesa"
              >
                {cards.map((card) => {
                  const isOpen =
                    openCards.includes(card.id) ||
                    matchedPairs.includes(card.pairId);
                  const isMatched = matchedPairs.includes(card.pairId);

                  return (
                    <button
                      key={card.id}
                      className={[
                        "memoryCard",
                        isOpen ? "isOpen" : "",
                        isMatched ? "isMatched" : "",
                        card.kind === "word" ? "isEnglishCard" : "isCzechCard",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      type="button"
                      onClick={() => turnCard(card)}
                      disabled={isMatched}
                      aria-label={
                        isOpen
                          ? `${card.label}: ${card.text}`
                          : "Otočit kartičku"
                      }
                    >
                      <span className="memoryCardInner">
                        <span className="memoryCardBack">
                          <span aria-hidden="true">?</span>
                          <small>Otočit</small>
                        </span>

                        <span className="memoryCardFront">
                          <small>{card.label}</small>
                          <strong>{card.text}</strong>
                          {isMatched && (
                            <span
                              className="memoryMatchMark"
                              aria-hidden="true"
                            >
                              ✓
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <p className="memoryHint">
          Tip: nejprve si zapamatujte {currentLanguage.hintWord} slovo a potom
          hledejte jeho {currentLanguage.targetMeaning} význam. Tlačítko „Nová
          hra“ vždy použije právě vybraný jazyk a příběh.
        </p>
      </div>
    </main>
  );
}