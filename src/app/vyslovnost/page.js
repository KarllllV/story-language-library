"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  getStorySentences,
  PRONUNCIATION_LANGUAGES,
  pronunciationStories,
} from "@/data/pronunciationStories";
import {
  getUnlockedStoryIds,
  hasStoryAccess,
  subscribeToStoryAccess,
} from "@/lib/storyAccess";

const SENTENCES_PER_SET = 9999;
const LAST_SELECTION_KEY = "storyLanguageLibrary:pronunciationSelection";

function normalizeText(text) {
  return text
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:„“”"'()[\]{}–—-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordDistance(firstWords, secondWords) {
  const rows = firstWords.length + 1;
  const columns = secondWords.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(columns).fill(0));

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }

  for (let column = 0; column < columns; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const substitutionCost =
        firstWords[row - 1] === secondWords[column - 1] ? 0 : 1;

      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost,
      );
    }
  }

  return matrix[rows - 1][columns - 1];
}

function calculatePronunciationScore(expectedText, spokenText) {
  const expectedWords = normalizeText(expectedText).split(" ").filter(Boolean);
  const spokenWords = normalizeText(spokenText).split(" ").filter(Boolean);

  if (expectedWords.length === 0 || spokenWords.length === 0) {
    return 0;
  }

  const distance = wordDistance(expectedWords, spokenWords);
  const longestLength = Math.max(expectedWords.length, spokenWords.length);

  return Math.max(
    0,
    Math.min(100, Math.round((1 - distance / longestLength) * 100)),
  );
}

function getFeedback(score) {
  if (score >= 90) {
    return {
      title: "Výborná výslovnost!",
      message: "Věta byla rozpoznána téměř přesně.",
      color: "#15803d",
      background: "#f0fdf4",
      border: "#bbf7d0",
    };
  }

  if (score >= 75) {
    return {
      title: "Velmi dobré!",
      message: "Zkuste větu ještě jednou pro ještě lepší výsledek.",
      color: "#1d4ed8",
      background: "#eff6ff",
      border: "#bfdbfe",
    };
  }

  if (score >= 50) {
    return {
      title: "Dobrý pokus",
      message: "Poslechněte si pomalou verzi a zopakujte celou větu.",
      color: "#b45309",
      background: "#fffbeb",
      border: "#fde68a",
    };
  }

  return {
    title: "Zkuste to znovu",
    message: "Nejdříve si větu poslechněte pomalu a potom ji řekněte zřetelně.",
    color: "#b91c1c",
    background: "#fef2f2",
    border: "#fecaca",
  };
}

function pickRandomSentences(sentences, amount) {
  const shuffledSentences = [...sentences];

  for (let index = shuffledSentences.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledSentences[index], shuffledSentences[randomIndex]] = [
      shuffledSentences[randomIndex],
      shuffledSentences[index],
    ];
  }

  return shuffledSentences.slice(0, Math.min(amount, shuffledSentences.length));
}

export default function PronunciationPage() {
  const [selectedLanguageId, setSelectedLanguageId] = useState("cs");
  const [selectedStoryId, setSelectedStoryId] = useState("rabbit-cs");
  const [unlockedStoryIds, setUnlockedStoryIds] = useState([]);
  const [practiceSentences, setPracticeSentences] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [score, setScore] = useState(null);
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [successfulAttempts, setSuccessfulAttempts] = useState(0);

  const recognitionRef = useRef(null);

  useEffect(() => {
    setUnlockedStoryIds(getUnlockedStoryIds());

    try {
      const storedSelection = JSON.parse(
        window.localStorage.getItem(LAST_SELECTION_KEY) ?? "null",
      );

      if (storedSelection?.languageId) {
        setSelectedLanguageId(storedSelection.languageId);
      }

      if (storedSelection?.storyId) {
        setSelectedStoryId(storedSelection.storyId);
      }
    } catch {
      // Poškozené staré nastavení nebrání otevření stránky.
    }

    return subscribeToStoryAccess(setUnlockedStoryIds);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const accessibleStories = useMemo(
    () =>
      pronunciationStories.filter(
        (story) =>
          story.languageId === selectedLanguageId &&
          hasStoryAccess(story, unlockedStoryIds),
      ),
    [selectedLanguageId, unlockedStoryIds],
  );

  const selectedStory = useMemo(
    () =>
      accessibleStories.find((story) => story.id === selectedStoryId) ??
      accessibleStories[0] ??
      null,
    [accessibleStories, selectedStoryId],
  );

  const allStorySentences = useMemo(
    () => getStorySentences(selectedStory),
    [selectedStory],
  );

  const lockedStoriesCount = useMemo(
    () =>
      pronunciationStories.filter(
        (story) =>
          story.languageId === selectedLanguageId &&
          !hasStoryAccess(story, unlockedStoryIds),
      ).length,
    [selectedLanguageId, unlockedStoryIds],
  );

  const currentSentence = practiceSentences[currentSentenceIndex] ?? null;
  const feedback = score === null ? null : getFeedback(score);
  const progress =
    practiceSentences.length === 0
      ? 0
      : ((currentSentenceIndex + 1) / practiceSentences.length) * 100;

  function resetAttemptResult() {
    setRecognizedText("");
    setScore(null);
    setMessage("");
  }

  function createNewPracticeSet(sentences = allStorySentences) {
    setPracticeSentences(pickRandomSentences(sentences, SENTENCES_PER_SET));
    setCurrentSentenceIndex(0);
    resetAttemptResult();
    setAttempts(0);
    setBestScore(0);
    setSuccessfulAttempts(0);
  }

  useEffect(() => {
    if (!selectedStory) {
      setPracticeSentences([]);
      return;
    }

    setSelectedStoryId(selectedStory.id);
    createNewPracticeSet(getStorySentences(selectedStory));

    window.localStorage.setItem(
      LAST_SELECTION_KEY,
      JSON.stringify({
        languageId: selectedStory.languageId,
        storyId: selectedStory.id,
      }),
    );
  }, [selectedStory?.id]);

  function selectLanguage(languageId) {
    setSelectedLanguageId(languageId);

    const firstAccessibleStory = pronunciationStories.find(
      (story) =>
        story.languageId === languageId &&
        hasStoryAccess(story, unlockedStoryIds),
    );

    if (firstAccessibleStory) {
      setSelectedStoryId(firstAccessibleStory.id);
    }
  }

  function speakCurrentSentence(rate) {
    if (!currentSentence || !selectedStory) return;

    if (!("speechSynthesis" in window)) {
      setMessage("Tento prohlížeč nepodporuje přehrávání hlasu.");
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(currentSentence.text);
    const languagePrefix = selectedStory.speechLanguage
      .split("-")[0]
      .toLowerCase();
    const matchingVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith(languagePrefix));

    speech.lang = selectedStory.speechLanguage;
    speech.rate = rate;
    speech.pitch = 1;

    if (matchingVoice) {
      speech.voice = matchingVoice;
    }

    window.speechSynthesis.speak(speech);
  }

  function evaluateRecording(spokenText) {
    if (!currentSentence) return;

    const newScore = calculatePronunciationScore(
      currentSentence.text,
      spokenText,
    );

    setRecognizedText(spokenText);
    setScore(newScore);
    setAttempts((currentAttempts) => currentAttempts + 1);
    setBestScore((currentBestScore) => Math.max(currentBestScore, newScore));

    if (newScore >= 80) {
      setSuccessfulAttempts(
        (currentSuccessfulAttempts) => currentSuccessfulAttempts + 1,
      );
    }
  }

  function startRecording() {
    if (!currentSentence || !selectedStory) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessage(
        "Rozpoznávání řeči není v tomto prohlížeči dostupné. Použijte prosím Chrome nebo Edge.",
      );
      return;
    }

    recognitionRef.current?.abort();
    resetAttemptResult();

    const recognition = new SpeechRecognition();
    recognition.lang = selectedStory.speechLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setMessage("Poslouchám… Řekněte celou větu.");
    };

    recognition.onresult = (event) => {
      const spokenText = event.results?.[0]?.[0]?.transcript?.trim() ?? "";

      if (spokenText) {
        evaluateRecording(spokenText);
      } else {
        setMessage("Nerozuměl jsem. Zkuste větu zopakovat.");
      }
    };

    recognition.onerror = (event) => {
      const errorMessages = {
        "not-allowed": "Pro trénink je potřeba povolit přístup k mikrofonu.",
        "no-speech": "Nebyla zachycena žádná řeč. Zkuste to znovu.",
        network:
          "Rozpoznávání řeči se nemohlo připojit. Zkontrolujte internet.",
      };

      setMessage(
        errorMessages[event.error] ??
          "Rozpoznávání se nezdařilo. Zkuste to znovu.",
      );
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsRecording(false);
      setMessage("Mikrofon se nepodařilo spustit. Zkuste to znovu.");
    }
  }

  function goToSentence(nextIndex) {
    if (practiceSentences.length === 0) return;

    const safeIndex = Math.min(
      Math.max(nextIndex, 0),
      practiceSentences.length - 1,
    );

    recognitionRef.current?.abort();
    window.speechSynthesis?.cancel();
    setCurrentSentenceIndex(safeIndex);
    resetAttemptResult();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px 18px 60px",
        background:
          "linear-gradient(135deg, #faf5ff 0%, #f8fbff 55%, #eef6ff 100%)",
        color: "#172033",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "14px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#7c3aed",
              fontWeight: "800",
              textDecoration: "none",
            }}
          >
            ← Zpět na hlavní stránku
          </Link>

          <button
            type="button"
            onClick={() => createNewPracticeSet()}
            disabled={!selectedStory}
            style={{
              padding: "10px 15px",
              border: "1px solid #d8b4fe",
              borderRadius: "11px",
              background: "white",
              color: "#7e22ce",
              fontWeight: "800",
              cursor: selectedStory ? "pointer" : "not-allowed",
            }}
          >
            🔀 Nový výběr vět
          </button>
        </div>

        <header
          style={{
            maxWidth: "760px",
            margin: "0 auto 30px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "68px",
              height: "68px",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 13px",
              borderRadius: "20px",
              background: "#ede9fe",
              fontSize: "35px",
              boxShadow: "0 12px 30px rgba(124,58,237,0.15)",
            }}
          >
            🗣️
          </div>

          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(38px, 6vw, 58px)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            Výslovnost z vašich příběhů
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "17px",
              lineHeight: 1.65,
            }}
          >
            Vyberte si jazyk a příběh. Procvičovat budete skutečné věty přímo z jeho textu.
          </p>
        </header>

        <section
          style={{
            marginBottom: "22px",
            padding: "22px",
            border: "1px solid #e2e8f0",
            borderRadius: "22px",
            background: "rgba(255,255,255,0.88)",
            boxShadow: "0 14px 36px rgba(15,23,42,0.07)",
          }}
        >
          <h2
            style={{
              margin: "0 0 13px",
              fontSize: "20px",
            }}
          >
            1. Vyberte jazyk
          </h2>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            {PRONUNCIATION_LANGUAGES.map((language) => {
              const isSelected = language.id === selectedLanguageId;

              return (
                <button
                  key={language.id}
                  type="button"
                  onClick={() => selectLanguage(language.id)}
                  style={{
                    padding: "11px 17px",
                    border: isSelected
                      ? "1px solid #7c3aed"
                      : "1px solid #dbe3ef",
                    borderRadius: "999px",
                    background: isSelected
                      ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                      : "white",
                    color: isSelected ? "white" : "#334155",
                    fontSize: "15px",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: isSelected
                      ? "0 8px 20px rgba(124,58,237,0.22)"
                      : "none",
                  }}
                >
                  {language.flag} {language.label}
                </button>
              );
            })}
          </div>

          <h2
            style={{
              margin: "0 0 13px",
              fontSize: "20px",
            }}
          >
            2. Vyberte dostupný příběh
          </h2>

          {accessibleStories.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "13px",
              }}
            >
              {accessibleStories.map((story) => {
                const isSelected = story.id === selectedStory?.id;

                return (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => setSelectedStoryId(story.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "13px",
                      padding: "13px",
                      border: isSelected
                        ? "2px solid #8b5cf6"
                        : "1px solid #dbe3ef",
                      borderRadius: "15px",
                      background: isSelected ? "#f5f3ff" : "white",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={story.image}
                      alt=""
                      style={{
                        width: "58px",
                        height: "58px",
                        borderRadius: "12px",
                        objectFit: "cover",
                      }}
                    />

                    <span>
                      <strong
                        style={{
                          display: "block",
                          marginBottom: "5px",
                          color: "#172033",
                          fontSize: "15px",
                        }}
                      >
                        {story.title}
                      </strong>
                      <span
                        style={{
                          color: "#64748b",
                          fontSize: "12px",
                        }}
                      >
                        {story.level} • {story.free ? "Zdarma" : "Zakoupeno"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: "16px",
                borderRadius: "13px",
                background: "#fff7ed",
                color: "#9a3412",
                lineHeight: 1.55,
              }}
            >
              V tomto jazyce zatím nemáte dostupný žádný příběh.
            </div>
          )}

          {lockedStoriesCount > 0 && (
            <p
              style={{
                margin: "13px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              🔒 Další příběhy se zde automaticky objeví po jejich odemčení.
            </p>
          )}
        </section>

        {currentSentence && selectedStory ? (
          <>
            <section
              style={{
                overflow: "hidden",
                border: "1px solid #ddd6fe",
                borderRadius: "22px",
                background: "white",
                boxShadow: "0 18px 48px rgba(76,29,149,0.12)",
              }}
            >
              <div
                style={{
                  padding: "15px 20px",
                  background: "#faf5ff",
                  borderBottom: "1px solid #ede9fe",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "10px",
                    color: "#7e22ce",
                    fontSize: "13px",
                    fontWeight: "800",
                  }}
                >
                  <span>
                    Věta {currentSentenceIndex + 1} z {practiceSentences.length}
                  </span>
                  <span>
                    {selectedStory.flag} {selectedStory.title} • strana{" "}
                    {currentSentence.page}
                  </span>
                </div>

                <div
                  style={{
                    height: "6px",
                    overflow: "hidden",
                    borderRadius: "999px",
                    background: "#e9d5ff",
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "100%",
                      borderRadius: "999px",
                      background: "linear-gradient(90deg, #7c3aed, #c026d3)",
                      transition: "width 200ms ease",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "32px 24px 26px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: "0 0 13px",
                    color: "#7c3aed",
                    fontSize: "12px",
                    fontWeight: "900",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Poslechněte si větu a zopakujte ji
                </p>

                <h2
                  style={{
                    maxWidth: "820px",
                    margin: "0 auto 13px",
                    fontSize: "clamp(28px, 4vw, 40px)",
                    lineHeight: 1.3,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {currentSentence.text}
                </h2>

                {currentSentence.translation && (
                  <p
                    style={{
                      margin: "0 auto 22px",
                      color: "#64748b",
                      fontSize: "15px",
                      lineHeight: 1.55,
                    }}
                  >
                    {currentSentence.translation}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "22px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => speakCurrentSentence(0.9)}
                    style={{
                      padding: "11px 16px",
                      border: "1px solid #d8b4fe",
                      borderRadius: "11px",
                      background: "#faf5ff",
                      color: "#7e22ce",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    🔊 Přehrát normálně
                  </button>

                  <button
                    type="button"
                    onClick={() => speakCurrentSentence(0.62)}
                    style={{
                      padding: "11px 16px",
                      border: "1px solid #d8b4fe",
                      borderRadius: "11px",
                      background: "#faf5ff",
                      color: "#7e22ce",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    🐢 Přehrát pomalu
                  </button>
                </div>

                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isRecording}
                  style={{
                    minWidth: "220px",
                    padding: "14px 20px",
                    border: "none",
                    borderRadius: "13px",
                    background: isRecording
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #7c3aed, #a855f7)",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "900",
                    cursor: isRecording ? "wait" : "pointer",
                    boxShadow: isRecording
                      ? "none"
                      : "0 12px 28px rgba(124,58,237,0.24)",
                  }}
                >
                  {isRecording ? "🎙️ Poslouchám…" : "🎤 Spustit nahrávání"}
                </button>

                {message && score === null && (
                  <p
                    style={{
                      margin: "14px 0 0",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    {message}
                  </p>
                )}

                {feedback && (
                  <div
                    style={{
                      maxWidth: "700px",
                      margin: "22px auto 0",
                      padding: "17px",
                      border: `1px solid ${feedback.border}`,
                      borderRadius: "14px",
                      background: feedback.background,
                      color: feedback.color,
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "14px",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <strong style={{ fontSize: "18px" }}>
                        {feedback.title}
                      </strong>
                      <strong style={{ fontSize: "25px" }}>{score} %</strong>
                    </div>

                    <p
                      style={{
                        margin: "0 0 10px",
                        lineHeight: 1.55,
                      }}
                    >
                      {feedback.message}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color: "#475569",
                        fontSize: "14px",
                        lineHeight: 1.55,
                      }}
                    >
                      <strong>Rozpoznáno:</strong> {recognizedText}
                    </p>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "17px 20px",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => goToSentence(currentSentenceIndex - 1)}
                  disabled={currentSentenceIndex === 0}
                  style={{
                    padding: "10px 15px",
                    border: "1px solid #dbe3ef",
                    borderRadius: "10px",
                    background: "white",
                    color: "#334155",
                    fontWeight: "800",
                    cursor:
                      currentSentenceIndex === 0 ? "not-allowed" : "pointer",
                    opacity: currentSentenceIndex === 0 ? 0.5 : 1,
                  }}
                >
                  ← Předchozí
                </button>

                <button
                  type="button"
                  onClick={() => goToSentence(currentSentenceIndex + 1)}
                  disabled={
                    currentSentenceIndex === practiceSentences.length - 1
                  }
                  style={{
                    padding: "10px 15px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#9333ea",
                    color: "white",
                    fontWeight: "800",
                    cursor:
                      currentSentenceIndex === practiceSentences.length - 1
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      currentSentenceIndex === practiceSentences.length - 1
                        ? 0.5
                        : 1,
                  }}
                >
                  Další věta →
                </button>
              </div>
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "13px",
                marginTop: "18px",
              }}
            >
              {[
                {
                  icon: "🎤",
                  value: attempts,
                  label: "Celkem pokusů",
                },
                {
                  icon: "🏆",
                  value: `${bestScore} %`,
                  label: "Nejlepší výsledek",
                },
                {
                  icon: "✅",
                  value: successfulAttempts,
                  label: "Úspěšných pokusů",
                },
              ].map((statistic) => (
                <div
                  key={statistic.label}
                  style={{
                    padding: "19px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "15px",
                    background: "white",
                    textAlign: "center",
                    boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "6px",
                      fontSize: "24px",
                    }}
                  >
                    {statistic.icon}
                  </div>
                  <strong
                    style={{
                      display: "block",
                      color: "#7c3aed",
                      fontSize: "24px",
                    }}
                  >
                    {statistic.value}
                  </strong>
                  <span
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                    }}
                  >
                    {statistic.label}
                  </span>
                </div>
              ))}
            </section>
          </>
        ) : (
          <section
            style={{
              padding: "30px",
              border: "1px dashed #c4b5fd",
              borderRadius: "20px",
              background: "white",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Vyberte si jazyk a dostupný příběh.
          </section>
        )}
      </div>
    </main>
  );
}