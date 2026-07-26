const VOCABULARY_STORAGE_KEY = "storyLanguageVocabulary";

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeLanguage(value) {
  const language = String(value || "").toLowerCase();

  if (language === "de") {
    return "de";
  }

  if (language === "cs" || language === "cz") {
    return "cs";
  }

  return "en";
}

function normalizeVocabularyItem(item, defaults = {}) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const word = normalizeText(
    item.word ||
      item.term ||
      item.original ||
      item.text
  );

  if (!word) {
    return null;
  }

  return {
    id: item.id || createId(),
    word,
    translation: normalizeText(
      item.translation ||
        item.meaning ||
        item.translated ||
        ""
    ),
    language: normalizeLanguage(
      item.language || defaults.language
    ),
    example: normalizeText(
      item.example ||
        item.sentence ||
        item.context ||
        ""
    ),
    exampleTranslation: normalizeText(
      item.exampleTranslation || ""
    ),
    source: normalizeText(
      item.source ||
        item.story ||
        defaults.source ||
        "Příběh"
    ),
    learned: Boolean(item.learned),
    createdAt:
      item.createdAt || new Date().toISOString(),
    reviewCount: Number(item.reviewCount || 0),
    correctCount: Number(item.correctCount || 0),
  };
}

export function readVocabularyWords() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = localStorage.getItem(
      VOCABULARY_STORAGE_KEY
    );

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeVocabularyItem(item))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function writeVocabularyWords(words) {
  localStorage.setItem(
    VOCABULARY_STORAGE_KEY,
    JSON.stringify(words)
  );
}

function createUniqueKey(item) {
  return `${item.language}:${item.word.toLocaleLowerCase()}`;
}

export function saveVocabularyWord(payload) {
  const normalizedItem = normalizeVocabularyItem(
    payload,
    {
      language: payload?.language,
      source: payload?.source,
    }
  );

  if (!normalizedItem) {
    return {
      saved: false,
      item: null,
      words: readVocabularyWords(),
    };
  }

  const currentWords = readVocabularyWords();
  const itemKey = createUniqueKey(normalizedItem);

  const existingItem = currentWords.find(
    (item) => createUniqueKey(item) === itemKey
  );

  if (existingItem) {
    return {
      saved: false,
      item: existingItem,
      words: currentWords,
    };
  }

  const nextWords = [
    normalizedItem,
    ...currentWords,
  ];

  writeVocabularyWords(nextWords);

  window.dispatchEvent(
    new CustomEvent("vocabulary-updated", {
      detail: {
        type: "added",
        item: normalizedItem,
      },
    })
  );

  return {
    saved: true,
    item: normalizedItem,
    words: nextWords,
  };
}

export function removeVocabularyWord({
  word,
  language,
}) {
  const cleanWord = normalizeText(word).toLocaleLowerCase();
  const cleanLanguage = normalizeLanguage(language);

  const nextWords = readVocabularyWords().filter(
    (item) =>
      !(
        item.language === cleanLanguage &&
        item.word.toLocaleLowerCase() === cleanWord
      )
  );

  writeVocabularyWords(nextWords);

  window.dispatchEvent(
    new CustomEvent("vocabulary-updated", {
      detail: {
        type: "removed",
        word,
        language: cleanLanguage,
      },
    })
  );

  return nextWords;
}

export function getVocabularyWords({
  language,
  source,
} = {}) {
  const words = readVocabularyWords();

  return words.filter((item) => {
    const matchesLanguage =
      !language ||
      item.language === normalizeLanguage(language);

    const matchesSource =
      !source || item.source === source;

    return matchesLanguage && matchesSource;
  });
}

export function migrateLegacyVocabulary({
  legacyKey,
  language,
  source,
}) {
  if (typeof window === "undefined") {
    return getVocabularyWords({
      language,
      source,
    });
  }

  const migrationKey = `vocabularyMigration:${legacyKey}`;

  try {
    const rawLegacyWords =
      localStorage.getItem(legacyKey);

    if (
      rawLegacyWords &&
      localStorage.getItem(migrationKey) !== "done"
    ) {
      const parsedLegacyWords =
        JSON.parse(rawLegacyWords);

      if (Array.isArray(parsedLegacyWords)) {
        for (const legacyItem of parsedLegacyWords) {
          saveVocabularyWord({
            ...legacyItem,
            language,
            source,
          });
        }
      }

      localStorage.setItem(migrationKey, "done");
      localStorage.removeItem(legacyKey);
    }
  } catch {
    localStorage.setItem(migrationKey, "done");
  }

  return getVocabularyWords({
    language,
    source,
  });
}