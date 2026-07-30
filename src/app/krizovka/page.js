"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./krizovka.css";

const CROSSWORD_STATS_KEY = "crosswordStats";
const MAX_CROSSWORD_HISTORY = 50;

const languageOptions = {
  en: {
    buttonLabel: "🇬🇧 Angličtina → čeština",
    sourceLabel: "Angličtina",
    sourceLocale: "en",
  },
  de: {
    buttonLabel: "🇩🇪 Němčina → čeština",
    sourceLabel: "Němčina",
    sourceLocale: "de",
  },
  cs: {
    buttonLabel: "🇨🇿 Čeština → ruština",
    sourceLabel: "Čeština",
    sourceLocale: "cs",
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

function normalizeCrosswordSummary(summary) {
  const gamesCompleted = Math.max(0, Number(summary?.gamesCompleted || 0));
  const totalWords = Math.max(0, Number(summary?.totalWords || 0));
  const totalScore = Math.max(0, Number(summary?.totalScore || 0));
  const totalHints = Math.max(0, Number(summary?.totalHints || 0));
  const totalTimeSeconds = Math.max(0, Number(summary?.totalTimeSeconds || 0));
  const bestScore = Number(summary?.bestScore);

  return {
    gamesCompleted,
    totalWords,
    totalScore,
    totalHints,
    totalTimeSeconds,
    bestScore:
      Number.isFinite(bestScore) && bestScore >= 0
        ? Math.min(100, bestScore)
        : null,
    lastPlayedAt: summary?.lastPlayedAt || null,
  };
}

function updateCrosswordSummary(
  summary,
  wordCount,
  score,
  hintsUsed,
  timeSeconds,
  playedAt,
) {
  const current = normalizeCrosswordSummary(summary);

  return {
    gamesCompleted: current.gamesCompleted + 1,
    totalWords: current.totalWords + wordCount,
    totalScore: current.totalScore + score,
    totalHints: current.totalHints + hintsUsed,
    totalTimeSeconds: current.totalTimeSeconds + timeSeconds,
    bestScore:
      current.bestScore === null ? score : Math.max(current.bestScore, score),
    lastPlayedAt: playedAt,
  };
}

function getCrosswordRating(score) {
  if (score >= 95) {
    return "Mistr křížovky";
  }

  if (score >= 80) {
    return "Výborný výsledek";
  }

  if (score >= 60) {
    return "Velmi dobrý výsledek";
  }

  if (score >= 40) {
    return "Dobrý trénink";
  }

  return "Procvičujte dál";
}

function saveCrosswordResult({
  gameId,
  language,
  story,
  wordCount,
  score,
  hintsUsed,
  failedChecks,
  timeSeconds,
}) {
  const playedAt = new Date().toISOString();
  const parsed = safelyParse(localStorage.getItem(CROSSWORD_STATS_KEY), {});
  const previousHistory = Array.isArray(parsed?.history) ? parsed.history : [];

  if (previousHistory.some((item) => item?.id === gameId)) {
    return {
      score,
      rating: getCrosswordRating(score),
    };
  }

  const result = {
    id: gameId,
    language,
    story,
    wordCount,
    score,
    hintsUsed,
    failedChecks,
    timeSeconds,
    playedAt,
  };

  const nextStats = {
    version: 1,
    ...updateCrosswordSummary(
      parsed,
      wordCount,
      score,
      hintsUsed,
      timeSeconds,
      playedAt,
    ),
    byLanguage: {
      ...(parsed?.byLanguage || {}),
      [language]: updateCrosswordSummary(
        parsed?.byLanguage?.[language],
        wordCount,
        score,
        hintsUsed,
        timeSeconds,
        playedAt,
      ),
    },
    byStory: {
      ...(parsed?.byStory || {}),
      [story]: updateCrosswordSummary(
        parsed?.byStory?.[story],
        wordCount,
        score,
        hintsUsed,
        timeSeconds,
        playedAt,
      ),
    },
    history: [result, ...previousHistory].slice(0, MAX_CROSSWORD_HISTORY),
  };

  localStorage.setItem(CROSSWORD_STATS_KEY, JSON.stringify(nextStats));
  window.dispatchEvent(new Event("crossword-stats-updated"));

  return {
    score,
    rating: getCrosswordRating(score),
  };
}

function normalizeLetter(value, locale) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleUpperCase(locale)
    .replace(/[^\p{L}]/gu, "");
}

function isCorrectLetter(value, solution, locale) {
  return normalizeLetter(value, locale) === normalizeLetter(solution, locale);
}

function getWordCells(word, cellsById) {
  const rowStep = word.direction === "down" ? 1 : 0;
  const columnStep = word.direction === "across" ? 1 : 0;
  const cells = [];

  for (let index = 0; index < word.length; index += 1) {
    const row = word.row + rowStep * index;
    const column = word.column + columnStep * index;
    const cell = cellsById.get(`${row}-${column}`);

    if (cell) {
      cells.push(cell);
    }
  }

  return cells;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function CrosswordPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedStory, setSelectedStory] = useState("rabbit");
  const [puzzle, setPuzzle] = useState(null);
  const [inputs, setInputs] = useState({});
  const [checkedCells, setCheckedCells] = useState({});
  const [activeWordId, setActiveWordId] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [failedChecks, setFailedChecks] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [savedResult, setSavedResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const requestNumber = useRef(0);
  const startedAt = useRef(Date.now());

  const currentLanguage = languageOptions[selectedLanguage];
  const currentStory = storyOptions[selectedStory];

  const cellsById = useMemo(
    () => new Map((puzzle?.cells || []).map((cell) => [cell.id, cell])),
    [puzzle],
  );

  const activeWord = useMemo(
    () =>
      puzzle?.words?.find((word) => word.id === activeWordId) ||
      puzzle?.words?.[0] ||
      null,
    [activeWordId, puzzle],
  );

  const activeCellIds = useMemo(() => {
    if (!activeWord) {
      return new Set();
    }

    return new Set(getWordCells(activeWord, cellsById).map((cell) => cell.id));
  }, [activeWord, cellsById]);

  const filledCellCount = useMemo(
    () =>
      puzzle?.cells?.filter((cell) => Boolean(inputs[cell.id]?.trim()))
        .length || 0,
    [inputs, puzzle],
  );

  const completionPercentage =
    puzzle?.cells?.length > 0
      ? Math.round((filledCellCount / puzzle.cells.length) * 100)
      : 0;

  const loadPuzzle = useCallback(async () => {
    const currentRequest = requestNumber.current + 1;
    requestNumber.current = currentRequest;
    setIsLoading(true);
    setError("");
    setMessage("");
    setSavedResult(null);

    try {
      const response = await fetch(
        `/api/krizovka?language=${encodeURIComponent(
          selectedLanguage,
        )}&story=${encodeURIComponent(selectedStory)}`,
        {
          cache: "no-store",
        },
      );
      const result = await response.json();

      if (currentRequest !== requestNumber.current) {
        return;
      }

      if (!response.ok) {
        throw new Error(result?.error || "Křížovku se nepodařilo načíst.");
      }

      setPuzzle(result);
      setInputs({});
      setCheckedCells({});
      setActiveWordId(result.words?.[0]?.id || "");
      setHintsUsed(0);
      setFailedChecks(0);
      setIsCompleted(false);
      setIsRevealed(false);
      startedAt.current = Date.now();
    } catch (loadError) {
      if (currentRequest !== requestNumber.current) {
        return;
      }

      setPuzzle(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Křížovku se nepodařilo načíst.",
      );
    } finally {
      if (currentRequest === requestNumber.current) {
        setIsLoading(false);
      }
    }
  }, [selectedLanguage, selectedStory]);

  useEffect(() => {
    loadPuzzle();
  }, [loadPuzzle]);

  function getRelatedWords(cell) {
    return (puzzle?.words || []).filter((word) =>
      getWordCells(word, cellsById).some((wordCell) => wordCell.id === cell.id),
    );
  }

  function selectCellWord(cell) {
    const relatedWords = getRelatedWords(cell);

    if (relatedWords.length === 0) {
      return;
    }

    const activeIndex = relatedWords.findIndex(
      (word) => word.id === activeWordId,
    );
    const nextWord =
      relatedWords.length > 1 && activeIndex >= 0
        ? relatedWords[(activeIndex + 1) % relatedWords.length]
        : relatedWords[0];

    setActiveWordId(nextWord.id);
  }

  function focusCell(cellId) {
    window.requestAnimationFrame(() => {
      document.getElementById(`crossword-cell-${cellId}`)?.focus();
    });
  }

  function moveInsideActiveWord(cellId, offset) {
    if (!activeWord) {
      return;
    }

    const wordCells = getWordCells(activeWord, cellsById);
    const currentIndex = wordCells.findIndex((cell) => cell.id === cellId);
    const nextCell = wordCells[currentIndex + offset];

    if (nextCell) {
      focusCell(nextCell.id);
    }
  }

  function handleCellChange(cell, event) {
    if (isCompleted || isRevealed) {
      return;
    }

    const characters = [...event.target.value];
    const value = characters.at(-1) || "";

    setInputs((current) => ({
      ...current,
      [cell.id]: value.toLocaleUpperCase(currentLanguage.sourceLocale),
    }));
    setCheckedCells((current) => {
      const next = {
        ...current,
      };
      delete next[cell.id];
      return next;
    });
    setMessage("");

    if (value) {
      moveInsideActiveWord(cell.id, 1);
    }
  }

  function handleCellKeyDown(cell, event) {
    if (event.key === "Backspace" && !inputs[cell.id]) {
      event.preventDefault();
      moveInsideActiveWord(cell.id, -1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveInsideActiveWord(cell.id, 1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveInsideActiveWord(cell.id, -1);
    }
  }

  function selectWord(word) {
    setActiveWordId(word.id);
    const firstIncompleteCell = getWordCells(word, cellsById).find(
      (cell) =>
        !isCorrectLetter(
          inputs[cell.id],
          cell.solution,
          currentLanguage.sourceLocale,
        ),
    );

    focusCell(firstIncompleteCell?.id || getWordCells(word, cellsById)[0]?.id);
  }

  function useHint() {
    if (!activeWord || isCompleted || isRevealed) {
      return;
    }

    const cell = getWordCells(activeWord, cellsById).find(
      (wordCell) =>
        !isCorrectLetter(
          inputs[wordCell.id],
          wordCell.solution,
          currentLanguage.sourceLocale,
        ),
    );

    if (!cell) {
      setMessage("Toto slovo už máte vyplněné správně.");
      return;
    }

    setInputs((current) => ({
      ...current,
      [cell.id]: cell.solution,
    }));
    setCheckedCells((current) => {
      const next = {
        ...current,
      };
      delete next[cell.id];
      return next;
    });
    setHintsUsed((current) => current + 1);
    setMessage("Doplnili jsme jedno písmeno z vybraného slova.");
    focusCell(cell.id);
  }

  function checkPuzzle() {
    if (!puzzle || isCompleted || isRevealed) {
      return;
    }

    const nextCheckedCells = {};
    let correctCount = 0;

    for (const cell of puzzle.cells) {
      const isCorrect = isCorrectLetter(
        inputs[cell.id],
        cell.solution,
        currentLanguage.sourceLocale,
      );

      nextCheckedCells[cell.id] = isCorrect;

      if (isCorrect) {
        correctCount += 1;
      }
    }

    setCheckedCells(nextCheckedCells);

    if (correctCount !== puzzle.cells.length) {
      setFailedChecks((current) => current + 1);
      setMessage(
        `Správně je ${correctCount} z ${puzzle.cells.length} políček. Červená políčka ještě opravte.`,
      );
      return;
    }

    const timeSeconds = Math.max(
      1,
      Math.round((Date.now() - startedAt.current) / 1000),
    );
    const score = Math.max(10, 100 - hintsUsed * 5 - failedChecks * 3);
    const result = saveCrosswordResult({
      gameId: puzzle.id,
      language: selectedLanguage,
      story: selectedStory,
      wordCount: puzzle.words.length,
      score,
      hintsUsed,
      failedChecks,
      timeSeconds,
    });

    setSavedResult({
      ...result,
      timeSeconds,
    });
    setIsCompleted(true);
    setMessage("");
  }

  function revealSolution() {
    if (!puzzle || isCompleted || isRevealed) {
      return;
    }

    const confirmed = window.confirm(
      "Opravdu chcete zobrazit celé řešení? Tato křížovka se potom nezapočítá do pokroku.",
    );

    if (!confirmed) {
      return;
    }

    setInputs(
      Object.fromEntries(puzzle.cells.map((cell) => [cell.id, cell.solution])),
    );
    setCheckedCells(
      Object.fromEntries(puzzle.cells.map((cell) => [cell.id, true])),
    );
    setIsRevealed(true);
    setMessage("Řešení je zobrazené. Tato hra se do pokroku nezapočítala.");
  }

  const acrossWords =
    puzzle?.words?.filter((word) => word.direction === "across") || [];
  const downWords =
    puzzle?.words?.filter((word) => word.direction === "down") || [];

  return (
    <main className="crosswordPage">
      <section className="crosswordContainer">
        <div className="crosswordTopbar">
          <Link href="/" className="crosswordBackLink">
            ← Zpět na hlavní stránku
          </Link>

          <Link href="/pokrok" className="crosswordProgressLink">
            🏆 Můj pokrok
          </Link>
        </div>

        <header className="crosswordHeader">
          <div className="crosswordHeaderIcon">✏️</div>
          <h1>Jazyková křížovka</h1>
          <p>
            Doplňte slova podle překladů. Vyberte si jazykovou variantu a
            příběh, ze kterého chcete procvičovat slovní zásobu.
          </p>
        </header>

        <section className="crosswordSetupCard">
          <div>
            <h2>1. Vyberte jazyk</h2>
            <div className="crosswordOptionGrid">
              {Object.entries(languageOptions).map(([key, option]) => (
                <button
                  type="button"
                  key={key}
                  className={selectedLanguage === key ? "selected" : ""}
                  onClick={() => setSelectedLanguage(key)}
                >
                  {option.buttonLabel}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2>2. Vyberte příběh</h2>
            <div className="crosswordOptionGrid">
              {Object.entries(storyOptions).map(([key, option]) => (
                <button
                  type="button"
                  key={key}
                  className={selectedStory === key ? "selected" : ""}
                  onClick={() => setSelectedStory(key)}
                >
                  {option.buttonLabel}
                </button>
              ))}
            </div>
          </div>
        </section>

        {isLoading ? (
          <section className="crosswordStateCard">
            <div className="crosswordSpinner" />
            <h2>Skládáme novou křížovku…</h2>
            <p>Hledáme slova, která se mohou správně křížit.</p>
          </section>
        ) : error ? (
          <section className="crosswordStateCard crosswordErrorCard">
            <span>⚠️</span>
            <h2>Křížovku se nepodařilo vytvořit</h2>
            <p>{error}</p>
            <button type="button" onClick={loadPuzzle}>
              Zkusit znovu
            </button>
          </section>
        ) : puzzle ? (
          <>
            <section className="crosswordGameCard">
              <div className="crosswordGameHeading">
                <div>
                  <span className="crosswordGameBadge">
                    {currentStory.icon} {currentStory.title}
                  </span>
                  <h2>{currentLanguage.sourceLabel} – doplňte správná slova</h2>
                  <p>
                    Křížovka obsahuje {puzzle.words.length} slov. Písmena s
                    diakritikou můžete zadat i bez háčků a čárek.
                  </p>
                </div>

                <button
                  type="button"
                  className="crosswordNewButton"
                  onClick={loadPuzzle}
                >
                  🔄 Nová křížovka
                </button>
              </div>

              <div className="crosswordCompletionBar">
                <span style={{ width: `${completionPercentage}%` }} />
              </div>

              <small className="crosswordCompletionText">
                Vyplněno {filledCellCount} z {puzzle.cells.length} políček
              </small>

              <div className="crosswordWorkspace">
                <div className="crosswordBoardScroll">
                  <div
                    className="crosswordBoard"
                    style={{
                      gridTemplateColumns: `repeat(${puzzle.columns}, minmax(34px, 44px))`,
                    }}
                  >
                    {Array.from(
                      {
                        length: puzzle.rows * puzzle.columns,
                      },
                      (_, index) => {
                        const row = Math.floor(index / puzzle.columns);
                        const column = index % puzzle.columns;
                        const cell = cellsById.get(`${row}-${column}`);

                        if (!cell) {
                          return (
                            <div
                              className="crosswordBlank"
                              key={`blank-${row}-${column}`}
                            />
                          );
                        }

                        const stateClass =
                          checkedCells[cell.id] === true
                            ? "correct"
                            : checkedCells[cell.id] === false
                              ? "incorrect"
                              : "";

                        return (
                          <label
                            className={`crosswordCell ${
                              activeCellIds.has(cell.id) ? "active" : ""
                            } ${stateClass}`}
                            key={cell.id}
                            onClick={() => selectCellWord(cell)}
                          >
                            {cell.number && (
                              <span className="crosswordCellNumber">
                                {cell.number}
                              </span>
                            )}

                            <input
                              id={`crossword-cell-${cell.id}`}
                              value={inputs[cell.id] || ""}
                              maxLength={1}
                              aria-label={`Políčko ${cell.row + 1}, ${
                                cell.column + 1
                              }`}
                              disabled={isCompleted || isRevealed}
                              onFocus={(event) => event.target.select()}
                              onChange={(event) =>
                                handleCellChange(cell, event)
                              }
                              onKeyDown={(event) =>
                                handleCellKeyDown(cell, event)
                              }
                            />
                          </label>
                        );
                      },
                    )}
                  </div>
                </div>

                <aside className="crosswordClues">
                  <div>
                    <h3>Vodorovně</h3>
                    {acrossWords.map((word) => (
                      <button
                        type="button"
                        key={word.id}
                        className={activeWord?.id === word.id ? "selected" : ""}
                        onClick={() => selectWord(word)}
                      >
                        <strong>{word.number}.</strong>
                        <span>
                          {word.clue}
                          {word.exampleHint && (
                            <small>{word.exampleHint}</small>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <h3>Svisle</h3>
                    {downWords.map((word) => (
                      <button
                        type="button"
                        key={word.id}
                        className={activeWord?.id === word.id ? "selected" : ""}
                        onClick={() => selectWord(word)}
                      >
                        <strong>{word.number}.</strong>
                        <span>
                          {word.clue}
                          {word.exampleHint && (
                            <small>{word.exampleHint}</small>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </aside>
              </div>

              {message && (
                <div
                  className={`crosswordMessage ${isRevealed ? "revealed" : ""}`}
                >
                  {message}
                </div>
              )}

              {!isCompleted && (
                <div className="crosswordActions">
                  <button
                    type="button"
                    className="crosswordHintButton"
                    onClick={useHint}
                    disabled={isRevealed}
                  >
                    💡 Doplnit písmeno
                  </button>

                  <button
                    type="button"
                    className="crosswordCheckButton"
                    onClick={checkPuzzle}
                    disabled={isRevealed}
                  >
                    ✅ Zkontrolovat křížovku
                  </button>

                  <button
                    type="button"
                    className="crosswordRevealButton"
                    onClick={revealSolution}
                    disabled={isRevealed}
                  >
                    👁️ Ukázat řešení
                  </button>
                </div>
              )}

              <div className="crosswordGameStats">
                <span>💡 Nápovědy: {hintsUsed}</span>
                <span>🔎 Neúspěšné kontroly: {failedChecks}</span>
              </div>
            </section>

            {isCompleted && savedResult && (
              <section className="crosswordResultCard">
                <span className="crosswordResultIcon">🎉</span>
                <h2>Křížovka je správně vyřešená!</h2>
                <strong>{savedResult.score} %</strong>
                <p>{savedResult.rating}</p>

                <div className="crosswordResultStats">
                  <article>
                    <span>✏️</span>
                    <strong>{puzzle.words.length}</strong>
                    <p>Vyřešených slov</p>
                  </article>

                  <article>
                    <span>💡</span>
                    <strong>{hintsUsed}</strong>
                    <p>Použitých nápověd</p>
                  </article>

                  <article>
                    <span>⏱️</span>
                    <strong>{formatTime(savedResult.timeSeconds)}</strong>
                    <p>Celkový čas</p>
                  </article>
                </div>

                <p className="crosswordSavedMessage">
                  ✅ Výsledek byl uložen do stránky Můj pokrok.
                </p>

                <div className="crosswordResultActions">
                  <button type="button" onClick={loadPuzzle}>
                    Hrát novou křížovku
                  </button>
                  <Link href="/pokrok">Zobrazit můj pokrok</Link>
                </div>
              </section>
            )}
          </>
        ) : null}
      </section>
    </main>
  );
}