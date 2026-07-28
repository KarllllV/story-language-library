"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { rabbitStory } from "@/data/rabbitstoryde";

import { dictionary } from "@/data/dictionaryde";

import {
  getVocabularyWords,
  migrateLegacyVocabulary,
  removeVocabularyWord,
  saveVocabularyWord,
} from "@/lib/vocabularyStorage";

import {
  DEFAULT_APP_SETTINGS,
  getAppSettings,
  getFontSizeInPixels,
} from "@/lib/settingsStorage";

const topNavigationButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "42px",
  padding: "10px 15px",
  borderRadius: "11px",
  background: "#16a34a",
  color: "white",
  fontSize: "14px",
  fontWeight: "800",
  textDecoration: "none",
  boxShadow: "0 7px 18px rgba(22, 163, 74, 0.18)",
};

const homeNavigationButtonStyle = {
  ...topNavigationButtonStyle,
  border: "1px solid #cbd5e1",
  background: "rgba(255, 255, 255, 0.92)",
  color: "#334155",
  boxShadow: "0 7px 18px rgba(15, 23, 42, 0.07)",
};

const COMPLETED_STORIES_KEY = "completedStories";

function markStoryAsCompleted(storyId) {
  let completedStories = [];

  try {
    const storedValue = window.localStorage.getItem(COMPLETED_STORIES_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    if (Array.isArray(parsedValue)) {
      completedStories = parsedValue;
    } else if (parsedValue && typeof parsedValue === "object") {
      completedStories = Object.values(parsedValue);
    }
  } catch {
    completedStories = [];
  }

  if (completedStories.includes(storyId)) {
    return;
  }

  try {
    window.localStorage.setItem(
      COMPLETED_STORIES_KEY,
      JSON.stringify([...completedStories, storyId]),
    );
  } catch {
    // Nedostupné úložiště nesmí přerušit čtení příběhu.
  }
}

function normalizeWord(word) {
  return word
    .toLowerCase()
    .replace(/[.,!?;:“”"'()[\]{}]/g, "")
    .trim();
}

function splitWords(sentence) {
  return sentence.match(/\S+/g) ?? [];
}

function wordIndexFromCharIndex(text, charIndex) {
  const words = splitWords(text);
  let cursor = 0;

  for (let index = 0; index < words.length; index += 1) {
    const start = text.indexOf(words[index], cursor);
    const end = start + words[index].length;

    if (charIndex >= start && charIndex <= end) {
      return index;
    }

    cursor = end;
  }

  return Math.max(0, words.length - 1);
}

function textFromWord(sentence, wordIndex) {
  return splitWords(sentence).slice(wordIndex).join(" ");
}

function estimatedWordDuration(word, speed) {
  const cleanLength = normalizeWord(word).length;
  const base = 150 + cleanLength * 42;
  const punctuationExtra = /[.!?]$/.test(word)
    ? 260
    : /[,;:]$/.test(word)
      ? 120
      : 0;

  return Math.max(170, (base + punctuationExtra) / speed);
}

export default function Home() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(
    DEFAULT_APP_SETTINGS.selectedVoice,
  );
  const [readingSpeed, setReadingSpeed] = useState(
    DEFAULT_APP_SETTINGS.readingSpeed,
  );

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(
    DEFAULT_APP_SETTINGS.showTranslations,
  );
  const [fontSize, setFontSize] = useState(DEFAULT_APP_SETTINGS.fontSize);
  const [autoContinue, setAutoContinue] = useState(
    DEFAULT_APP_SETTINGS.autoContinue,
  );
  const [highlightCurrentWord, setHighlightCurrentWord] = useState(
    DEFAULT_APP_SETTINGS.highlightCurrentWord,
  );

  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [savedWords, setSavedWords] = useState([]);

  const [highlightedSentence, setHighlightedSentence] = useState(-1);
  const [highlightedWord, setHighlightedWord] = useState(-1);

  const [savedProgress, setSavedProgress] = useState(null);
  const [progressMessage, setProgressMessage] = useState("");

  const currentSentenceRef = useRef(0);
  const currentWordRef = useRef(0);
  const sessionIdRef = useRef(0);
  const pausedRef = useRef(false);
  const highlightTimerRef = useRef(null);
  const boundarySeenRef = useRef(false);

  const currentPage = rabbitStory.pages[currentPageIndex];
  const sentenceWords = useMemo(
    () => currentPage.german.map((sentence) => splitWords(sentence)),
    [currentPage],
  );

  const isSelectedWordSaved = selectedWord
    ? savedWords.some((item) => item.word === selectedWord.word)
    : false;

  useEffect(() => {
    function loadVoices() {
      const availableVoices = window.speechSynthesis.getVoices();
      const germanVoices = availableVoices.filter((voice) =>
        voice.lang.toLowerCase().startsWith("de"),
      );

      setVoices(germanVoices);

      setSelectedVoice((currentVoice) => {
        if (currentVoice) return currentVoice;

        const preferredVoice =
          germanVoices.find((voice) =>
            voice.name.toLowerCase().includes("natural"),
          ) ||
          germanVoices.find((voice) =>
            voice.name.toLowerCase().includes("online"),
          ) ||
          germanVoices.find((voice) =>
            voice.name.toLowerCase().includes("aria"),
          ) ||
          germanVoices.find((voice) =>
            voice.name.toLowerCase().includes("sonia"),
          ) ||
          germanVoices.find((voice) =>
            voice.name.toLowerCase().includes("google"),
          ) ||
          germanVoices[0];

        return preferredVoice ? preferredVoice.name : "";
      });
    }

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    const migratedWords = migrateLegacyVocabulary({
      legacyKey: "savedGermanWords",
      language: "de",
      source: rabbitStory.title,
    });

    setSavedWords(migratedWords);

    const storedProgress = localStorage.getItem(
      `storyProgress:${rabbitStory.id}`,
    );

    if (storedProgress) {
      try {
        const parsed = JSON.parse(storedProgress);

        if (
          Number.isInteger(parsed.pageIndex) &&
          Number.isInteger(parsed.sentenceIndex) &&
          Number.isInteger(parsed.wordIndex)
        ) {
          setSavedProgress(parsed);
          setCurrentPageIndex(
            Math.min(
              Math.max(parsed.pageIndex, 0),
              rabbitStory.pages.length - 1,
            ),
          );
        }
      } catch {
        localStorage.removeItem(`storyProgress:${rabbitStory.id}`);
      }
    }

    return () => {
      sessionIdRef.current += 1;
      window.speechSynthesis.cancel();

      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current);
      }

      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  useEffect(() => {
    function applySettings(nextSettings = getAppSettings()) {
      setReadingSpeed(
        Number(nextSettings.readingSpeed ?? DEFAULT_APP_SETTINGS.readingSpeed),
      );

      setShowTranslation(
        Boolean(
          nextSettings.showTranslations ??
            DEFAULT_APP_SETTINGS.showTranslations,
        ),
      );

      setFontSize(nextSettings.fontSize || DEFAULT_APP_SETTINGS.fontSize);

      setAutoContinue(
        Boolean(nextSettings.autoContinue ?? DEFAULT_APP_SETTINGS.autoContinue),
      );

      setHighlightCurrentWord(
        Boolean(
          nextSettings.highlightCurrentWord ??
            DEFAULT_APP_SETTINGS.highlightCurrentWord,
        ),
      );

      if (
        nextSettings.selectedVoice &&
        voices.some((voice) => voice.name === nextSettings.selectedVoice)
      ) {
        setSelectedVoice(nextSettings.selectedVoice);
      }
    }

    function handleSettingsUpdated(event) {
      applySettings(event.detail || getAppSettings());
    }

    function handleStorage(event) {
      if (!event.key || event.key === "storyLanguageSettings") {
        applySettings();
      }
    }

    function handleFocus() {
      applySettings();
    }

    applySettings();

    window.addEventListener("settings-updated", handleSettingsUpdated);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("settings-updated", handleSettingsUpdated);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [voices]);

  useEffect(() => {
    function refreshSavedWords() {
      setSavedWords(
        getVocabularyWords({
          language: "de",
          source: rabbitStory.title,
        }),
      );
    }

    window.addEventListener("vocabulary-updated", refreshSavedWords);
    window.addEventListener("storage", refreshSavedWords);

    return () => {
      window.removeEventListener("vocabulary-updated", refreshSavedWords);
      window.removeEventListener("storage", refreshSavedWords);
    };
  }, []);

  function saveProgress(
    pageIndex,
    sentenceIndex,
    wordIndex,
    showMessage = false,
  ) {
    const progress = {
      pageIndex,
      sentenceIndex,
      wordIndex,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      `storyProgress:${rabbitStory.id}`,
      JSON.stringify(progress),
    );

    setSavedProgress(progress);

    if (showMessage) {
      setProgressMessage("Pozice byla uložena.");

      window.setTimeout(() => {
        setProgressMessage("");
      }, 2200);
    }
  }

  function clearSavedProgress() {
    localStorage.removeItem(`storyProgress:${rabbitStory.id}`);
    setSavedProgress(null);
  }

  function getChosenVoice() {
    return voices.find((voice) => voice.name === selectedVoice);
  }

  function configureSpeech(speech) {
    const chosenVoice = getChosenVoice();

    if (chosenVoice) {
      speech.voice = chosenVoice;
      speech.lang = chosenVoice.lang;
    } else {
      speech.lang = "de-DE";
    }

    speech.rate = readingSpeed;
    speech.pitch = 1;
    speech.volume = 1;
  }

  function stopHighlightTimer() {
    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
  }

  function startFallbackHighlighting(
    pageIndex,
    sentenceIndex,
    startWordIndex,
    sessionId,
  ) {
    stopHighlightTimer();

    const words = rabbitStory.pages[pageIndex].german[sentenceIndex]
      ? splitWords(rabbitStory.pages[pageIndex].german[sentenceIndex])
      : [];

    function advance(wordIndex) {
      if (sessionId !== sessionIdRef.current) return;
      if (pausedRef.current) return;
      if (boundarySeenRef.current) return;
      if (wordIndex >= words.length) return;

      currentSentenceRef.current = sentenceIndex;
      currentWordRef.current = wordIndex;

      setHighlightedSentence(sentenceIndex);
      setHighlightedWord(wordIndex);

      saveProgress(pageIndex, sentenceIndex, wordIndex);

      highlightTimerRef.current = window.setTimeout(
        () => {
          advance(wordIndex + 1);
        },
        estimatedWordDuration(words[wordIndex], readingSpeed),
      );
    }

    advance(startWordIndex);
  }

  function speakSentence(pageIndex, sentenceIndex, startWordIndex, sessionId) {
    if (sessionId !== sessionIdRef.current) return;

    const page = rabbitStory.pages[pageIndex];

    if (!page) {
      stopReading();
      return;
    }

    if (sentenceIndex >= page.german.length) {
      stopHighlightTimer();

      if (pageIndex < rabbitStory.pages.length - 1) {
        const nextPageIndex = pageIndex + 1;

        setCurrentPageIndex(nextPageIndex);
        currentSentenceRef.current = 0;
        currentWordRef.current = 0;
        setHighlightedSentence(-1);
        setHighlightedWord(-1);

        saveProgress(nextPageIndex, 0, 0);

        window.setTimeout(() => {
          speakSentence(nextPageIndex, 0, 0, sessionId);
        }, 350);
      } else {
        currentSentenceRef.current = 0;
        currentWordRef.current = 0;
        setHighlightedSentence(-1);
        setHighlightedWord(-1);
        setIsReading(false);
        setIsPaused(false);
        pausedRef.current = false;
        markStoryAsCompleted(rabbitStory.id);
        clearSavedProgress();
      }

      return;
    }

    const fullSentence = page.german[sentenceIndex];
    const spokenText =
      startWordIndex > 0
        ? textFromWord(fullSentence, startWordIndex)
        : fullSentence;

    currentSentenceRef.current = sentenceIndex;
    currentWordRef.current = startWordIndex;
    boundarySeenRef.current = false;

    setHighlightedSentence(sentenceIndex);
    setHighlightedWord(startWordIndex);

    saveProgress(pageIndex, sentenceIndex, startWordIndex);

    const speech = new SpeechSynthesisUtterance(spokenText);
    configureSpeech(speech);

    speech.onstart = () => {
      if (sessionId !== sessionIdRef.current) return;

      setIsReading(true);
      setIsPaused(false);

      window.setTimeout(() => {
        if (!boundarySeenRef.current) {
          startFallbackHighlighting(
            pageIndex,
            sentenceIndex,
            startWordIndex,
            sessionId,
          );
        }
      }, 250);
    };

    speech.onboundary = (event) => {
      if (sessionId !== sessionIdRef.current) return;
      if (typeof event.charIndex !== "number") return;

      boundarySeenRef.current = true;
      stopHighlightTimer();

      const localWordIndex = wordIndexFromCharIndex(
        spokenText,
        event.charIndex,
      );
      const absoluteWordIndex = startWordIndex + localWordIndex;

      currentSentenceRef.current = sentenceIndex;
      currentWordRef.current = absoluteWordIndex;

      setHighlightedSentence(sentenceIndex);
      setHighlightedWord(absoluteWordIndex);

      saveProgress(pageIndex, sentenceIndex, absoluteWordIndex);
    };

    speech.onend = () => {
      if (sessionId !== sessionIdRef.current) return;
      if (pausedRef.current) return;

      stopHighlightTimer();

      currentSentenceRef.current = sentenceIndex + 1;
      currentWordRef.current = 0;

      saveProgress(pageIndex, sentenceIndex + 1, 0);

      window.setTimeout(() => {
        speakSentence(pageIndex, sentenceIndex + 1, 0, sessionId);
      }, 120);
    };

    speech.onerror = (event) => {
      if (sessionId !== sessionIdRef.current) return;
      if (event.error === "canceled" || event.error === "interrupted") return;

      stopHighlightTimer();
      alert("Předčítání se nepodařilo spustit.");

      setIsReading(false);
      setIsPaused(false);
      setHighlightedSentence(-1);
      setHighlightedWord(-1);
    };

    window.speechSynthesis.speak(speech);
  }

  function startCurrentPageFromBeginning() {
    sessionIdRef.current += 1;
    window.speechSynthesis.cancel();
    stopHighlightTimer();

    pausedRef.current = false;
    currentSentenceRef.current = 0;
    currentWordRef.current = 0;

    setSelectedWord(null);
    setIsPaused(false);

    speakSentence(currentPageIndex, 0, 0, sessionIdRef.current);
  }

  function pauseReading() {
    if (!isReading || isPaused) return;

    pausedRef.current = true;
    sessionIdRef.current += 1;

    window.speechSynthesis.cancel();
    stopHighlightTimer();

    saveProgress(
      currentPageIndex,
      currentSentenceRef.current,
      currentWordRef.current,
      true,
    );

    setIsPaused(true);
    setIsReading(true);
  }

  function continueReading() {
    if (!pausedRef.current) return;

    sessionIdRef.current += 1;
    window.speechSynthesis.cancel();
    stopHighlightTimer();

    pausedRef.current = false;
    setSelectedWord(null);
    setIsPaused(false);

    speakSentence(
      currentPageIndex,
      currentSentenceRef.current,
      currentWordRef.current,
      sessionIdRef.current,
    );
  }

  function continueSavedReading() {
    if (!savedProgress) return;

    sessionIdRef.current += 1;
    window.speechSynthesis.cancel();
    stopHighlightTimer();

    const safePageIndex = Math.min(
      Math.max(savedProgress.pageIndex, 0),
      rabbitStory.pages.length - 1,
    );

    setCurrentPageIndex(safePageIndex);

    currentSentenceRef.current = savedProgress.sentenceIndex;
    currentWordRef.current = savedProgress.wordIndex;

    pausedRef.current = false;
    setSelectedWord(null);
    setIsPaused(false);

    window.setTimeout(() => {
      speakSentence(
        safePageIndex,
        savedProgress.sentenceIndex,
        savedProgress.wordIndex,
        sessionIdRef.current,
      );
    }, 100);
  }

  function stopReading() {
    if (isReading || isPaused) {
      saveProgress(
        currentPageIndex,
        currentSentenceRef.current,
        currentWordRef.current,
      );
    }

    sessionIdRef.current += 1;
    pausedRef.current = false;

    window.speechSynthesis.cancel();
    stopHighlightTimer();

    setIsReading(false);
    setIsPaused(false);
    setSelectedWord(null);
    setHighlightedSentence(-1);
    setHighlightedWord(-1);
  }

  function saveCurrentPosition() {
    saveProgress(
      currentPageIndex,
      currentSentenceRef.current,
      currentWordRef.current,
      true,
    );
  }

  function testVoice() {
    const testSpeech = new SpeechSynthesisUtterance(
      "Hallo. Das ist eine Vorschau der ausgewählten deutschen Stimme.",
    );

    configureSpeech(testSpeech);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(testSpeech);
  }

  function handleWordClick(originalWord) {
    const cleanWord = normalizeWord(originalWord);
    if (!cleanWord) return;

    const wordInformation = dictionary[cleanWord];

    if (isReading && !isPaused) {
      pausedRef.current = true;
      sessionIdRef.current += 1;

      window.speechSynthesis.cancel();
      stopHighlightTimer();

      saveProgress(
        currentPageIndex,
        currentSentenceRef.current,
        currentWordRef.current,
      );

      setIsPaused(true);
      setIsReading(true);
    }

    setSelectedWord({
      word: cleanWord,
      translation:
        wordInformation?.translation || "Překlad zatím není ve slovníku.",
      example:
        wordInformation?.example || "Příkladová věta zatím není dostupná.",
    });
  }

  function closeWordPopup() {
    setSelectedWord(null);

    if (pausedRef.current && autoContinue) {
      window.setTimeout(() => {
        continueReading();
      }, 100);
    }
  }

  function speakSelectedWord() {
    if (!selectedWord) return;

    const speech = new SpeechSynthesisUtterance(selectedWord.word);
    configureSpeech(speech);
    speech.rate = Math.min(readingSpeed, 0.8);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  }

  function saveSelectedWord() {
    if (!selectedWord) return;

    saveVocabularyWord({
      word: selectedWord.word,
      translation: selectedWord.translation,
      language: "de",
      example: selectedWord.example || "",
      source: rabbitStory.title,
    });

    setSavedWords(
      getVocabularyWords({
        language: "de",
        source: rabbitStory.title,
      }),
    );
  }

  function removeSavedWord(word) {
    removeVocabularyWord({
      word,
      language: "de",
    });

    setSavedWords(
      getVocabularyWords({
        language: "de",
        source: rabbitStory.title,
      }),
    );
  }

  function changePage(nextIndex) {
    const safeIndex = Math.min(
      Math.max(nextIndex, 0),
      rabbitStory.pages.length - 1,
    );

    sessionIdRef.current += 1;
    pausedRef.current = false;

    window.speechSynthesis.cancel();
    stopHighlightTimer();

    setCurrentPageIndex(safeIndex);
    setIsReading(false);
    setIsPaused(false);
    setSelectedWord(null);
    setHighlightedSentence(-1);
    setHighlightedWord(-1);

    currentSentenceRef.current = 0;
    currentWordRef.current = 0;

    saveProgress(safeIndex, 0, 0);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eef7ff, #f7f4ff)",
        fontFamily: "Arial, sans-serif",
        padding: "36px 18px",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <nav
          aria-label="Navigace příběhu"
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <Link href="/stories" style={topNavigationButtonStyle}>
            ← Zpět na příběhy
          </Link>
          <Link href="/" style={homeNavigationButtonStyle}>
            ⌂ Hlavní stránka
          </Link>
        </nav>

        <header style={{ marginBottom: "24px" }}>
          <p style={{ margin: 0, color: "#64748b", fontSize: "16px" }}>
            Učte se německy pomocí příběhů
          </p>

          <h1
            style={{
              margin: "8px 0",
              color: "#172033",
              fontSize: "42px",
            }}
          >
            📚 Německé příběhy
          </h1>
        </header>

        <section
          style={{
            overflow: "hidden",
            background: "white",
            borderRadius: "24px",
            boxShadow: "0 14px 40px rgba(15, 23, 42, 0.10)",
            marginBottom: "24px",
          }}
        >
          <img
            src={rabbitStory.image}
            alt={rabbitStory.title}
            style={{
              display: "block",
              width: "100%",
              height: "300px",
              objectFit: "cover",
            }}
          />

          <div style={{ padding: "28px" }}>
            <p
              style={{
                margin: "0 0 8px",
                color: "#2563eb",
                fontWeight: "bold",
              }}
            >
              {rabbitStory.level} • {rabbitStory.estimatedMinutes} minut
            </p>

            <h2
              style={{
                margin: "0 0 6px",
                color: "#172033",
                fontSize: "34px",
              }}
            >
              {rabbitStory.title}
            </h2>

            <p
              style={{
                margin: "0 0 22px",
                color: "#64748b",
                fontSize: "16px",
              }}
            >
              Strana {currentPageIndex + 1} z {rabbitStory.pages.length} •{" "}
              {currentPage.title}
            </p>

            <div
              style={{
                padding: "18px",
                marginBottom: "22px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
              }}
            >
              <label
                htmlFor="voice"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#334155",
                  fontWeight: "bold",
                }}
              >
                Německý hlas
              </label>

              <select
                id="voice"
                value={selectedVoice}
                onChange={(event) => setSelectedVoice(event.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "16px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  background: "white",
                  color: "#172033",
                  fontSize: "16px",
                }}
              >
                {voices.length === 0 && (
                  <option value="">No Německý hlass found</option>
                )}

                {voices.map((voice) => (
                  <option
                    key={`${voice.name}-${voice.lang}`}
                    value={voice.name}
                  >
                    {voice.name} — {voice.lang}
                  </option>
                ))}
              </select>

              <label
                htmlFor="speed"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#334155",
                  fontWeight: "bold",
                }}
              >
                Rychlost čtení: {readingSpeed.toFixed(2)}×
              </label>

              <input
                id="speed"
                type="range"
                min="0.6"
                max="1.2"
                step="0.05"
                value={readingSpeed}
                onChange={(event) =>
                  setReadingSpeed(Number(event.target.value))
                }
                style={{ width: "100%" }}
              />

              <button
                type="button"
                onClick={testVoice}
                style={{
                  marginTop: "15px",
                  padding: "10px 16px",
                  border: "1px solid #94a3b8",
                  borderRadius: "10px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                🔊 Vyzkoušet hlas
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {!isReading && !isPaused && savedProgress && (
                <button
                  type="button"
                  onClick={continueSavedReading}
                  style={{
                    padding: "12px 18px",
                    border: "none",
                    borderRadius: "12px",
                    background: "#2563eb",
                    color: "white",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  ▶ Pokračovat z uložené pozice
                </button>
              )}

              {!isReading && !isPaused && (
                <button
                  type="button"
                  onClick={startCurrentPageFromBeginning}
                  style={{
                    padding: "12px 18px",
                    border: "none",
                    borderRadius: "12px",
                    background: "#16a34a",
                    color: "white",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  ▶ Přečíst tuto stránku
                </button>
              )}

              {isReading && !isPaused && (
                <button
                  type="button"
                  onClick={pauseReading}
                  style={{
                    padding: "12px 18px",
                    border: "none",
                    borderRadius: "12px",
                    background: "#f59e0b",
                    color: "white",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  ⏸ Pozastavit
                </button>
              )}

              {isPaused && (
                <button
                  type="button"
                  onClick={continueReading}
                  style={{
                    padding: "12px 18px",
                    border: "none",
                    borderRadius: "12px",
                    background: "#2563eb",
                    color: "white",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  ▶ Pokračovat
                </button>
              )}

              {(isReading || isPaused) && (
                <button
                  type="button"
                  onClick={saveCurrentPosition}
                  style={{
                    padding: "12px 18px",
                    border: "1px solid #94a3b8",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    color: "#172033",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  💾 Uložit pozici
                </button>
              )}

              <button
                type="button"
                onClick={stopReading}
                style={{
                  padding: "12px 18px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  background: "white",
                  color: "#172033",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                ■ Zastavit
              </button>

              <button
                type="button"
                onClick={() => setShowTranslation((value) => !value)}
                style={{
                  padding: "12px 18px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  background: showTranslation ? "#e0f2fe" : "white",
                  color: "#172033",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                🇨🇿 {showTranslation ? "Skrýt češtinu" : "Zobrazit češtinu"}
              </button>
            </div>

            {progressMessage && (
              <p
                style={{
                  margin: "0 0 16px",
                  color: "#16a34a",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                ✓ {progressMessage}
              </p>
            )}

            <div
              style={{
                color: "#334155",
                fontSize: `${getFontSizeInPixels(fontSize)}px`,
                lineHeight: 1.95,
              }}
            >
              {sentenceWords.map((words, sentenceIndex) => (
                <p
                  key={`sentence-${sentenceIndex}`}
                  style={{ margin: "0 0 15px" }}
                >
                  {words.map((word, wordIndex) => (
                    <span key={`${sentenceIndex}-${wordIndex}`}>
                      <button
                        type="button"
                        onClick={() => handleWordClick(word)}
                        style={{
                          display: "inline",
                          padding: "2px 4px",
                          border: "none",
                          borderRadius: "6px",
                          background:
                            highlightCurrentWord &&
                            highlightedSentence === sentenceIndex &&
                            highlightedWord === wordIndex
                              ? "#fde68a"
                              : "transparent",
                          color: "#334155",
                          font: "inherit",
                          fontWeight:
                            highlightCurrentWord &&
                            highlightedSentence === sentenceIndex &&
                            highlightedWord === wordIndex
                              ? "700"
                              : "400",
                          cursor: "pointer",
                        }}
                      >
                        {word}
                      </button>{" "}
                    </span>
                  ))}
                </p>
              ))}
            </div>

            {showTranslation && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "20px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 14px",
                    color: "#172033",
                  }}
                >
                  🇨🇿 Český překlad
                </h3>

                {currentPage.czech.map((paragraph, index) => (
                  <p
                    key={`czech-${index}`}
                    style={{
                      margin: "0 0 12px",
                      color: "#475569",
                      fontSize: "17px",
                      lineHeight: 1.65,
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: "12px",
                marginTop: "28px",
              }}
            >
              <button
                type="button"
                disabled={currentPageIndex === 0}
                onClick={() => changePage(currentPageIndex - 1)}
                style={{
                  padding: "12px 18px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  background: currentPageIndex === 0 ? "#e2e8f0" : "white",
                  color: "#172033",
                  fontSize: "16px",
                  cursor: currentPageIndex === 0 ? "not-allowed" : "pointer",
                  justifySelf: "start",
                }}
              >
                ← Předchozí
              </button>

              <div
                style={{
                  minWidth: "92px",
                  padding: "10px 14px",
                  borderRadius: "999px",
                  background: "#f1f5f9",
                  color: "#334155",
                  fontSize: "15px",
                  fontWeight: "700",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                Strana {currentPageIndex + 1} / {rabbitStory.pages.length}
              </div>

              <button
                type="button"
                disabled={currentPageIndex === rabbitStory.pages.length - 1}
                onClick={() => changePage(currentPageIndex + 1)}
                style={{
                  padding: "12px 18px",
                  border: "none",
                  borderRadius: "12px",
                  background:
                    currentPageIndex === rabbitStory.pages.length - 1
                      ? "#94a3b8"
                      : "#2563eb",
                  color: "white",
                  fontSize: "16px",
                  cursor:
                    currentPageIndex === rabbitStory.pages.length - 1
                      ? "not-allowed"
                      : "pointer",
                  justifySelf: "end",
                }}
              >
                Další →
              </button>
            </div>
          </div>
        </section>

        <section
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "24px",
            boxShadow: "0 14px 40px rgba(15, 23, 42, 0.10)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <h2 style={{ margin: 0, color: "#172033" }}>
              ⭐ Uložená německá slovíčka
            </h2>

            <a
              href="/slovnik"
              style={{
                padding: "9px 13px",
                borderRadius: "9px",
                background: "#ea580c",
                color: "white",
                fontSize: "13px",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Otevřít celý slovníček →
            </a>
          </div>

          {savedWords.length === 0 ? (
            <p style={{ color: "#64748b" }}>
              Zatím nemáš uloženo žádné slovíčko.
            </p>
          ) : (
            savedWords.map((item) => (
              <div
                key={item.word}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  padding: "12px 0",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <strong
                    style={{
                      display: "block",
                      color: "#172033",
                      fontSize: "18px",
                    }}
                  >
                    {item.word}
                  </strong>

                  <span style={{ color: "#64748b" }}>{item.translation}</span>
                </div>

                <button
                  type="button"
                  onClick={() => removeSavedWord(item.word)}
                  style={{
                    padding: "8px 11px",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    background: "#fff1f2",
                    cursor: "pointer",
                  }}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </section>
      </div>

      {selectedWord && (
        <div
          onClick={closeWordPopup}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
            background: "rgba(15, 23, 42, 0.34)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "270px",
              padding: "15px",
              borderRadius: "14px",
              background: "white",
              boxShadow: "0 16px 40px rgba(15, 23, 42, 0.26)",
            }}
          >
            <button
              type="button"
              onClick={closeWordPopup}
              aria-label="Zavřít"
              style={{
                position: "absolute",
                top: "7px",
                right: "7px",
                width: "27px",
                height: "27px",
                border: "none",
                borderRadius: "50%",
                background: "#f1f5f9",
                fontSize: "17px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <p
              style={{
                margin: "0 0 4px",
                color: "#64748b",
                fontSize: "10px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Německé slovo
            </p>

            <h2
              style={{
                margin: "0 0 4px",
                color: "#172033",
                fontSize: "23px",
                paddingRight: "34px",
              }}
            >
              {selectedWord.word}
            </h2>

            <p
              style={{
                margin: "0 0 9px",
                color: "#2563eb",
                fontSize: "17px",
                fontWeight: "bold",
              }}
            >
              {selectedWord.translation}
            </p>

            <div
              style={{
                padding: "9px",
                marginBottom: "10px",
                borderRadius: "9px",
                background: "#f8fafc",
                color: "#475569",
                fontSize: "12px",
                lineHeight: 1.4,
                fontStyle: "italic",
              }}
            >
              {selectedWord.example}
            </div>

            <button
              type="button"
              onClick={speakSelectedWord}
              style={{
                width: "100%",
                padding: "9px 11px",
                marginBottom: "8px",
                border: "none",
                borderRadius: "8px",
                background: "#2563eb",
                color: "white",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              🔊 Vyslovit slovo
            </button>

            <button
              type="button"
              onClick={saveSelectedWord}
              disabled={isSelectedWordSaved}
              style={{
                width: "100%",
                padding: "9px 11px",
                border: "none",
                borderRadius: "8px",
                background: isSelectedWordSaved ? "#16a34a" : "#f59e0b",
                color: "white",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: isSelectedWordSaved ? "default" : "pointer",
              }}
            >
              {isSelectedWordSaved
                ? "✅ Uloženo ve slovníku"
                : "⭐ Uložit slovo"}
            </button>

            {isPaused && (
              <p
                style={{
                  margin: "9px 0 0",
                  color: "#f59e0b",
                  fontSize: "10px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Po zavření bude čtení pokračovat.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}