import { dictionary as englishFoxDictionary } from "./dictionaryAJfox";
import { dictionary as englishHorseDictionary } from "./dictionaryAJhorse";
import { dictionary as englishRabbitDictionary } from "./dictionaryAJrabbit";
import { dictionary as czechFoxDictionary } from "./dictionaryczfox";
import { dictionary as czechHorseDictionary } from "./dictionaryczhorse";
import { dictionary as czechRabbitDictionary } from "./dictionaryczrabbit";
import { dictionary as germanFoxDictionary } from "./dictionarydefox";
import { dictionary as germanHorseDictionary } from "./dictionarydehorse";
import { dictionary as germanRabbitDictionary } from "./dictionaryderabbit";

const GRID_SIZE = 21;
const TARGET_WORD_COUNT = 10;
const MIN_WORD_COUNT = 7;
const MAX_GENERATION_ATTEMPTS = 45;

export const crosswordStoryConfig = {
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

export const crosswordLanguageConfig = {
  en: {
    sourceLocale: "en",
    targetLocale: "cs",
    sourceLabel: "Angličtina",
    targetLabel: "čeština",
    dictionaries: {
      rabbit: englishRabbitDictionary,
      horse: englishHorseDictionary,
      fox: englishFoxDictionary,
    },
  },
  de: {
    sourceLocale: "de",
    targetLocale: "cs",
    sourceLabel: "Němčina",
    targetLabel: "čeština",
    dictionaries: {
      rabbit: germanRabbitDictionary,
      horse: germanHorseDictionary,
      fox: germanFoxDictionary,
    },
  },
  cs: {
    sourceLocale: "cs",
    targetLocale: "ru",
    sourceLabel: "Čeština",
    targetLabel: "ruština",
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

function createExampleHint(word, example) {
  if (typeof example !== "string" || !example.trim()) {
    return "";
  }

  const wordPattern = new RegExp(
    `(^|[^\\p{L}])(${escapeRegExp(word)})(?=$|[^\\p{L}])`,
    "iu",
  );

  if (!wordPattern.test(example)) {
    return "";
  }

  return example.replace(
    wordPattern,
    (fullMatch, beginning) => `${beginning}_____`,
  );
}

function normalizeAnswer(word, locale) {
  return word
    .normalize("NFC")
    .toLocaleUpperCase(locale)
    .replace(/[^\p{L}]/gu, "");
}

function normalizeForComparison(value, locale) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase(locale)
    .replace(/[^\p{L}]/gu, "");
}

function createCandidatePool(dictionary, sourceLocale, targetLocale) {
  const usedAnswers = new Set();
  const usedClues = new Set();
  const candidates = [];

  for (const [word, data] of Object.entries(dictionary || {})) {
    const translation = data?.translation?.trim();
    const answer = normalizeAnswer(word, sourceLocale);
    const normalizedClue = translation
      ? normalizeForComparison(translation, targetLocale)
      : "";
    const normalizedSource = normalizeForComparison(word, sourceLocale);
    const example = data?.example?.trim() || "";

    const isSuitable =
      /^\p{L}+$/u.test(word) &&
      answer.length >= 4 &&
      answer.length <= 12 &&
      translation &&
      translation.length >= 2 &&
      translation.length <= 65 &&
      normalizedSource !== normalizedClue &&
      !usedAnswers.has(answer) &&
      !usedClues.has(normalizedClue);

    if (!isSuitable) {
      continue;
    }

    usedAnswers.add(answer);
    usedClues.add(normalizedClue);

    candidates.push({
      answer,
      clue: translation,
      exampleHint: createExampleHint(word, example),
    });
  }

  return candidates;
}

function cellKey(row, column) {
  return `${row}:${column}`;
}

function getCell(grid, row, column) {
  return grid.get(cellKey(row, column));
}

function isInsideGrid(row, column) {
  return row >= 0 && row < GRID_SIZE && column >= 0 && column < GRID_SIZE;
}

function canPlaceWord(grid, answer, row, column, direction, requireCrossing) {
  const rowStep = direction === "down" ? 1 : 0;
  const columnStep = direction === "across" ? 1 : 0;
  const endRow = row + rowStep * (answer.length - 1);
  const endColumn = column + columnStep * (answer.length - 1);

  if (
    !isInsideGrid(row, column) ||
    !isInsideGrid(endRow, endColumn) ||
    getCell(grid, row - rowStep, column - columnStep) ||
    getCell(grid, endRow + rowStep, endColumn + columnStep)
  ) {
    return false;
  }

  let crossingCount = 0;

  for (let index = 0; index < answer.length; index += 1) {
    const currentRow = row + rowStep * index;
    const currentColumn = column + columnStep * index;
    const existingCell = getCell(grid, currentRow, currentColumn);

    if (existingCell) {
      if (
        existingCell.letter !== answer[index] ||
        existingCell.directions.has(direction)
      ) {
        return false;
      }

      crossingCount += 1;
      continue;
    }

    if (direction === "across") {
      if (
        getCell(grid, currentRow - 1, currentColumn) ||
        getCell(grid, currentRow + 1, currentColumn)
      ) {
        return false;
      }
    } else if (
      getCell(grid, currentRow, currentColumn - 1) ||
      getCell(grid, currentRow, currentColumn + 1)
    ) {
      return false;
    }
  }

  return !requireCrossing || crossingCount > 0;
}

function addWordToGrid(grid, placement) {
  const rowStep = placement.direction === "down" ? 1 : 0;
  const columnStep = placement.direction === "across" ? 1 : 0;

  for (let index = 0; index < placement.answer.length; index += 1) {
    const row = placement.row + rowStep * index;
    const column = placement.column + columnStep * index;
    const key = cellKey(row, column);
    const existingCell = grid.get(key);

    if (existingCell) {
      existingCell.directions.add(placement.direction);
    } else {
      grid.set(key, {
        row,
        column,
        letter: placement.answer[index],
        directions: new Set([placement.direction]),
      });
    }
  }
}

function findPlacements(grid, answer) {
  const possibilities = [];

  for (const cell of grid.values()) {
    for (let index = 0; index < answer.length; index += 1) {
      if (answer[index] !== cell.letter) {
        continue;
      }

      if (cell.directions.has("across")) {
        const row = cell.row - index;
        const column = cell.column;

        if (canPlaceWord(grid, answer, row, column, "down", true)) {
          possibilities.push({
            row,
            column,
            direction: "down",
          });
        }
      }

      if (cell.directions.has("down")) {
        const row = cell.row;
        const column = cell.column - index;

        if (canPlaceWord(grid, answer, row, column, "across", true)) {
          possibilities.push({
            row,
            column,
            direction: "across",
          });
        }
      }
    }
  }

  return shuffle(possibilities);
}

function buildOneGrid(candidates) {
  const grid = new Map();
  const placements = [];
  const startingCandidates = shuffle(candidates)
    .sort((first, second) => second.answer.length - first.answer.length)
    .slice(0, 18);
  const first = shuffle(startingCandidates).find((candidate) =>
    canPlaceWord(
      grid,
      candidate.answer,
      Math.floor(GRID_SIZE / 2),
      Math.floor((GRID_SIZE - candidate.answer.length) / 2),
      "across",
      false,
    ),
  );

  if (!first) {
    return {
      grid,
      placements,
    };
  }

  const firstPlacement = {
    ...first,
    row: Math.floor(GRID_SIZE / 2),
    column: Math.floor((GRID_SIZE - first.answer.length) / 2),
    direction: "across",
  };

  placements.push(firstPlacement);
  addWordToGrid(grid, firstPlacement);

  const remaining = shuffle(
    candidates.filter((candidate) => candidate.answer !== first.answer),
  );

  for (let pass = 0; pass < 3; pass += 1) {
    for (const candidate of remaining) {
      if (
        placements.length >= TARGET_WORD_COUNT ||
        placements.some((placement) => placement.answer === candidate.answer)
      ) {
        continue;
      }

      const possibility = findPlacements(grid, candidate.answer)[0];

      if (!possibility) {
        continue;
      }

      const placement = {
        ...candidate,
        ...possibility,
      };

      placements.push(placement);
      addWordToGrid(grid, placement);
    }
  }

  return {
    grid,
    placements,
  };
}

function addNumbersAndTrim(grid, placements) {
  const rows = [...grid.values()].map((cell) => cell.row);
  const columns = [...grid.values()].map((cell) => cell.column);
  const minimumRow = Math.min(...rows);
  const maximumRow = Math.max(...rows);
  const minimumColumn = Math.min(...columns);
  const maximumColumn = Math.max(...columns);
  const numberByStart = new Map();
  let nextNumber = 1;

  const sortedPlacements = [...placements].sort(
    (first, second) => first.row - second.row || first.column - second.column,
  );

  for (const placement of sortedPlacements) {
    const key = cellKey(placement.row, placement.column);

    if (!numberByStart.has(key)) {
      numberByStart.set(key, nextNumber);
      nextNumber += 1;
    }
  }

  const words = placements
    .map((placement, index) => ({
      id: `word-${index + 1}`,
      number: numberByStart.get(cellKey(placement.row, placement.column)),
      direction: placement.direction,
      row: placement.row - minimumRow,
      column: placement.column - minimumColumn,
      length: placement.answer.length,
      clue: placement.clue,
      exampleHint: placement.exampleHint,
    }))
    .sort(
      (first, second) =>
        first.number - second.number ||
        first.direction.localeCompare(second.direction),
    );

  const cells = [...grid.values()]
    .map((cell) => ({
      id: `${cell.row - minimumRow}-${cell.column - minimumColumn}`,
      row: cell.row - minimumRow,
      column: cell.column - minimumColumn,
      solution: cell.letter,
      directions: [...cell.directions],
      number: numberByStart.get(cellKey(cell.row, cell.column)) || null,
    }))
    .sort(
      (first, second) => first.row - second.row || first.column - second.column,
    );

  return {
    rows: maximumRow - minimumRow + 1,
    columns: maximumColumn - minimumColumn + 1,
    cells,
    words,
  };
}

export function createCrosswordPuzzle(language, story) {
  const languageConfig = crosswordLanguageConfig[language];
  const storyConfig = crosswordStoryConfig[story];

  if (!languageConfig || !storyConfig) {
    throw new Error("Neplatný jazyk nebo příběh.");
  }

  const dictionary = languageConfig.dictionaries[story];
  const candidates = createCandidatePool(
    dictionary,
    languageConfig.sourceLocale,
    languageConfig.targetLocale,
  );

  if (candidates.length < MIN_WORD_COUNT) {
    throw new Error(
      "Ve vybraném slovníku není dost vhodných slov pro vytvoření křížovky.",
    );
  }

  let bestResult = {
    grid: new Map(),
    placements: [],
  };

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const result = buildOneGrid(candidates);

    if (result.placements.length > bestResult.placements.length) {
      bestResult = result;
    }

    if (bestResult.placements.length >= TARGET_WORD_COUNT) {
      break;
    }
  }

  if (bestResult.placements.length < MIN_WORD_COUNT) {
    throw new Error(
      "Slova se tentokrát nepodařilo vhodně poskládat. Zkuste vytvořit novou křížovku.",
    );
  }

  return {
    id: `${language}-${story}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`,
    language,
    story,
    sourceLabel: languageConfig.sourceLabel,
    targetLabel: languageConfig.targetLabel,
    storyTitle: storyConfig.title,
    storyIcon: storyConfig.icon,
    ...addNumbersAndTrim(bestResult.grid, bestResult.placements),
  };
}