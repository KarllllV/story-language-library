import { rabbitStory as rabbitStoryEnglish } from "@/data/rabbitstory";
import rabbitStoryCzech from "@/data/rabbitstorycz";
import { rabbitStory as rabbitStoryGerman } from "@/data/rabbitstoryde";

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
 * Až přidáte další příběh, stačí:
 * 1. importovat jeho datový soubor nahoře,
 * 2. přidat sem nový záznam,
 * 3. po úspěšné platbě zavolat unlockStoryAccess("id-pribehu").
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
    id: "rabbit-en",
    groupId: "rabbit",
    title: "Oliver and the Secret Forest",
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
    id: "rabbit-de",
    groupId: "rabbit",
    title: "Oliver und der geheime Wald",
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