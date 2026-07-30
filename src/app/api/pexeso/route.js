import { NextResponse } from "next/server";
import { dictionary as englishFoxDictionary } from "../../../data/dictionaryAJfox";
import { dictionary as englishHorseDictionary } from "../../../data/dictionaryAJhorse";
import { dictionary as englishRabbitDictionary } from "../../../data/dictionaryAJrabbit";
import { dictionary as czechFoxDictionary } from "../../../data/dictionaryczfox";
import { dictionary as czechHorseDictionary } from "../../../data/dictionaryczhorse";
import { dictionary as czechRabbitDictionary } from "../../../data/dictionaryczrabbit";
import { dictionary as germanFoxDictionary } from "../../../data/dictionarydefox";
import { dictionary as germanHorseDictionary } from "../../../data/dictionarydehorse";
import { dictionary as germanRabbitDictionary } from "../../../data/dictionaryderabbit";

export const dynamic = "force-dynamic";

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
    dictionaries: {
      rabbit: englishRabbitDictionary,
      horse: englishHorseDictionary,
      fox: englishFoxDictionary,
    },
  },
  de: {
    sourceLocale: "de",
    targetLocale: "cs",
    sourceLabel: "Německy",
    targetLabel: "Česky",
    dictionaries: {
      rabbit: germanRabbitDictionary,
      horse: germanHorseDictionary,
      fox: germanFoxDictionary,
    },
  },
  cs: {
    sourceLocale: "cs",
    targetLocale: "ru",
    sourceLabel: "Česky",
    targetLabel: "Rusky",
    dictionaries: {
      rabbit: czechRabbitDictionary,
      horse: czechHorseDictionary,
      fox: czechFoxDictionary,
    },
  },
};

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

const wordPools = Object.fromEntries(
  Object.entries(languageConfig).map(([language, config]) => [
    language,
    Object.fromEntries(
      Object.entries(config.dictionaries).map(([story, dictionary]) => [
        story,
        createWordPool(dictionary, config.sourceLocale, config.targetLocale),
      ]),
    ),
  ]),
);

export async function GET(request) {
  const parameters = new URL(request.url).searchParams;
  const language = parameters.get("language")?.toLowerCase() ?? "en";
  const story = parameters.get("story")?.toLowerCase() ?? "rabbit";

  const selectedLanguage = languageConfig[language];
  const selectedStory = storyConfig[story];

  if (!selectedLanguage) {
    return NextResponse.json(
      {
        error: "Tento jazyk zatím není v pexesu připravený.",
      },
      { status: 400 },
    );
  }

  if (!selectedStory || !selectedLanguage.dictionaries[story]) {
    return NextResponse.json(
      {
        error: "Tento příběh zatím není v pexesu připravený.",
      },
      { status: 400 },
    );
  }

  const selectedPool = wordPools[language][story];

  if (selectedPool.length < PAIR_COUNT) {
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
}