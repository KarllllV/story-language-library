import { dictionary as englishFoxDictionary } from "./dictionaryAJfox";
import { dictionary as englishHorseDictionary } from "./dictionaryAJhorse";
import { dictionary as englishRabbitDictionary } from "./dictionaryAJrabbit";
import { dictionary as czechFoxDictionary } from "./dictionaryczfox";
import { dictionary as czechHorseDictionary } from "./dictionaryczhorse";
import { dictionary as czechRabbitDictionary } from "./dictionaryczrabbit";
import { dictionary as germanFoxDictionary } from "./dictionarydefox";
import { dictionary as germanHorseDictionary } from "./dictionarydehorse";
import { dictionary as germanRabbitDictionary } from "./dictionaryderabbit";

const DEFAULT_QUESTION_COUNT = 10;

export const quizStoryConfig = {
  rabbit: {
    label: "Králík",
    title: "Oliver a tajemný les",
    icon: "🐰",
  },
  horse: {
    label: "Kůň",
    title: "Statečný kůň",
    icon: "🐴",
  },
  fox: {
    label: "Liška",
    title: "Chytrá liška a tajemství Stříbrného pramene",
    icon: "🦊",
  },
};

export const quizLanguageConfig = {
  en: {
    sourceLocale: "en",
    targetLocale: "cs",
    sourceLabel: "Anglicky",
    targetLabel: "Česky",
    sourceAdjective: "anglické",
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
    sourceAdjective: "německé",
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
    sourceAdjective: "české",
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

function findWordInExample(word, example) {
  if (typeof example !== "string") {
    return word;
  }

  const wordPattern = new RegExp(
    `(^|[^\\p{L}])(${escapeRegExp(word)})(?=$|[^\\p{L}])`,
    "iu",
  );

  return example.match(wordPattern)?.[2] ?? word;
}

function createBlankExample(word, example) {
  if (typeof example !== "string") {
    return null;
  }

  const wordPattern = new RegExp(
    `(^|[^\\p{L}])(${escapeRegExp(word)})(?=$|[^\\p{L}])`,
    "iu",
  );

  if (!wordPattern.test(example)) {
    return null;
  }

  return example.replace(
    wordPattern,
    (fullMatch, beginning) => `${beginning}_____`,
  );
}

function createCandidatePool(dictionary, sourceLocale, targetLocale) {
  const usedTranslations = new Set();
  const candidates = [];

  for (const [word, data] of Object.entries(dictionary)) {
    const translation = data?.translation?.trim();
    const normalizedTranslation = translation?.toLocaleLowerCase(targetLocale);
    const example = data?.example?.trim() || "";
    const exampleTranslation = data?.exampleTranslation?.trim() || "";
    const displayWord = findWordInExample(word, example);
    const blankExample = createBlankExample(word, example);
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
    candidates.push({
      word,
      displayWord,
      translation,
      example,
      exampleTranslation,
      blankExample,
    });
  }

  return candidates;
}

function createOptions(candidates, currentCandidate, valueKey) {
  const correctAnswer = currentCandidate[valueKey];
  const usedOptions = new Set([correctAnswer]);
  const distractors = [];

  for (const candidate of shuffle(candidates)) {
    const option = candidate[valueKey];

    if (!option || usedOptions.has(option)) {
      continue;
    }

    usedOptions.add(option);
    distractors.push(option);

    if (distractors.length === 3) {
      break;
    }
  }

  if (distractors.length < 3) {
    throw new Error("Pro kvíz se nepodařilo vytvořit dost odpovědí.");
  }

  const options = shuffle([correctAnswer, ...distractors]);

  return {
    options,
    correctIndex: options.indexOf(correctAnswer),
  };
}

function createQuestion({
  candidate,
  candidates,
  index,
  type,
  language,
  story,
  languageConfig,
}) {
  const isTranslationQuestion = type === "translation";
  const valueKey = isTranslationQuestion ? "translation" : "displayWord";
  const { options, correctIndex } = createOptions(
    candidates,
    candidate,
    valueKey,
  );

  let question = "";
  let prompt = "";
  let typeLabel = "";

  if (type === "translation") {
    typeLabel = "Překlad";
    question = `Co znamená toto ${languageConfig.sourceAdjective} slovo?`;
    prompt = candidate.displayWord;
  } else if (type === "reverse") {
    typeLabel = "Obrácený překlad";
    question = `Které ${languageConfig.sourceAdjective} slovo odpovídá tomuto významu?`;
    prompt = candidate.translation;
  } else {
    typeLabel = "Doplňte větu";
    question = "Které slovo správně doplní větu z příběhu?";
    prompt = candidate.blankExample;
  }

  return {
    id: `${language}-${story}-${index + 1}`,
    type,
    typeLabel,
    question,
    prompt,
    options,
    correctIndex,
    explanation: `${candidate.displayWord} = ${candidate.translation}`,
    example: candidate.example,
    exampleTranslation: candidate.exampleTranslation,
  };
}

export function createQuizQuestions({
  language = "en",
  story = "rabbit",
  count = DEFAULT_QUESTION_COUNT,
} = {}) {
  const selectedLanguage = quizLanguageConfig[language];
  const selectedStory = quizStoryConfig[story];
  const selectedDictionary = selectedLanguage?.dictionaries?.[story];

  if (!selectedLanguage) {
    throw new Error("Tento jazyk zatím není v kvízu připravený.");
  }

  if (!selectedStory || !selectedDictionary) {
    throw new Error("Tento příběh zatím není v kvízu připravený.");
  }

  const candidates = createCandidatePool(
    selectedDictionary,
    selectedLanguage.sourceLocale,
    selectedLanguage.targetLocale,
  );
  const sentenceCandidates = candidates.filter(
    (candidate) => candidate.blankExample,
  );

  if (candidates.length < Math.max(count, 4) || sentenceCandidates.length < 1) {
    throw new Error("Vybraný příběh neobsahuje dost vhodných slov pro kvíz.");
  }

  const selectedCandidates = shuffle(candidates).slice(0, count);
  const selectedSentenceCandidates = shuffle(sentenceCandidates);
  const questionTypes = ["translation", "reverse", "sentence"];
  let sentenceIndex = 0;

  const questions = selectedCandidates.map((candidate, index) => {
    const type = questionTypes[index % questionTypes.length];
    const questionCandidate =
      type === "sentence"
        ? selectedSentenceCandidates[
            sentenceIndex++ % selectedSentenceCandidates.length
          ]
        : candidate;

    return createQuestion({
      candidate: questionCandidate,
      candidates,
      index,
      type,
      language,
      story,
      languageConfig: selectedLanguage,
    });
  });

  return {
    language,
    story,
    sourceLabel: selectedLanguage.sourceLabel,
    targetLabel: selectedLanguage.targetLabel,
    storyLabel: selectedStory.label,
    storyTitle: selectedStory.title,
    storyIcon: selectedStory.icon,
    questionCount: questions.length,
    questions,
  };
}