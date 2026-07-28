"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "./slovnik.css";

const STORAGE_KEY = "storyLanguageVocabulary";
const LEGACY_KEYS = [
  "savedWords",
  "dictionaryWords",
  "vocabulary",
  "savedVocabulary",
  "myWords",
];

const LANGUAGE_OPTIONS = {
  en: {
    label: "Angličtina → čeština",
    shortLabel: "Angličtina",
    flag: "🇬🇧",
    speechCode: "en-US",
  },
  de: {
    label: "Němčina → čeština",
    shortLabel: "Němčina",
    flag: "🇩🇪",
    speechCode: "de-DE",
  },
  cs: {
    label: "Čeština → ruština",
    shortLabel: "Čeština",
    flag: "🇨🇿",
    speechCode: "cs-CZ",
  },
};

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeLanguage(value) {
  const cleanValue = String(value || "").toLowerCase();

  if (
    cleanValue.includes("de") ||
    cleanValue.includes("german") ||
    cleanValue.includes("něm")
  ) {
    return "de";
  }

  if (
    cleanValue.includes("cs") ||
    cleanValue.includes("cz") ||
    cleanValue.includes("czech") ||
    cleanValue.includes("češ")
  ) {
    return "cs";
  }

  return "en";
}

function normalizeWord(item, index = 0) {
  if (typeof item === "string") {
    return {
      id: `${Date.now()}-${index}`,
      word: item,
      translation: "",
      example: "",
      source: "Dříve uložené slovíčko",
      language: "en",
      learned: false,
      createdAt: new Date().toISOString(),
      reviewCount: 0,
      correctCount: 0,
    };
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const word =
    item.word ||
    item.term ||
    item.original ||
    item.text ||
    item.sourceWord ||
    "";

  if (!String(word).trim()) {
    return null;
  }

  return {
    id: item.id || `${Date.now()}-${index}`,
    word: String(word).trim(),
    translation: String(
      item.translation ||
        item.meaning ||
        item.translated ||
        item.target ||
        item.definition ||
        ""
    ).trim(),
    example: String(
      item.example ||
        item.sentence ||
        item.context ||
        ""
    ).trim(),
    source: String(
      item.source ||
        item.story ||
        item.origin ||
        "Příběh"
    ).trim(),
    language: normalizeLanguage(
      item.language ||
        item.lang ||
        item.sourceLanguage
    ),
    learned: Boolean(
      item.learned ||
        item.mastered ||
        item.isLearned
    ),
    createdAt:
      item.createdAt ||
      item.savedAt ||
      new Date().toISOString(),
    reviewCount: Number(item.reviewCount || 0),
    correctCount: Number(item.correctCount || 0),
  };
}

function readStoredWords() {
  const collected = [];

  try {
    const primaryValue = localStorage.getItem(STORAGE_KEY);

    if (primaryValue) {
      const parsed = JSON.parse(primaryValue);

      if (Array.isArray(parsed)) {
        collected.push(...parsed);
      }
    }

    for (const key of LEGACY_KEYS) {
      const rawValue = localStorage.getItem(key);

      if (!rawValue) {
        continue;
      }

      try {
        const parsed = JSON.parse(rawValue);

        if (Array.isArray(parsed)) {
          collected.push(...parsed);
        } else if (
          parsed &&
          typeof parsed === "object"
        ) {
          collected.push(...Object.values(parsed));
        }
      } catch {
        collected.push(rawValue);
      }
    }
  } catch {
    return [];
  }

  const normalized = collected
    .map(normalizeWord)
    .filter(Boolean);

  const uniqueWords = new Map();

  for (const item of normalized) {
    const key = `${item.language}:${item.word.toLocaleLowerCase()}`;

    if (!uniqueWords.has(key)) {
      uniqueWords.set(key, item);
    }
  }

  return Array.from(uniqueWords.values());
}

function formatDate(dateValue) {
  try {
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateValue));
  } catch {
    return "";
  }
}

export default function VocabularyPage() {
  const [words, setWords] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [word, setWord] = useState("");
  const [translation, setTranslation] =
    useState("");
  const [language, setLanguage] = useState("en");
  const [example, setExample] = useState("");
  const [source, setSource] = useState(
    "Vlastní slovíčko"
  );

  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] =
    useState("all");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [sortMode, setSortMode] =
    useState("newest");

  const [practiceMode, setPracticeMode] =
    useState(false);
  const [practiceIndex, setPracticeIndex] =
    useState(0);
  const [showAnswer, setShowAnswer] =
    useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedWords = readStoredWords();

    setWords(storedWords);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(words)
    );
  }, [words, isLoaded]);

  const filteredWords = useMemo(() => {
    const searchValue = search
      .trim()
      .toLocaleLowerCase();

    const result = words.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.word
          .toLocaleLowerCase()
          .includes(searchValue) ||
        item.translation
          .toLocaleLowerCase()
          .includes(searchValue) ||
        item.example
          .toLocaleLowerCase()
          .includes(searchValue);

      const matchesLanguage =
        languageFilter === "all" ||
        item.language === languageFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "learned" &&
          item.learned) ||
        (statusFilter === "learning" &&
          !item.learned);

      return (
        matchesSearch &&
        matchesLanguage &&
        matchesStatus
      );
    });

    return [...result].sort((first, second) => {
      if (sortMode === "alphabetical") {
        return first.word.localeCompare(
          second.word,
          "cs"
        );
      }

      if (sortMode === "oldest") {
        return (
          new Date(first.createdAt) -
          new Date(second.createdAt)
        );
      }

      if (sortMode === "leastReviewed") {
        return (
          first.reviewCount - second.reviewCount
        );
      }

      return (
        new Date(second.createdAt) -
        new Date(first.createdAt)
      );
    });
  }, [
    words,
    search,
    languageFilter,
    statusFilter,
    sortMode,
  ]);

  const practiceWords = useMemo(() => {
    const learningWords = filteredWords.filter(
      (item) => !item.learned
    );

    return learningWords.length > 0
      ? learningWords
      : filteredWords;
  }, [filteredWords]);

  const currentPracticeWord =
    practiceWords[practiceIndex] || null;

  const stats = useMemo(() => {
    const learned = words.filter(
      (item) => item.learned
    ).length;

    const reviewed = words.filter(
      (item) => item.reviewCount > 0
    ).length;

    return {
      total: words.length,
      learned,
      learning: words.length - learned,
      reviewed,
    };
  }, [words]);

  function addWord(event) {
    event.preventDefault();

    const cleanWord = word.trim();
    const cleanTranslation = translation.trim();

    if (!cleanWord || !cleanTranslation) {
      setMessage(
        "Vyplňte slovíčko i jeho překlad."
      );
      return;
    }

    const alreadyExists = words.some(
      (item) =>
        item.language === language &&
        item.word.toLocaleLowerCase() ===
          cleanWord.toLocaleLowerCase()
    );

    if (alreadyExists) {
      setMessage(
        "Toto slovíčko už ve slovníčku máte."
      );
      return;
    }

    const newWord = {
      id: createId(),
      word: cleanWord,
      translation: cleanTranslation,
      language,
      example: example.trim(),
      source: source.trim() || "Vlastní slovíčko",
      learned: false,
      createdAt: new Date().toISOString(),
      reviewCount: 0,
      correctCount: 0,
    };

    setWords((currentWords) => [
      newWord,
      ...currentWords,
    ]);

    setWord("");
    setTranslation("");
    setExample("");
    setMessage("Slovíčko bylo uloženo.");
  }

  function speakWord(item) {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      setMessage(
        "Tento prohlížeč nepodporuje předčítání."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(item.word);

    utterance.lang =
      LANGUAGE_OPTIONS[item.language].speechCode;
    utterance.rate = 0.85;

    const languagePrefix =
      utterance.lang.slice(0, 2).toLowerCase();

    const voice = window.speechSynthesis
      .getVoices()
      .find((candidate) =>
        candidate.lang
          .toLowerCase()
          .startsWith(languagePrefix)
      );

    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  }

  function toggleLearned(id) {
    setWords((currentWords) =>
      currentWords.map((item) =>
        item.id === id
          ? {
              ...item,
              learned: !item.learned,
            }
          : item
      )
    );
  }

  function deleteWord(id) {
    const confirmed = window.confirm(
      "Opravdu chcete toto slovíčko odstranit?"
    );

    if (!confirmed) {
      return;
    }

    setWords((currentWords) =>
      currentWords.filter(
        (item) => item.id !== id
      )
    );
  }

  function clearAllWords() {
    if (words.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Opravdu chcete odstranit celý slovníček?"
    );

    if (confirmed) {
      setWords([]);
      setPracticeMode(false);
      setMessage("Slovníček byl vymazán.");
    }
  }

  function startPractice() {
    if (practiceWords.length === 0) {
      setMessage(
        "Nejdříve si přidejte alespoň jedno slovíčko."
      );
      return;
    }

    setPracticeIndex(0);
    setShowAnswer(false);
    setPracticeMode(true);
  }

  function recordPracticeResult(isCorrect) {
    if (!currentPracticeWord) {
      return;
    }

    setWords((currentWords) =>
      currentWords.map((item) =>
        item.id === currentPracticeWord.id
          ? {
              ...item,
              reviewCount:
                item.reviewCount + 1,
              correctCount:
                item.correctCount +
                (isCorrect ? 1 : 0),
              learned:
                isCorrect &&
                item.correctCount + 1 >= 3
                  ? true
                  : item.learned,
            }
          : item
      )
    );

    const nextIndex =
      practiceIndex + 1 >=
      practiceWords.length
        ? 0
        : practiceIndex + 1;

    setPracticeIndex(nextIndex);
    setShowAnswer(false);
  }

  function exportWords() {
    const file = new Blob(
      [JSON.stringify(words, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "moje-slovicka.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  function importWords(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(
          String(reader.result)
        );

        if (!Array.isArray(parsed)) {
          throw new Error();
        }

        const imported = parsed
          .map(normalizeWord)
          .filter(Boolean);

        setWords((currentWords) => {
          const combined = [
            ...currentWords,
            ...imported,
          ];

          const uniqueWords = new Map();

          for (const item of combined) {
            const key = `${
              item.language
            }:${item.word.toLocaleLowerCase()}`;

            if (!uniqueWords.has(key)) {
              uniqueWords.set(key, item);
            }
          }

          return Array.from(
            uniqueWords.values()
          );
        });

        setMessage(
          `Importováno ${imported.length} slovíček.`
        );
      } catch {
        setMessage(
          "Soubor se nepodařilo načíst."
        );
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <main className="vocabularyPage">
      <section className="vocabularyContainer">
        <div className="vocabularyTopbar">
          <Link
            href="/"
            className="vocabularyBackLink"
          >
            ← Zpět na hlavní stránku
          </Link>

          <div className="vocabularyTopActions">
            <button
              type="button"
              onClick={exportWords}
              disabled={words.length === 0}
            >
              ⬇️ Exportovat
            </button>

            <label>
              ⬆️ Importovat
              <input
                type="file"
                accept="application/json"
                onChange={importWords}
              />
            </label>
          </div>
        </div>

        <header className="vocabularyHeader">
          <div className="vocabularyHeaderIcon">
            📝
          </div>

          <h1>Moje slovíčka</h1>

          <p>
            Ukládejte si slovíčka z příběhů,
            konverzací nebo vlastní slovíčka.
            Poslouchejte výslovnost a procvičujte
            je pomocí kartiček.
          </p>
        </header>

        <section className="vocabularyStats">
          <article>
            <span>📚</span>
            <strong>{stats.total}</strong>
            <p>Celkem slovíček</p>
          </article>

          <article>
            <span>🧠</span>
            <strong>{stats.learning}</strong>
            <p>Ještě se učím</p>
          </article>

          <article>
            <span>✅</span>
            <strong>{stats.learned}</strong>
            <p>Naučená slovíčka</p>
          </article>

          <article>
            <span>🔁</span>
            <strong>{stats.reviewed}</strong>
            <p>Procvičená slovíčka</p>
          </article>
        </section>

        <section className="vocabularyAddCard">
          <div className="vocabularySectionHeading">
            <div>
              <span>➕</span>
              <div>
                <h2>Přidat nové slovíčko</h2>
                <p>
                  Slovíčka se ukládají přímo do
                  tohoto prohlížeče.
                </p>
              </div>
            </div>
          </div>

          <form
            className="vocabularyForm"
            onSubmit={addWord}
          >
            <label>
              <span>Slovíčko</span>
              <input
                type="text"
                value={word}
                onChange={(event) =>
                  setWord(event.target.value)
                }
                placeholder="Například: forest"
              />
            </label>

            <label>
              <span>Překlad</span>
              <input
                type="text"
                value={translation}
                onChange={(event) =>
                  setTranslation(
                    event.target.value
                  )
                }
                placeholder="Například: les"
              />
            </label>

            <label>
              <span>Jazyk</span>
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(
                    event.target.value
                  )
                }
              >
                {Object.entries(
                  LANGUAGE_OPTIONS
                ).map(([key, option]) => (
                  <option key={key} value={key}>
                    {option.flag} {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Zdroj</span>
              <input
                type="text"
                value={source}
                onChange={(event) =>
                  setSource(event.target.value)
                }
                placeholder="Například: Oliver a tajemný les"
              />
            </label>

            <label className="vocabularyWideField">
              <span>Příklad ve větě</span>
              <input
                type="text"
                value={example}
                onChange={(event) =>
                  setExample(event.target.value)
                }
                placeholder="The rabbit ran into the forest."
              />
            </label>

            <button
              type="submit"
              className="vocabularyAddButton"
            >
              Uložit slovíčko
            </button>
          </form>

          {message && (
            <div className="vocabularyMessage">
              {message}
            </div>
          )}
        </section>

        <section className="vocabularyMainCard">
          <div className="vocabularyListHeader">
            <div>
              <h2>Můj slovníček</h2>
              <p>
                Zobrazeno {filteredWords.length} z{" "}
                {words.length} slovíček
              </p>
            </div>

            <button
              type="button"
              className="vocabularyPracticeButton"
              onClick={startPractice}
            >
              🎴 Procvičovat kartičky
            </button>
          </div>

          <div className="vocabularyFilters">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="🔎 Hledat slovíčko nebo překlad..."
            />

            <select
              value={languageFilter}
              onChange={(event) =>
                setLanguageFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                Všechny jazyky
              </option>
              <option value="en">
                🇬🇧 Angličtina
              </option>
              <option value="de">
                🇩🇪 Němčina
              </option>
              <option value="cs">
                🇨🇿 Čeština
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                Všechna slovíčka
              </option>
              <option value="learning">
                Ještě se učím
              </option>
              <option value="learned">
                Naučená
              </option>
            </select>

            <select
              value={sortMode}
              onChange={(event) =>
                setSortMode(event.target.value)
              }
            >
              <option value="newest">
                Nejnovější
              </option>
              <option value="oldest">
                Nejstarší
              </option>
              <option value="alphabetical">
                Podle abecedy
              </option>
              <option value="leastReviewed">
                Nejméně procvičená
              </option>
            </select>
          </div>

          {filteredWords.length === 0 ? (
            <div className="vocabularyEmptyState">
              <span>📭</span>
              <h3>Slovníček je zatím prázdný</h3>
              <p>
                V příběhu klikněte na neznámé slovíčko a uložte si ho do svého slovníku.
              </p>
            </div>
          ) : (
            <div className="vocabularyWordGrid">
              {filteredWords.map((item) => (
                <article
                  key={item.id}
                  className={`vocabularyWordCard ${
                    item.learned
                      ? "isLearned"
                      : ""
                  }`}
                >
                  <div className="vocabularyWordTop">
                    <span className="vocabularyLanguageBadge">
                      {
                        LANGUAGE_OPTIONS[
                          item.language
                        ].flag
                      }{" "}
                      {
                        LANGUAGE_OPTIONS[
                          item.language
                        ].shortLabel
                      }
                    </span>

                    <button
                      type="button"
                      className="vocabularySpeakButton"
                      onClick={() =>
                        speakWord(item)
                      }
                      title="Přehrát výslovnost"
                    >
                      🔊
                    </button>
                  </div>

                  <h3>{item.word}</h3>
                  <p className="vocabularyTranslation">
                    {item.translation ||
                      "Překlad není doplněn"}
                  </p>

                  {item.example && (
                    <p className="vocabularyExample">
                      „{item.example}“
                    </p>
                  )}

                  <div className="vocabularyMeta">
                    <span>
                      📖 {item.source}
                    </span>
                    <span>
                      📅{" "}
                      {formatDate(
                        item.createdAt
                      )}
                    </span>
                    <span>
                      🔁 {item.reviewCount}×
                    </span>
                  </div>

                  <div className="vocabularyWordActions">
                    <button
                      type="button"
                      className={
                        item.learned
                          ? "learned"
                          : ""
                      }
                      onClick={() =>
                        toggleLearned(item.id)
                      }
                    >
                      {item.learned
                        ? "✅ Naučeno"
                        : "🧠 Ještě se učím"}
                    </button>

                    <button
                      type="button"
                      className="delete"
                      onClick={() =>
                        deleteWord(item.id)
                      }
                    >
                      🗑️
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {words.length > 0 && (
            <div className="vocabularyDangerZone">
              <button
                type="button"
                onClick={clearAllWords}
              >
                Vymazat celý slovníček
              </button>
            </div>
          )}
        </section>
      </section>

      {practiceMode && currentPracticeWord && (
        <div className="vocabularyPracticeOverlay">
          <section className="vocabularyPracticeModal">
            <button
              type="button"
              className="vocabularyClosePractice"
              onClick={() =>
                setPracticeMode(false)
              }
            >
              ✕
            </button>

            <div className="vocabularyPracticeProgress">
              Kartička {practiceIndex + 1} z{" "}
              {practiceWords.length}
            </div>

            <span className="vocabularyPracticeLanguage">
              {
                LANGUAGE_OPTIONS[
                  currentPracticeWord.language
                ].flag
              }{" "}
              {
                LANGUAGE_OPTIONS[
                  currentPracticeWord.language
                ].shortLabel
              }
            </span>

            <button
              type="button"
              className="vocabularyPracticeSpeak"
              onClick={() =>
                speakWord(currentPracticeWord)
              }
            >
              🔊 Poslechnout
            </button>

            <h2>{currentPracticeWord.word}</h2>

            {!showAnswer ? (
              <button
                type="button"
                className="vocabularyRevealButton"
                onClick={() =>
                  setShowAnswer(true)
                }
              >
                Ukázat překlad
              </button>
            ) : (
              <>
                <div className="vocabularyPracticeAnswer">
                  {
                    currentPracticeWord.translation
                  }
                </div>

                {currentPracticeWord.example && (
                  <p>
                    „
                    {
                      currentPracticeWord.example
                    }
                    “
                  </p>
                )}

                <div className="vocabularyPracticeActions">
                  <button
                    type="button"
                    className="wrong"
                    onClick={() =>
                      recordPracticeResult(false)
                    }
                  >
                    Ještě neumím
                  </button>

                  <button
                    type="button"
                    className="correct"
                    onClick={() =>
                      recordPracticeResult(true)
                    }
                  >
                    Umím
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}