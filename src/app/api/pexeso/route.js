import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PAIR_COUNT = 8;

const storyConfig = {
  rabbit: {
    label: "Králík",
    title: "Oliver a tajemný les",
  },
  horse: {
    label: "Kůň",
    title: "Statečný kůň",
  },
  fox: {
    label: "Liška",
    title: "Chytrá liška a tajemství Stříbrného pramene",
  },
};

const languageConfig = {
  en: {
    sourceLocale: "en",
    targetLocale: "cs",
    sourceLabel: "Anglicky",
    targetLabel: "Česky",
  },
  de: {
    sourceLocale: "de",
    targetLocale: "cs",
    sourceLabel: "Německy",
    targetLabel: "Česky",
  },
  cs: {
    sourceLocale: "cs",
    targetLocale: "ru",
    sourceLabel: "Česky",
    targetLabel: "Rusky",
  },
};

/*
 * Slovník se načte až ve chvíli, kdy si uživatel vybere konkrétní
 * kombinaci jazyka a příběhu. API proto při startu nenačítá všech
 * devět velkých slovníků najednou.
 */
const dictionaryLoaders = {
  en: {
    rabbit: () => import("../../../data/dictionaryAJrabbit"),
    horse: () => import("../../../data/dictionaryAJhorse"),
    fox: () => import("../../../data/dictionaryAJfox"),
  },
  de: {
    rabbit: () => import("../../../data/dictionaryderabbit"),
    horse: () => import("../../../data/dictionarydehorse"),
    fox: () => import("../../../data/dictionarydefox"),
  },
  cs: {
    rabbit: () => import("../../../data/dictionaryczrabbit"),
    horse: () => import("../../../data/dictionaryczhorse"),
    fox: () => import("../../../data/dictionaryczfox"),
  },
};

/*
 * Hotový seznam slov zůstane uložený po dobu života dané instance
 * serveru. Opakovaná hra se stejným příběhem už slovník znovu
 * nezpracovává.
 */
const wordPoolCache = new Map();

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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getDisplayWord(word, example, sourceLocale) {
  if (sourceLocale !== "de" || typeof example !== "string") {
    return word;
  }

  const wordPattern = new RegExp(
    `(^|[^\\p{L}])(${escapeRegExp(word)})(?=$|[^\\p{L}])`,
    "iu",
  );

  return example.match(wordPattern)?.[2] ?? word;
}

function createWordPool(dictionary, sourceLocale, targetLocale) {
  const usedTranslations = new Set();
  const wordPool = [];

  for (const [word, data] of Object.entries(dictionary)) {
    const translation = data?.translation?.trim();
    const normalizedTranslation = translation?.toLocaleLowerCase(targetLocale);
    const isName =
      sourceLocale === "cs" &&
      typeof translation === "string" &&
      /^\p{Lu}/u.test(translation);

    const isSuitable =
      /^[\p{L}-]+$/u.test(word) &&
      word.length >= 3 &&
      word.length <= 18 &&
      translation &&
      translation.length >= 2 &&
      translation.length <= 42 &&
      !normalizedTranslation.includes("jméno") &&
      !normalizedTranslation.includes("имя") &&
      !isName &&
      word.toLocaleLowerCase(sourceLocale) !== normalizedTranslation &&
      !usedTranslations.has(normalizedTranslation);

    if (!isSuitable) {
      continue;
    }

    usedTranslations.add(normalizedTranslation);
    wordPool.push({
      word: getDisplayWord(word, data.example, sourceLocale),
      translation,
    });
  }

  return wordPool;
}

async function getWordPool(language, story) {
  const cacheKey = `${language}:${story}`;

  if (wordPoolCache.has(cacheKey)) {
    return wordPoolCache.get(cacheKey);
  }

  const loader = dictionaryLoaders[language]?.[story];
  const selectedLanguage = languageConfig[language];

  if (!loader || !selectedLanguage) {
    return null;
  }

  const poolPromise = loader()
    .then((module) => {
      const dictionary = module.dictionary ?? module.default;

      if (!dictionary || typeof dictionary !== "object") {
        throw new Error("Vybraný slovník nemá platný export.");
      }

      return createWordPool(
        dictionary,
        selectedLanguage.sourceLocale,
        selectedLanguage.targetLocale,
      );
    })
    .catch((error) => {
      wordPoolCache.delete(cacheKey);
      throw error;
    });

  wordPoolCache.set(cacheKey, poolPromise);
  return poolPromise;
}

export async function GET(request) {
  const parameters = new URL(request.url).searchParams;
  const language = parameters.get("language")?.toLowerCase() ?? "en";
  const story = parameters.get("story")?.toLowerCase() ?? "rabbit";

  const selectedLanguage = languageConfig[language];
  const selectedStory = storyConfig[story];
  const dictionaryLoader = dictionaryLoaders[language]?.[story];

  if (!selectedLanguage) {
    return NextResponse.json(
      {
        error: "Tento jazyk zatím není v pexesu připravený.",
      },
      { status: 400 },
    );
  }

  if (!selectedStory || !dictionaryLoader) {
    return NextResponse.json(
      {
        error: "Tento příběh zatím není v pexesu připravený.",
      },
      { status: 400 },
    );
  }

  try {
    const selectedPool = await getWordPool(language, story);

    if (!selectedPool || selectedPool.length < PAIR_COUNT) {
      return NextResponse.json(
        {
          error: "Vybraný příběh neobsahuje dost vhodných slov pro pexeso.",
        },
        { status: 500 },
      );
    }

    const selectedWords = shuffle(selectedPool).slice(0, PAIR_COUNT);

    const pairs = selectedWords.map((item, index) => ({
      id: `${language}-${story}-${index + 1}`,
      word: item.word,
      translation: item.translation,
    }));

    return NextResponse.json(
      {
        language,
        story,
        storyLabel: selectedStory.label,
        storyTitle: selectedStory.title,
        sourceLabel: selectedLanguage.sourceLabel,
        targetLabel: selectedLanguage.targetLabel,
        pairCount: pairs.length,
        pairs,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Pexeso API error:", error);

    return NextResponse.json(
      {
        error: "Pexeso se nepodařilo načíst. Zkuste to prosím znovu.",
      },
      { status: 500 },
    );
  }
}