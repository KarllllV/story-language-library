import { rabbitStory as rabbitStoryEnglish } from "@/data/rabbitstory";
import rabbitStoryCzech from "@/data/rabbitstorycz";
import { rabbitStory as rabbitStoryGerman } from "@/data/rabbitstoryde";

import { horseStory as horseStoryEnglish } from "@/data/horsestory";
import { horseStoryCz as horseStoryCzech } from "@/data/horsestorycz";
import { horseStoryDe as horseStoryGerman } from "@/data/horsestoryde";

import { foxStory as foxStoryEnglish } from "@/data/foxstory";
import { foxStoryCz as foxStoryCzech } from "@/data/foxstorycz";
import { foxStoryDe as foxStoryGerman } from "@/data/foxstoryde";

export const PRONUNCIATION_LANGUAGES = [
  {
    id: "cs",
    label: "Čeština",
    flag: "🇨🇿",
  },
  {
    id: "en",
    label: "Angličtina",
    flag: "🇬🇧",
  },
  {
    id: "de",
    label: "Němčina",
    flag: "🇩🇪",
  },
];

/*
 * Jeden záznam představuje jednu jazykovou verzi příběhu.
 *
 * Všechny tři současné příběhy jsou bezplatné. Stránka Výslovnost
 * načítá přímo skutečné věty ze všech stránek jednotlivých příběhů.
 */
export const pronunciationStories = [
  {
    id: "rabbit-cs",
    groupId: "rabbit",
    title: "Oliver a tajemný les",
    languageId: "cs",
    languageLabel: "Čeština",
    flag: "🇨🇿",
    level: "A1–A2",
    image: "/images/rabbitpic.png",
    free: true,
    story: rabbitStoryCzech,
    sentenceKey: "czech",
    translationKey: "russian",
    speechLanguage: "cs-CZ",
  },
  {
    id: "horse-cs",
    groupId: "horse",
    title: "Statečný kůň",
    languageId: "cs",
    languageLabel: "Čeština",
    flag: "🇨🇿",
    level: "A1–A2",
    image: "/images/horse1.png",
    free: true,
    story: horseStoryCzech,
    sentenceKey: "czech",
    translationKey: "russian",
    speechLanguage: "cs-CZ",
  },
  {
    id: "fox-cs",
    groupId: "fox",
    title: "Chytrá liška a tajemství Stříbrného pramene",
    languageId: "cs",
    languageLabel: "Čeština",
    flag: "🇨🇿",
    level: "A1–A2",
    image: "/images/foxpic.png",
    free: true,
    story: foxStoryCzech,
    sentenceKey: "czech",
    translationKey: "russian",
    speechLanguage: "cs-CZ",
  },
  {
    id: "rabbit-en",
    groupId: "rabbit",
    title: "Oliver a tajemný les",
    languageId: "en",
    languageLabel: "Angličtina",
    flag: "🇬🇧",
    level: "A1–A2",
    image: "/images/rabbitpic.png",
    free: true,
    story: rabbitStoryEnglish,
    sentenceKey: "english",
    translationKey: "czech",
    speechLanguage: "en-US",
  },
  {
    id: "horse-en",
    groupId: "horse",
    title: "The Brave Horse",
    languageId: "en",
    languageLabel: "Angličtina",
    flag: "🇬🇧",
    level: "A1–A2",
    image: "/images/horse1.png",
    free: true,
    story: horseStoryEnglish,
    sentenceKey: "english",
    translationKey: "czech",
    speechLanguage: "en-US",
  },
  {
    id: "fox-en",
    groupId: "fox",
    title: "Chytrá liška a tajemství Stříbrného pramene",
    languageId: "en",
    languageLabel: "Angličtina",
    flag: "🇬🇧",
    level: "A1–A2",
    image: "/images/foxpic.png",
    free: true,
    story: foxStoryEnglish,
    sentenceKey: "english",
    translationKey: "czech",
    speechLanguage: "en-US",
  },
  {
    id: "rabbit-de",
    groupId: "rabbit",
    title: "Oliver a tajemný les",
    languageId: "de",
    languageLabel: "Němčina",
    flag: "🇩🇪",
    level: "A1–A2",
    image: "/images/rabbitpic.png",
    free: true,
    story: rabbitStoryGerman,
    sentenceKey: "german",
    translationKey: "czech",
    speechLanguage: "de-DE",
  },
  {
    id: "horse-de",
    groupId: "horse",
    title: "Das tapfere Pferd",
    languageId: "de",
    languageLabel: "Němčina",
    flag: "🇩🇪",
    level: "A1–A2",
    image: "/images/horse1.png",
    free: true,
    story: horseStoryGerman,
    sentenceKey: "german",
    translationKey: "czech",
    speechLanguage: "de-DE",
  },
  {
    id: "fox-de",
    groupId: "fox",
    title: "Die kluge Füchsin und das Geheimnis der Silberquelle",
    languageId: "de",
    languageLabel: "Němčina",
    flag: "🇩🇪",
    level: "A1–A2",
    image: "/images/foxpic.png",
    free: true,
    story: foxStoryGerman,
    sentenceKey: "german",
    translationKey: "czech",
    speechLanguage: "de-DE",
  },
];

export function getStorySentences(storyVersion) {
  if (!storyVersion?.story?.pages) return [];

  return storyVersion.story.pages.flatMap((page, pageIndex) => {
    const sentences = page[storyVersion.sentenceKey] ?? [];
    const translations = page[storyVersion.translationKey] ?? [];

    return sentences
      .map((text, sentenceIndex) => ({
        id: `${storyVersion.id}-${page.page ?? pageIndex + 1}-${sentenceIndex}`,
        text: text?.trim() ?? "",
        translation: translations[sentenceIndex]?.trim() ?? "",
        page: page.page ?? pageIndex + 1,
        pageTitle: page.title ?? "",
      }))
      .filter((sentence) => sentence.text.length > 0);
  });
}