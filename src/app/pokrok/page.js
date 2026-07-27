"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./pokrok.css";

const VOCABULARY_KEY = "storyLanguageVocabulary";
const PRONUNCIATION_KEY = "pronunciationStats";
const COMPLETED_STORIES_KEY = "completedStories";
const CONVERSATION_STATS_KEY = "conversationStats";

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

const STORY_CONFIG = {
  rabbit: {
    title: "Oliver a tajemný les – angličtina",
    href: "/stories/rabbit",
  },
  rabbitde: {
    title: "Oliver a tajemný les – němčina",
    href: "/stories/rabbitde",
  },
  rabbitcz: {
    title: "Oliver a tajemný les – čeština",
    href: "/stories/rabbitcz",
  },
  horse: {
    title: "Statečný kůň",
    href: "/stories/horse",
  },
  "oliver-secret-forest": {
    title: "Oliver a tajemný les – angličtina",
    href: "/stories/rabbit",
  },
  "oliver-secret-forest-en": {
    title: "Oliver a tajemný les – angličtina",
    href: "/stories/rabbit",
  },
  "oliver-secret-forest-de": {
    title: "Oliver a tajemný les – němčina",
    href: "/stories/rabbitde",
  },
  "oliver-secret-forest-cz": {
    title: "Oliver a tajemný les – čeština",
    href: "/stories/rabbitcz",
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
  });

  const [message, setMessage] = useState("");

  const loadProgress = useCallback(() => {
    setData({
      vocabulary: readVocabulary(),
      pronunciation: readPronunciationStats(),
      stories: readStoryProgress(),
      completedStories: readCompletedStories(),
      conversation: readConversationStats(),
    });
  }, []);

  useEffect(() => {
    loadProgress();

    function handleStorageChange() {
      loadProgress();
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("vocabulary-updated", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("vocabulary-updated", handleStorageChange);
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

    const score = Math.min(
      100,
      Math.round(
        vocabularyPoints +
          pronunciationPoints +
          storyPoints +
          conversationPoints,
      ),
    );

    return {
      totalWords,
      learnedWords,
      learningWords: totalWords - learnedWords,
      reviewedWords,
      vocabularyByLanguage,
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
    ],
    [data, statistics],
  );

  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked,
  ).length;

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
            Sledujte slovíčka, výslovnost, rozečtené příběhy a další studijní
            aktivity uložené v tomto prohlížeči.
          </p>
        </header>

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
              procvičováním slovíček, výslovnosti a dokončováním příběhů.
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
        </section>

        <div className="progressDashboardGrid">
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

        <section className="progressPanel progressStoriesPanel">
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
                  <div className="progressStoryIcon">📘</div>

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

        <section className="progressPanel">
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