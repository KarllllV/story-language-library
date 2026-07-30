"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./pokrok.css";

const VOCABULARY_KEY = "storyLanguageVocabulary";
const PRONUNCIATION_KEY = "pronunciationStats";
const COMPLETED_STORIES_KEY = "completedStories";
const CONVERSATION_STATS_KEY = "conversationStats";
const PEXESO_STATS_KEY = "pexesoStats";
const QUIZ_STATS_KEY = "quizStats";
const CROSSWORD_STATS_KEY = "crosswordStats";

const LANGUAGE_LABELS = {
  en: {
    label: "Angličtina",
    flag: "🇬🇧",
  },
  de: {
    label: "Němčina",
    flag: "🇩🇪",
  },
  cs: {
    label: "Čeština",
    flag: "🇨🇿",
  },
};

const PEXESO_STORY_LABELS = {
  rabbit: {
    title: "Oliver a tajemný les",
    label: "Králík",
    icon: "🐰",
  },
  horse: {
    title: "Statečný kůň",
    label: "Kůň",
    icon: "🐴",
  },
  fox: {
    title: "Chytrá liška a tajemství Stříbrného pramene",
    label: "Liška",
    icon: "🦊",
  },
};

const STORY_CONFIG = {
  rabbit: {
    title: "Oliver a tajemný les – angličtina",
    href: "/stories/rabbit",
    icon: "🐰",
  },
  rabbitde: {
    title: "Oliver a tajemný les – němčina",
    href: "/stories/rabbitde",
    icon: "🐰",
  },
  rabbitcz: {
    title: "Oliver a tajemný les – čeština",
    href: "/stories/rabbitcz",
    icon: "🐰",
  },
  horse: {
    title: "Statečný kůň – angličtina",
    href: "/stories/horse",
    icon: "🐴",
  },
  horsede: {
    title: "Statečný kůň – němčina",
    href: "/stories/horsede",
    icon: "🐴",
  },
  horsecz: {
    title: "Statečný kůň – čeština",
    href: "/stories/horsecz",
    icon: "🐴",
  },
  fox: {
    title: "Chytrá liška a tajemství Stříbrného pramene – angličtina",
    href: "/stories/fox",
    icon: "🦊",
  },
  foxde: {
    title: "Chytrá liška a tajemství Stříbrného pramene – němčina",
    href: "/stories/foxde",
    icon: "🦊",
  },
  foxcz: {
    title: "Chytrá liška a tajemství Stříbrného pramene – čeština",
    href: "/stories/foxcz",
    icon: "🦊",
  },
  "oliver-secret-forest": {
    title: "Oliver a tajemný les – angličtina",
    href: "/stories/rabbit",
    icon: "🐰",
  },
  "oliver-secret-forest-en": {
    title: "Oliver a tajemný les – angličtina",
    href: "/stories/rabbit",
    icon: "🐰",
  },
  "oliver-secret-forest-de": {
    title: "Oliver a tajemný les – němčina",
    href: "/stories/rabbitde",
    icon: "🐰",
  },
  "oliver-secret-forest-cz": {
    title: "Oliver a tajemný les – čeština",
    href: "/stories/rabbitcz",
    icon: "🐰",
  },
  "brave-horse": {
    title: "Statečný kůň – angličtina",
    href: "/stories/horse",
    icon: "🐴",
  },
  "das-tapfere-pferd": {
    title: "Statečný kůň – němčina",
    href: "/stories/horsede",
    icon: "🐴",
  },
  "statecny-kun": {
    title: "Statečný kůň – čeština",
    href: "/stories/horsecz",
    icon: "🐴",
  },
  "clever-fox-silver-spring": {
    title: "Chytrá liška a tajemství Stříbrného pramene – angličtina",
    href: "/stories/fox",
    icon: "🦊",
  },
  "die-kluge-fuechsin-silberquelle": {
    title: "Chytrá liška a tajemství Stříbrného pramene – němčina",
    href: "/stories/foxde",
    icon: "🦊",
  },
  "chytra-liska-stribrny-pramen": {
    title: "Chytrá liška a tajemství Stříbrného pramene – čeština",
    href: "/stories/foxcz",
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

function normalizeVocabularyItem(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  return {
    ...item,
    language: ["en", "de", "cs"].includes(item.language) ? item.language : "en",
    learned: Boolean(item.learned),
    reviewCount: Number(item.reviewCount || 0),
    correctCount: Number(item.correctCount || 0),
    createdAt: item.createdAt || null,
  };
}

function readVocabulary() {
  const parsed = safelyParse(localStorage.getItem(VOCABULARY_KEY), []);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map(normalizeVocabularyItem).filter(Boolean);
}

function readPronunciationStats() {
  const parsed = safelyParse(localStorage.getItem(PRONUNCIATION_KEY), {});

  return {
    attempts: Number(parsed.attempts || 0),
    best: Number(parsed.bestScore ?? parsed.best ?? 0),
    successful: Number(parsed.completed ?? parsed.successful ?? 0),
  };
}

function readConversationStats() {
  const parsed = safelyParse(localStorage.getItem(CONVERSATION_STATS_KEY), {});

  return {
    sessions: Number(parsed.sessions || 0),
    messages: Number(parsed.messages || 0),
    corrections: Number(parsed.corrections || 0),
  };
}

function normalizePexesoSummary(summary) {
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

function normalizePexesoResult(result) {
  if (!result || typeof result !== "object") {
    return null;
  }

  const moves = Number(result.moves);
  const pairCount = Number(result.pairCount);
  const score = Number(result.score);

  if (
    !["en", "de", "cs"].includes(result.language) ||
    !Object.hasOwn(PEXESO_STORY_LABELS, result.story) ||
    !Number.isFinite(moves) ||
    moves <= 0
  ) {
    return null;
  }

  return {
    id:
      result.id ||
      `${result.language}-${result.story}-${result.playedAt || moves}`,
    language: result.language,
    story: result.story,
    moves,
    pairCount: Number.isFinite(pairCount) && pairCount > 0 ? pairCount : 8,
    score:
      Number.isFinite(score) && score >= 0
        ? Math.min(100, Math.round(score))
        : calculatePexesoScore(moves, pairCount || 8),
    playedAt: result.playedAt || null,
  };
}

function readPexesoStats() {
  const parsed = safelyParse(localStorage.getItem(PEXESO_STATS_KEY), {});
  const summary = normalizePexesoSummary(parsed);

  return {
    ...summary,
    byLanguage: Object.fromEntries(
      Object.keys(LANGUAGE_LABELS).map((language) => [
        language,
        normalizePexesoSummary(parsed?.byLanguage?.[language]),
      ]),
    ),
    byStory: Object.fromEntries(
      Object.keys(PEXESO_STORY_LABELS).map((story) => [
        story,
        normalizePexesoSummary(parsed?.byStory?.[story]),
      ]),
    ),
    history: (Array.isArray(parsed?.history) ? parsed.history : [])
      .map(normalizePexesoResult)
      .filter(Boolean)
      .slice(0, 50),
  };
}

function calculatePexesoScore(moves, pairCount = 8) {
  if (!Number.isFinite(moves) || moves <= 0 || pairCount <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round((pairCount / moves) * 100)));
}

function getPexesoRating(score) {
  if (score >= 90) {
    return "Vynikající";
  }

  if (score >= 75) {
    return "Skvělé";
  }

  if (score >= 55) {
    return "Dobré";
  }

  if (score >= 35) {
    return "Pěkný trénink";
  }

  return "Procvičujte dál";
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

function normalizeQuizResult(result) {
  if (!result || typeof result !== "object") {
    return null;
  }

  const correctAnswers = Number(result.correctAnswers);
  const questionCount = Number(result.questionCount);
  const percentage = Number(result.percentage);

  if (
    !["en", "de", "cs"].includes(result.language) ||
    !Object.hasOwn(PEXESO_STORY_LABELS, result.story) ||
    !Number.isFinite(correctAnswers) ||
    !Number.isFinite(questionCount) ||
    questionCount <= 0
  ) {
    return null;
  }

  const normalizedCorrectAnswers = Math.max(
    0,
    Math.min(questionCount, correctAnswers),
  );
  const calculatedPercentage = Math.round(
    (normalizedCorrectAnswers / questionCount) * 100,
  );

  return {
    id:
      result.id ||
      `${result.language}-${result.story}-${result.playedAt || questionCount}`,
    language: result.language,
    story: result.story,
    correctAnswers: normalizedCorrectAnswers,
    questionCount,
    percentage:
      Number.isFinite(percentage) && percentage >= 0
        ? Math.min(100, Math.round(percentage))
        : calculatedPercentage,
    playedAt: result.playedAt || null,
  };
}

function readQuizStats() {
  const parsed = safelyParse(localStorage.getItem(QUIZ_STATS_KEY), {});
  const summary = normalizeQuizSummary(parsed);

  return {
    ...summary,
    byLanguage: Object.fromEntries(
      Object.keys(LANGUAGE_LABELS).map((language) => [
        language,
        normalizeQuizSummary(parsed?.byLanguage?.[language]),
      ]),
    ),
    byStory: Object.fromEntries(
      Object.keys(PEXESO_STORY_LABELS).map((story) => [
        story,
        normalizeQuizSummary(parsed?.byStory?.[story]),
      ]),
    ),
    history: (Array.isArray(parsed?.history) ? parsed.history : [])
      .map(normalizeQuizResult)
      .filter(Boolean)
      .slice(0, 50),
  };
}

function getQuizRating(percentage) {
  if (percentage === 100) {
    return "Bezchybný výkon";
  }

  if (percentage >= 80) {
    return "Výborné";
  }

  if (percentage >= 60) {
    return "Velmi dobré";
  }

  if (percentage >= 40) {
    return "Dobrý základ";
  }

  return "Zkuste to znovu";
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

function normalizeCrosswordResult(result) {
  if (!result || typeof result !== "object") {
    return null;
  }

  const wordCount = Number(result.wordCount);
  const score = Number(result.score);
  const hintsUsed = Math.max(0, Number(result.hintsUsed || 0));
  const failedChecks = Math.max(0, Number(result.failedChecks || 0));
  const timeSeconds = Math.max(0, Number(result.timeSeconds || 0));

  if (
    !["en", "de", "cs"].includes(result.language) ||
    !Object.hasOwn(PEXESO_STORY_LABELS, result.story) ||
    !Number.isFinite(wordCount) ||
    wordCount <= 0 ||
    !Number.isFinite(score)
  ) {
    return null;
  }

  return {
    id:
      result.id ||
      `${result.language}-${result.story}-${result.playedAt || wordCount}`,
    language: result.language,
    story: result.story,
    wordCount,
    score: Math.max(0, Math.min(100, Math.round(score))),
    hintsUsed,
    failedChecks,
    timeSeconds,
    playedAt: result.playedAt || null,
  };
}

function readCrosswordStats() {
  const parsed = safelyParse(localStorage.getItem(CROSSWORD_STATS_KEY), {});
  const summary = normalizeCrosswordSummary(parsed);

  return {
    ...summary,
    byLanguage: Object.fromEntries(
      Object.keys(LANGUAGE_LABELS).map((language) => [
        language,
        normalizeCrosswordSummary(parsed?.byLanguage?.[language]),
      ]),
    ),
    byStory: Object.fromEntries(
      Object.keys(PEXESO_STORY_LABELS).map((story) => [
        story,
        normalizeCrosswordSummary(parsed?.byStory?.[story]),
      ]),
    ),
    history: (Array.isArray(parsed?.history) ? parsed.history : [])
      .map(normalizeCrosswordResult)
      .filter(Boolean)
      .slice(0, 50),
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

function formatDuration(totalSeconds) {
  const safeSeconds = Math.max(0, Math.round(Number(totalSeconds || 0)));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function readCompletedStories() {
  const parsed = safelyParse(localStorage.getItem(COMPLETED_STORIES_KEY), []);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (parsed && typeof parsed === "object") {
    return Object.values(parsed);
  }

  return [];
}

function getStoryTitle(storyId, progress) {
  return (
    progress?.storyTitle ||
    progress?.title ||
    STORY_CONFIG[storyId]?.title ||
    storyId
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function getStoryHref(storyId, progress) {
  const storedHref = progress?.href || progress?.storyHref || progress?.route;
  const isKnownStoredHref = Object.values(STORY_CONFIG).some(
    (story) => story.href === storedHref,
  );

  if (isKnownStoredHref) {
    return storedHref;
  }

  return STORY_CONFIG[storyId]?.href || "/stories";
}

function readStoryProgress() {
  const stories = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key?.startsWith("storyProgress:")) {
      continue;
    }

    const storyId = key.replace("storyProgress:", "");

    const progress = safelyParse(localStorage.getItem(key), null);

    if (!progress) {
      continue;
    }

    stories.push({
      id: storyId,
      title: getStoryTitle(storyId, progress),
      href: getStoryHref(storyId, progress),
      icon: STORY_CONFIG[storyId]?.icon || "📘",
      pageIndex: Number(progress.pageIndex || 0),
      sentenceIndex: Number(progress.sentenceIndex || 0),
      wordIndex: Number(progress.wordIndex || 0),
      savedAt: progress.savedAt || null,
    });
  }

  return stories.sort((first, second) => {
    const firstDate = first.savedAt ? new Date(first.savedAt).getTime() : 0;
    const secondDate = second.savedAt ? new Date(second.savedAt).getTime() : 0;

    return secondDate - firstDate;
  });
}

function formatDate(value) {
  if (!value) {
    return "Datum není k dispozici";
  }

  try {
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Datum není k dispozici";
  }
}

function getLevel(score) {
  if (score >= 85) {
    return {
      name: "Jazykový mistr",
      emoji: "👑",
      next: 100,
    };
  }

  if (score >= 65) {
    return {
      name: "Pokročilý student",
      emoji: "🏆",
      next: 85,
    };
  }

  if (score >= 40) {
    return {
      name: "Pravidelný student",
      emoji: "🚀",
      next: 65,
    };
  }

  if (score >= 15) {
    return {
      name: "Aktivní začátečník",
      emoji: "🌱",
      next: 40,
    };
  }

  return {
    name: "Nový student",
    emoji: "📘",
    next: 15,
  };
}

export default function ProgressPage() {
  const [data, setData] = useState({
    vocabulary: [],
    pronunciation: {
      attempts: 0,
      best: 0,
      successful: 0,
    },
    stories: [],
    completedStories: [],
    conversation: {
      sessions: 0,
      messages: 0,
      corrections: 0,
    },
    pexeso: {
      gamesCompleted: 0,
      totalMoves: 0,
      totalScore: 0,
      bestMoves: null,
      lastPlayedAt: null,
      byLanguage: {},
      byStory: {},
      history: [],
    },
    quiz: {
      gamesCompleted: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      totalPercentage: 0,
      bestPercentage: null,
      lastPlayedAt: null,
      byLanguage: {},
      byStory: {},
      history: [],
    },
    crossword: {
      gamesCompleted: 0,
      totalWords: 0,
      totalScore: 0,
      totalHints: 0,
      totalTimeSeconds: 0,
      bestScore: null,
      lastPlayedAt: null,
      byLanguage: {},
      byStory: {},
      history: [],
    },
  });

  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("study");

  const loadProgress = useCallback(() => {
    setData({
      vocabulary: readVocabulary(),
      pronunciation: readPronunciationStats(),
      stories: readStoryProgress(),
      completedStories: readCompletedStories(),
      conversation: readConversationStats(),
      pexeso: readPexesoStats(),
      quiz: readQuizStats(),
      crossword: readCrosswordStats(),
    });
  }, []);

  useEffect(() => {
    loadProgress();

    function handleStorageChange() {
      loadProgress();
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("vocabulary-updated", handleStorageChange);
    window.addEventListener("pexeso-stats-updated", handleStorageChange);
    window.addEventListener("quiz-stats-updated", handleStorageChange);
    window.addEventListener("crossword-stats-updated", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("vocabulary-updated", handleStorageChange);
      window.removeEventListener("pexeso-stats-updated", handleStorageChange);
      window.removeEventListener("quiz-stats-updated", handleStorageChange);
      window.removeEventListener(
        "crossword-stats-updated",
        handleStorageChange,
      );
      window.removeEventListener("focus", handleStorageChange);
    };
  }, [loadProgress]);

  const statistics = useMemo(() => {
    const totalWords = data.vocabulary.length;
    const learnedWords = data.vocabulary.filter((item) => item.learned).length;

    const reviewedWords = data.vocabulary.filter(
      (item) => item.reviewCount > 0,
    ).length;

    const vocabularyByLanguage = Object.keys(LANGUAGE_LABELS).map(
      (language) => {
        const languageWords = data.vocabulary.filter(
          (item) => item.language === language,
        );

        const learned = languageWords.filter((item) => item.learned).length;

        const percentage =
          languageWords.length > 0
            ? Math.round((learned / languageWords.length) * 100)
            : 0;

        return {
          language,
          total: languageWords.length,
          learned,
          percentage,
        };
      },
    );

    function createPexesoBreakdown(keys, source) {
      return keys.map((key) => {
        const item = normalizePexesoSummary(source?.[key]);
        const averageMoves =
          item.gamesCompleted > 0
            ? Math.round((item.totalMoves / item.gamesCompleted) * 10) / 10
            : 0;
        const averageScore =
          item.gamesCompleted > 0
            ? Math.round(item.totalScore / item.gamesCompleted)
            : 0;

        return {
          key,
          ...item,
          averageMoves,
          averageScore,
        };
      });
    }

    function createQuizBreakdown(keys, source) {
      return keys.map((key) => {
        const item = normalizeQuizSummary(source?.[key]);
        const averagePercentage =
          item.gamesCompleted > 0
            ? Math.round(item.totalPercentage / item.gamesCompleted)
            : 0;
        const accuracy =
          item.totalQuestions > 0
            ? Math.round((item.totalCorrect / item.totalQuestions) * 100)
            : 0;

        return {
          key,
          ...item,
          averagePercentage,
          accuracy,
        };
      });
    }

    function createCrosswordBreakdown(keys, source) {
      return keys.map((key) => {
        const item = normalizeCrosswordSummary(source?.[key]);
        const averageScore =
          item.gamesCompleted > 0
            ? Math.round(item.totalScore / item.gamesCompleted)
            : 0;
        const averageHints =
          item.gamesCompleted > 0
            ? Math.round((item.totalHints / item.gamesCompleted) * 10) / 10
            : 0;
        const averageTimeSeconds =
          item.gamesCompleted > 0
            ? Math.round(item.totalTimeSeconds / item.gamesCompleted)
            : 0;

        return {
          key,
          ...item,
          averageScore,
          averageHints,
          averageTimeSeconds,
        };
      });
    }

    const pexesoGames = data.pexeso.gamesCompleted;
    const pexesoAverageMoves =
      pexesoGames > 0
        ? Math.round((data.pexeso.totalMoves / pexesoGames) * 10) / 10
        : 0;
    const pexesoAverageScore =
      pexesoGames > 0 ? Math.round(data.pexeso.totalScore / pexesoGames) : 0;
    const pexesoBestScore = data.pexeso.bestMoves
      ? calculatePexesoScore(data.pexeso.bestMoves)
      : 0;
    const pexesoByLanguage = createPexesoBreakdown(
      Object.keys(LANGUAGE_LABELS),
      data.pexeso.byLanguage,
    );
    const pexesoByStory = createPexesoBreakdown(
      Object.keys(PEXESO_STORY_LABELS),
      data.pexeso.byStory,
    );
    const quizGames = data.quiz.gamesCompleted;
    const quizAveragePercentage =
      quizGames > 0 ? Math.round(data.quiz.totalPercentage / quizGames) : 0;
    const quizAccuracy =
      data.quiz.totalQuestions > 0
        ? Math.round((data.quiz.totalCorrect / data.quiz.totalQuestions) * 100)
        : 0;
    const quizBestPercentage = data.quiz.bestPercentage ?? 0;
    const quizByLanguage = createQuizBreakdown(
      Object.keys(LANGUAGE_LABELS),
      data.quiz.byLanguage,
    );
    const quizByStory = createQuizBreakdown(
      Object.keys(PEXESO_STORY_LABELS),
      data.quiz.byStory,
    );
    const crosswordGames = data.crossword.gamesCompleted;
    const crosswordAverageScore =
      crosswordGames > 0
        ? Math.round(data.crossword.totalScore / crosswordGames)
        : 0;
    const crosswordBestScore = data.crossword.bestScore ?? 0;
    const crosswordAverageHints =
      crosswordGames > 0
        ? Math.round((data.crossword.totalHints / crosswordGames) * 10) / 10
        : 0;
    const crosswordAverageTimeSeconds =
      crosswordGames > 0
        ? Math.round(data.crossword.totalTimeSeconds / crosswordGames)
        : 0;
    const crosswordByLanguage = createCrosswordBreakdown(
      Object.keys(LANGUAGE_LABELS),
      data.crossword.byLanguage,
    );
    const crosswordByStory = createCrosswordBreakdown(
      Object.keys(PEXESO_STORY_LABELS),
      data.crossword.byStory,
    );

    const vocabularyPoints = Math.min(
      35,
      learnedWords * 3 + reviewedWords * 0.5,
    );

    const pronunciationPoints = Math.min(
      25,
      data.pronunciation.successful * 2 + data.pronunciation.attempts * 0.25,
    );

    const storyPoints = Math.min(
      25,
      data.completedStories.length * 12 + data.stories.length * 3,
    );

    const conversationPoints = Math.min(
      15,
      data.conversation.messages * 0.4 + data.conversation.corrections * 0.5,
    );

    const pexesoPoints =
      pexesoGames > 0
        ? Math.min(
            20,
            Math.min(12, pexesoGames * 2) +
              Math.min(8, pexesoAverageScore * 0.08),
          )
        : 0;

    const quizPoints =
      quizGames > 0
        ? Math.min(
            20,
            Math.min(12, quizGames * 2) +
              Math.min(8, quizAveragePercentage * 0.08),
          )
        : 0;

    const crosswordPoints =
      crosswordGames > 0
        ? Math.min(
            20,
            Math.min(12, crosswordGames * 2) +
              Math.min(8, crosswordAverageScore * 0.08),
          )
        : 0;

    const score = Math.min(
      100,
      Math.round(
        vocabularyPoints +
          pronunciationPoints +
          storyPoints +
          conversationPoints +
          pexesoPoints +
          quizPoints +
          crosswordPoints,
      ),
    );

    return {
      totalWords,
      learnedWords,
      learningWords: totalWords - learnedWords,
      reviewedWords,
      vocabularyByLanguage,
      pexesoGames,
      pexesoAverageMoves,
      pexesoAverageScore,
      pexesoBestScore,
      pexesoByLanguage,
      pexesoByStory,
      pexesoPoints: Math.round(pexesoPoints),
      quizGames,
      quizAveragePercentage,
      quizAccuracy,
      quizBestPercentage,
      quizByLanguage,
      quizByStory,
      quizPoints: Math.round(quizPoints),
      crosswordGames,
      crosswordAverageScore,
      crosswordBestScore,
      crosswordAverageHints,
      crosswordAverageTimeSeconds,
      crosswordByLanguage,
      crosswordByStory,
      crosswordPoints: Math.round(crosswordPoints),
      score,
      level: getLevel(score),
    };
  }, [data]);

  const achievements = useMemo(
    () => [
      {
        icon: "📝",
        title: "První slovíčko",
        description: "Uložili jste své první slovíčko.",
        unlocked: statistics.totalWords >= 1,
      },
      {
        icon: "📚",
        title: "Sbírka deseti slov",
        description: "Máte ve slovníčku alespoň 10 slov.",
        unlocked: statistics.totalWords >= 10,
      },
      {
        icon: "🧠",
        title: "První naučené slovo",
        description: "Označili jste první slovo jako naučené.",
        unlocked: statistics.learnedWords >= 1,
      },
      {
        icon: "🎤",
        title: "První pokus o výslovnost",
        description: "Vyzkoušeli jste trénink výslovnosti.",
        unlocked: data.pronunciation.attempts >= 1,
      },
      {
        icon: "🏆",
        title: "Výslovnost nad 90 %",
        description: "Dosáhli jste výsledku alespoň 90 %.",
        unlocked: data.pronunciation.best >= 90,
      },
      {
        icon: "📖",
        title: "První rozečtený příběh",
        description: "Uložili jste si pozici v příběhu.",
        unlocked: data.stories.length >= 1,
      },
      {
        icon: "✅",
        title: "Dokončený příběh",
        description: "Dokončili jste celý příběh.",
        unlocked: data.completedStories.length >= 1,
      },
      {
        icon: "💬",
        title: "Deset odpovědí",
        description: "Odeslali jste 10 odpovědí v konverzaci.",
        unlocked: data.conversation.messages >= 10,
      },
      {
        icon: "🧩",
        title: "První dokončené pexeso",
        description: "Dokončili jste svoji první hru pexesa.",
        unlocked: statistics.pexesoGames >= 1,
      },
      {
        icon: "🎯",
        title: "Pravidelný hráč",
        description: "Dokončili jste alespoň 10 her pexesa.",
        unlocked: statistics.pexesoGames >= 10,
      },
      {
        icon: "🧠",
        title: "Mistr pexesa",
        description: "V jedné hře jste získali hodnocení alespoň 80 %.",
        unlocked: statistics.pexesoBestScore >= 80,
      },
      {
        icon: "❓",
        title: "První dokončený kvíz",
        description: "Dokončili jste svůj první jazykový kvíz.",
        unlocked: statistics.quizGames >= 1,
      },
      {
        icon: "📚",
        title: "Kvízový maraton",
        description: "Dokončili jste alespoň 10 jazykových kvízů.",
        unlocked: statistics.quizGames >= 10,
      },
      {
        icon: "💯",
        title: "Bezchybný kvíz",
        description: "V jednom kvízu jste odpověděli správně na vše.",
        unlocked: statistics.quizBestPercentage === 100,
      },
      {
        icon: "✏️",
        title: "První křížovka",
        description: "Vyřešili jste svoji první jazykovou křížovku.",
        unlocked: statistics.crosswordGames >= 1,
      },
      {
        icon: "🧭",
        title: "Křížem krážem",
        description: "Vyřešili jste alespoň 10 jazykových křížovek.",
        unlocked: statistics.crosswordGames >= 10,
      },
      {
        icon: "🏅",
        title: "Mistr křížovky",
        description: "V jedné křížovce jste získali alespoň 95 %.",
        unlocked: statistics.crosswordBestScore >= 95,
      },
    ],
    [data, statistics],
  );

  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked,
  ).length;

  const progressTabs = [
    {
      id: "study",
      icon: "📚",
      label: "Studium",
      count: null,
    },
    {
      id: "pexeso",
      icon: "🧩",
      label: "Pexeso",
      count: statistics.pexesoGames,
    },
    {
      id: "quiz",
      icon: "❓",
      label: "Kvízy",
      count: statistics.quizGames,
    },
    {
      id: "crossword",
      icon: "✏️",
      label: "Křížovky",
      count: statistics.crosswordGames,
    },
    {
      id: "achievements",
      icon: "🎖️",
      label: "Úspěchy",
      count: `${unlockedAchievements}/${achievements.length}`,
    },
  ];

  function resetProgress() {
    const confirmed = window.confirm(
      "Opravdu chcete vymazat všechny statistiky pokroku? Slovíčka ze slovníku zůstanou zachována, ale jejich stav naučení a procvičování bude vynulován.",
    );

    if (!confirmed) {
      return;
    }

    const vocabulary = readVocabulary().map((item) => ({
      ...item,
      learned: false,
      reviewCount: 0,
      correctCount: 0,
    }));

    localStorage.setItem(VOCABULARY_KEY, JSON.stringify(vocabulary));

    localStorage.removeItem(PRONUNCIATION_KEY);
    localStorage.removeItem(COMPLETED_STORIES_KEY);
    localStorage.removeItem(CONVERSATION_STATS_KEY);
    localStorage.removeItem(PEXESO_STATS_KEY);
    localStorage.removeItem(QUIZ_STATS_KEY);
    localStorage.removeItem(CROSSWORD_STATS_KEY);

    const progressKeys = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (key?.startsWith("storyProgress:")) {
        progressKeys.push(key);
      }
    }

    progressKeys.forEach((key) => localStorage.removeItem(key));

    setMessage("Statistiky pokroku byly vynulovány.");
    loadProgress();

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  return (
    <main className="progressPage">
      <section className="progressContainer">
        <div className="progressTopbar">
          <Link href="/" className="progressBackLink">
            ← Zpět na hlavní stránku
          </Link>

          <button
            type="button"
            className="progressRefreshButton"
            onClick={loadProgress}
          >
            🔄 Obnovit údaje
          </button>
        </div>

        <header className="progressHeader">
          <div className="progressHeaderIcon">🏆</div>

          <h1>Můj pokrok</h1>

          <p>
            Sledujte slovíčka, výslovnost, příběhy, pexeso, kvízy, křížovky a
            další studijní aktivity uložené v tomto prohlížeči.
          </p>
        </header>

        <aside className="progressStorageNotice" role="note">
          <div className="progressStorageNoticeIcon" aria-hidden="true">
            💾
          </div>

          <div>
            <h2>Pokrok se ukládá pouze v tomto prohlížeči</h2>

            <p>
              Vaše výsledky, uložená slovíčka a pozice v příbězích zůstávají
              pouze v tomto prohlížeči na tomto zařízení. Na jiné zařízení se
              automaticky nepřenesou a po vymazání dat webu nebo prohlížeče
              budou odstraněny.
            </p>

            <small>
              Pro zachování pokroku používejte stejné zařízení a prohlížeč a
              nemažte data této stránky.
            </small>
          </div>
        </aside>

        <section className="progressHeroCard">
          <div
            className="progressScoreRing"
            style={{
              background: `conic-gradient(
                #0891b2 ${statistics.score}%,
                #dbeafe ${statistics.score}% 100%
              )`,
            }}
          >
            <div>
              <strong>{statistics.score} %</strong>
              <span>celkový pokrok</span>
            </div>
          </div>

          <div className="progressHeroContent">
            <span className="progressLevelBadge">
              {statistics.level.emoji} {statistics.level.name}
            </span>

            <h2>Pokračujte ve studiu každý den</h2>

            <p>
              Do další úrovně potřebujete dosáhnout
              {` ${statistics.level.next} %`}. Největší pokrok získáte
              procvičováním slovíček, výslovnosti, pexesa, kvízů, křížovek a
              dokončováním příběhů.
            </p>

            <div className="progressHeroBar">
              <span
                style={{
                  width: `${statistics.score}%`,
                }}
              />
            </div>
          </div>
        </section>

        <section className="progressStatsGrid">
          <article>
            <span>📝</span>
            <strong>{statistics.totalWords}</strong>
            <p>Uložených slovíček</p>
          </article>

          <article>
            <span>✅</span>
            <strong>{statistics.learnedWords}</strong>
            <p>Naučených slovíček</p>
          </article>

          <article>
            <span>🎤</span>
            <strong>{data.pronunciation.attempts}</strong>
            <p>Pokusů o výslovnost</p>
          </article>

          <article>
            <span>🏆</span>
            <strong>{data.pronunciation.best} %</strong>
            <p>Nejlepší výslovnost</p>
          </article>

          <article>
            <span>📖</span>
            <strong>{data.stories.length}</strong>
            <p>Rozečtených příběhů</p>
          </article>

          <article>
            <span>💬</span>
            <strong>{data.conversation.messages}</strong>
            <p>Odpovědí v konverzaci</p>
          </article>

          <article>
            <span>🧩</span>
            <strong>{statistics.pexesoGames}</strong>
            <p>Dokončených pexes</p>
          </article>

          <article>
            <span>🎯</span>
            <strong>
              {data.pexeso.bestMoves ? `${data.pexeso.bestMoves}` : "—"}
            </strong>
            <p>Nejlepší počet pokusů</p>
          </article>

          <article>
            <span>❓</span>
            <strong>{statistics.quizGames}</strong>
            <p>Dokončených kvízů</p>
          </article>

          <article>
            <span>💯</span>
            <strong>{statistics.quizBestPercentage} %</strong>
            <p>Nejlepší výsledek kvízu</p>
          </article>

          <article>
            <span>✏️</span>
            <strong>{statistics.crosswordGames}</strong>
            <p>Vyřešených křížovek</p>
          </article>

          <article>
            <span>🏅</span>
            <strong>{statistics.crosswordBestScore} %</strong>
            <p>Nejlepší křížovka</p>
          </article>
        </section>

        <nav className="progressTabs" aria-label="Oblasti pokroku">
          {progressTabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                className={`progressTabButton${isActive ? " active" : ""}`}
                aria-pressed={isActive}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="progressTabIcon">{tab.icon}</span>
                <span>{tab.label}</span>

                {tab.count !== null && (
                  <span className="progressTabCount">{tab.count}</span>
                )}
              </button>
            );
          })}
        </nav>

        <p className="progressTabsHint">
          Vyberte oblast, jejíž podrobné výsledky chcete zobrazit.
        </p>

        <div
          className="progressDashboardGrid progressTabPanel"
          hidden={activeTab !== "study"}
        >
          <section className="progressPanel">
            <div className="progressPanelHeading">
              <div>
                <h2>📚 Pokrok ve slovíčkách</h2>
                <p>
                  {statistics.learnedWords} z {statistics.totalWords} slov je
                  označeno jako naučených.
                </p>
              </div>

              <Link href="/slovnik">Otevřít slovníček →</Link>
            </div>

            <div className="progressLanguageList">
              {statistics.vocabularyByLanguage.map((item) => (
                <article key={item.language}>
                  <div className="progressLanguageTop">
                    <span>
                      {LANGUAGE_LABELS[item.language].flag}{" "}
                      {LANGUAGE_LABELS[item.language].label}
                    </span>

                    <strong>
                      {item.learned} / {item.total}
                    </strong>
                  </div>

                  <div className="progressSmallBar">
                    <span
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />
                  </div>

                  <small>{item.percentage} % naučeno</small>
                </article>
              ))}
            </div>
          </section>

          <section className="progressPanel">
            <div className="progressPanelHeading">
              <div>
                <h2>🗣️ Výslovnost</h2>
                <p>Orientační výsledky z tréninku výslovnosti.</p>
              </div>

              <Link href="/vyslovnost">Procvičovat →</Link>
            </div>

            <div className="progressPronunciationCards">
              <article>
                <span>🎙️</span>
                <div>
                  <strong>{data.pronunciation.attempts}</strong>
                  <p>Celkem pokusů</p>
                </div>
              </article>

              <article>
                <span>✅</span>
                <div>
                  <strong>{data.pronunciation.successful}</strong>
                  <p>Úspěšných pokusů</p>
                </div>
              </article>

              <article>
                <span>⭐</span>
                <div>
                  <strong>{data.pronunciation.best} %</strong>
                  <p>Nejlepší výsledek</p>
                </div>
              </article>
            </div>
          </section>
        </div>

        <section
          className="progressPanel progressPexesoPanel progressTabPanel"
          hidden={activeTab !== "pexeso"}
        >
          <div className="progressPanelHeading">
            <div>
              <h2>🧩 Výsledky pexesa</h2>
              <p>Souhrn dokončených her podle jazyků a jednotlivých příběhů.</p>
            </div>

            <Link href="/pexeso">Hrát pexeso →</Link>
          </div>

          {statistics.pexesoGames === 0 ? (
            <div className="progressEmptyState">
              <span>🧩</span>
              <h3>Zatím nemáte dokončené žádné pexeso</h3>
              <p>Dokončete první hru a výsledek se sem automaticky uloží.</p>
            </div>
          ) : (
            <>
              <div className="progressPexesoSummary">
                <article>
                  <span>🎮</span>
                  <strong>{statistics.pexesoGames}</strong>
                  <p>Dokončených her</p>
                </article>

                <article>
                  <span>🏆</span>
                  <strong>{data.pexeso.bestMoves}</strong>
                  <p>Nejlepší počet pokusů</p>
                </article>

                <article>
                  <span>📊</span>
                  <strong>
                    {statistics.pexesoAverageMoves.toLocaleString("cs-CZ")}
                  </strong>
                  <p>Průměrný počet pokusů</p>
                </article>

                <article>
                  <span>⭐</span>
                  <strong>{statistics.pexesoAverageScore} %</strong>
                  <p>Průměrné hodnocení</p>
                </article>
              </div>

              <div className="progressPexesoBreakdown">
                <section>
                  <h3>Podle jazykové verze</h3>

                  <div className="progressLanguageList">
                    {statistics.pexesoByLanguage.map((item) => (
                      <article key={item.key}>
                        <div className="progressLanguageTop">
                          <span>
                            {LANGUAGE_LABELS[item.key].flag}{" "}
                            {LANGUAGE_LABELS[item.key].label}
                          </span>

                          <strong>{item.gamesCompleted} her</strong>
                        </div>

                        <div className="progressSmallBar">
                          <span
                            style={{
                              width: `${item.averageScore}%`,
                            }}
                          />
                        </div>

                        <small>
                          Průměrné hodnocení {item.averageScore} % · průměr{" "}
                          {item.averageMoves.toLocaleString("cs-CZ")} pokusů
                        </small>
                      </article>
                    ))}
                  </div>
                </section>

                <section>
                  <h3>Podle příběhu</h3>

                  <div className="progressLanguageList">
                    {statistics.pexesoByStory.map((item) => (
                      <article key={item.key}>
                        <div className="progressLanguageTop">
                          <span>
                            {PEXESO_STORY_LABELS[item.key].icon}{" "}
                            {PEXESO_STORY_LABELS[item.key].label}
                          </span>

                          <strong>{item.gamesCompleted} her</strong>
                        </div>

                        <div className="progressSmallBar">
                          <span
                            style={{
                              width: `${item.averageScore}%`,
                            }}
                          />
                        </div>

                        <small>
                          Průměrné hodnocení {item.averageScore} % · průměr{" "}
                          {item.averageMoves.toLocaleString("cs-CZ")} pokusů
                        </small>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <div className="progressPexesoHistory">
                <h3>Poslední výsledky</h3>

                <div className="progressPexesoHistoryList">
                  {data.pexeso.history.slice(0, 6).map((game) => (
                    <article key={game.id}>
                      <div className="progressStoryIcon">
                        {PEXESO_STORY_LABELS[game.story].icon}
                      </div>

                      <div className="progressStoryContent">
                        <h3>{PEXESO_STORY_LABELS[game.story].title}</h3>
                        <p>
                          {LANGUAGE_LABELS[game.language].flag}{" "}
                          {LANGUAGE_LABELS[game.language].label} · {game.moves}{" "}
                          pokusů
                        </p>
                        <small>{formatDate(game.playedAt)}</small>
                      </div>

                      <div className="progressPexesoResult">
                        <strong>{game.score} %</strong>
                        <span>{getPexesoRating(game.score)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <p className="progressPexesoNote">
                Hodnocení vychází z počtu pokusů. Osm správných dvojic v osmi
                pokusech znamená 100 %. Pexeso nyní přidává do celkového pokroku{" "}
                {statistics.pexesoPoints} z maximálně 20 bodů.
              </p>
            </>
          )}
        </section>

        <section
          className="progressPanel progressPexesoPanel progressTabPanel"
          hidden={activeTab !== "quiz"}
        >
          <div className="progressPanelHeading">
            <div>
              <h2>❓ Výsledky kvízů</h2>
              <p>
                Souhrn správných odpovědí podle jazyků a jednotlivých příběhů.
              </p>
            </div>

            <Link href="/kviz">Spustit kvíz →</Link>
          </div>

          {statistics.quizGames === 0 ? (
            <div className="progressEmptyState">
              <span>❓</span>
              <h3>Zatím nemáte dokončený žádný kvíz</h3>
              <p>Dokončete první kvíz a výsledek se sem automaticky uloží.</p>
            </div>
          ) : (
            <>
              <div className="progressPexesoSummary">
                <article>
                  <span>🎮</span>
                  <strong>{statistics.quizGames}</strong>
                  <p>Dokončených kvízů</p>
                </article>

                <article>
                  <span>🏆</span>
                  <strong>{statistics.quizBestPercentage} %</strong>
                  <p>Nejlepší výsledek</p>
                </article>

                <article>
                  <span>✅</span>
                  <strong>
                    {data.quiz.totalCorrect} / {data.quiz.totalQuestions}
                  </strong>
                  <p>Celkem správných odpovědí</p>
                </article>

                <article>
                  <span>📊</span>
                  <strong>{statistics.quizAccuracy} %</strong>
                  <p>Celková úspěšnost</p>
                </article>
              </div>

              <div className="progressPexesoBreakdown">
                <section>
                  <h3>Podle jazykové verze</h3>

                  <div className="progressLanguageList">
                    {statistics.quizByLanguage.map((item) => (
                      <article key={item.key}>
                        <div className="progressLanguageTop">
                          <span>
                            {LANGUAGE_LABELS[item.key].flag}{" "}
                            {LANGUAGE_LABELS[item.key].label}
                          </span>

                          <strong>{item.gamesCompleted} kvízů</strong>
                        </div>

                        <div className="progressSmallBar">
                          <span
                            style={{
                              width: `${item.averagePercentage}%`,
                            }}
                          />
                        </div>

                        <small>
                          Průměrné hodnocení {item.averagePercentage} % ·
                          úspěšnost {item.accuracy} %
                        </small>
                      </article>
                    ))}
                  </div>
                </section>

                <section>
                  <h3>Podle příběhu</h3>

                  <div className="progressLanguageList">
                    {statistics.quizByStory.map((item) => (
                      <article key={item.key}>
                        <div className="progressLanguageTop">
                          <span>
                            {PEXESO_STORY_LABELS[item.key].icon}{" "}
                            {PEXESO_STORY_LABELS[item.key].label}
                          </span>

                          <strong>{item.gamesCompleted} kvízů</strong>
                        </div>

                        <div className="progressSmallBar">
                          <span
                            style={{
                              width: `${item.averagePercentage}%`,
                            }}
                          />
                        </div>

                        <small>
                          Průměrné hodnocení {item.averagePercentage} % ·
                          úspěšnost {item.accuracy} %
                        </small>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <div className="progressPexesoHistory">
                <h3>Poslední výsledky</h3>

                <div className="progressPexesoHistoryList">
                  {data.quiz.history.slice(0, 6).map((game) => (
                    <article key={game.id}>
                      <div className="progressStoryIcon">
                        {PEXESO_STORY_LABELS[game.story].icon}
                      </div>

                      <div className="progressStoryContent">
                        <h3>{PEXESO_STORY_LABELS[game.story].title}</h3>
                        <p>
                          {LANGUAGE_LABELS[game.language].flag}{" "}
                          {LANGUAGE_LABELS[game.language].label} ·{" "}
                          {game.correctAnswers} z {game.questionCount} správně
                        </p>
                        <small>{formatDate(game.playedAt)}</small>
                      </div>

                      <div className="progressPexesoResult">
                        <strong>{game.percentage} %</strong>
                        <span>{getQuizRating(game.percentage)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <p className="progressPexesoNote">
                Kvízy nyní přidávají do celkového pokroku{" "}
                {statistics.quizPoints} z maximálně 20 bodů. Hodnocení vychází z
                podílu správných odpovědí.
              </p>
            </>
          )}
        </section>

        <section
          className="progressPanel progressPexesoPanel progressTabPanel"
          hidden={activeTab !== "crossword"}
        >
          <div className="progressPanelHeading">
            <div>
              <h2>✏️ Výsledky křížovek</h2>
              <p>
                Souhrn vyřešených křížovek podle jazyků a jednotlivých příběhů.
              </p>
            </div>

            <Link href="/krizovka">Luštit křížovku →</Link>
          </div>

          {statistics.crosswordGames === 0 ? (
            <div className="progressEmptyState">
              <span>✏️</span>
              <h3>Zatím nemáte vyřešenou žádnou křížovku</h3>
              <p>
                Dokončete první křížovku a výsledek se sem automaticky uloží.
              </p>
            </div>
          ) : (
            <>
              <div className="progressPexesoSummary">
                <article>
                  <span>🎮</span>
                  <strong>{statistics.crosswordGames}</strong>
                  <p>Vyřešených křížovek</p>
                </article>

                <article>
                  <span>🏅</span>
                  <strong>{statistics.crosswordBestScore} %</strong>
                  <p>Nejlepší výsledek</p>
                </article>

                <article>
                  <span>✏️</span>
                  <strong>{data.crossword.totalWords}</strong>
                  <p>Celkem doplněných slov</p>
                </article>

                <article>
                  <span>⏱️</span>
                  <strong>
                    {formatDuration(statistics.crosswordAverageTimeSeconds)}
                  </strong>
                  <p>Průměrný čas</p>
                </article>
              </div>

              <div className="progressPexesoBreakdown">
                <section>
                  <h3>Podle jazykové verze</h3>

                  <div className="progressLanguageList">
                    {statistics.crosswordByLanguage.map((item) => (
                      <article key={item.key}>
                        <div className="progressLanguageTop">
                          <span>
                            {LANGUAGE_LABELS[item.key].flag}{" "}
                            {LANGUAGE_LABELS[item.key].label}
                          </span>

                          <strong>{item.gamesCompleted} her</strong>
                        </div>

                        <div className="progressSmallBar">
                          <span
                            style={{
                              width: `${item.averageScore}%`,
                            }}
                          />
                        </div>

                        <small>
                          Průměrné hodnocení {item.averageScore} % · nápovědy{" "}
                          {item.averageHints.toLocaleString("cs-CZ")} · čas{" "}
                          {formatDuration(item.averageTimeSeconds)}
                        </small>
                      </article>
                    ))}
                  </div>
                </section>

                <section>
                  <h3>Podle příběhu</h3>

                  <div className="progressLanguageList">
                    {statistics.crosswordByStory.map((item) => (
                      <article key={item.key}>
                        <div className="progressLanguageTop">
                          <span>
                            {PEXESO_STORY_LABELS[item.key].icon}{" "}
                            {PEXESO_STORY_LABELS[item.key].label}
                          </span>

                          <strong>{item.gamesCompleted} her</strong>
                        </div>

                        <div className="progressSmallBar">
                          <span
                            style={{
                              width: `${item.averageScore}%`,
                            }}
                          />
                        </div>

                        <small>
                          Průměrné hodnocení {item.averageScore} % · nápovědy{" "}
                          {item.averageHints.toLocaleString("cs-CZ")} · čas{" "}
                          {formatDuration(item.averageTimeSeconds)}
                        </small>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <div className="progressPexesoHistory">
                <h3>Poslední výsledky</h3>

                <div className="progressPexesoHistoryList">
                  {data.crossword.history.slice(0, 6).map((game) => (
                    <article key={game.id}>
                      <div className="progressStoryIcon">
                        {PEXESO_STORY_LABELS[game.story].icon}
                      </div>

                      <div className="progressStoryContent">
                        <h3>{PEXESO_STORY_LABELS[game.story].title}</h3>
                        <p>
                          {LANGUAGE_LABELS[game.language].flag}{" "}
                          {LANGUAGE_LABELS[game.language].label} ·{" "}
                          {game.wordCount} slov · {game.hintsUsed} nápověd ·{" "}
                          {formatDuration(game.timeSeconds)}
                        </p>
                        <small>{formatDate(game.playedAt)}</small>
                      </div>

                      <div className="progressPexesoResult">
                        <strong>{game.score} %</strong>
                        <span>{getCrosswordRating(game.score)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <p className="progressPexesoNote">
                Výsledek začíná na 100 %. Každá použitá nápověda odečte 5 bodů a
                každá neúspěšná kontrola 3 body. Křížovky nyní přidávají do
                celkového pokroku {statistics.crosswordPoints} z maximálně 20
                bodů.
              </p>
            </>
          )}
        </section>

        <section
          className="progressPanel progressStoriesPanel progressTabPanel"
          hidden={activeTab !== "study"}
        >
          <div className="progressPanelHeading">
            <div>
              <h2>📖 Rozečtené příběhy</h2>
              <p>Uložené pozice ze všech jazykových verzí příběhů.</p>
            </div>

            <Link href="/stories">Vybrat příběh →</Link>
          </div>

          {data.stories.length === 0 ? (
            <div className="progressEmptyState">
              <span>📭</span>
              <h3>Zatím nemáte uložený rozečtený příběh</h3>
              <p>Otevřete příběh, spusťte čtení a uložte si pozici.</p>
            </div>
          ) : (
            <div className="progressStoryList">
              {data.stories.map((story) => (
                <article key={story.id}>
                  <div className="progressStoryIcon">{story.icon}</div>

                  <div className="progressStoryContent">
                    <h3>{story.title}</h3>
                    <p>Uložená strana: {story.pageIndex + 1}</p>
                    <small>{formatDate(story.savedAt)}</small>
                  </div>

                  <Link href={story.href}>Pokračovat →</Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          className="progressPanel progressTabPanel"
          hidden={activeTab !== "achievements"}
        >
          <div className="progressPanelHeading">
            <div>
              <h2>🎖️ Úspěchy</h2>
              <p>
                Odemčeno {unlockedAchievements} z {achievements.length} odznaků.
              </p>
            </div>
          </div>

          <div className="progressAchievementsGrid">
            {achievements.map((achievement) => (
              <article
                key={achievement.title}
                className={achievement.unlocked ? "unlocked" : "locked"}
              >
                <span>{achievement.unlocked ? achievement.icon : "🔒"}</span>

                <div>
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {message && <div className="progressMessage">✅ {message}</div>}

        <section className="progressDangerZone">
          <div>
            <h2>Vynulovat statistiky</h2>
            <p>
              Slovíčka zůstanou ve slovníku, ale jejich stav naučení a ostatní
              výsledky budou vynulovány.
            </p>
          </div>

          <button type="button" onClick={resetProgress}>
            Vynulovat můj pokrok
          </button>
        </section>
      </section>
    </main>
  );
}