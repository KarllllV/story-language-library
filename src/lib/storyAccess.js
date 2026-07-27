const STORY_ACCESS_STORAGE_KEY = "storyLanguageLibrary:unlockedStoryIds";
const STORY_ACCESS_EVENT = "story-language-library-access-changed";

/*
 * Toto je klientská evidence přístupu vhodná pro současnou verzi aplikace.
 * Až přidáte skutečné platby a uživatelské účty, musí vlastnictví příběhu
 * ověřovat také server nebo databáze, protože localStorage lze ručně změnit.
 */

function normalizeStoryIds(value) {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value.filter(
        (storyId) => typeof storyId === "string" && storyId.trim().length > 0,
      ),
    ),
  ];
}

export function getUnlockedStoryIds() {
  if (typeof window === "undefined") return [];

  try {
    const storedValue = window.localStorage.getItem(STORY_ACCESS_STORAGE_KEY);

    return normalizeStoryIds(JSON.parse(storedValue ?? "[]"));
  } catch {
    return [];
  }
}

export function hasStoryAccess(story, unlockedStoryIds) {
  if (!story) return false;
  if (story.free) return true;

  const unlockedIds = unlockedStoryIds ?? getUnlockedStoryIds();

  return unlockedIds.includes(story.id);
}

export function unlockStoryAccess(storyId) {
  if (typeof window === "undefined" || !storyId) return [];

  const unlockedIds = normalizeStoryIds([...getUnlockedStoryIds(), storyId]);

  window.localStorage.setItem(
    STORY_ACCESS_STORAGE_KEY,
    JSON.stringify(unlockedIds),
  );
  window.dispatchEvent(new Event(STORY_ACCESS_EVENT));

  return unlockedIds;
}

export function removeStoryAccess(storyId) {
  if (typeof window === "undefined" || !storyId) return [];

  const unlockedIds = getUnlockedStoryIds().filter(
    (unlockedId) => unlockedId !== storyId,
  );

  window.localStorage.setItem(
    STORY_ACCESS_STORAGE_KEY,
    JSON.stringify(unlockedIds),
  );
  window.dispatchEvent(new Event(STORY_ACCESS_EVENT));

  return unlockedIds;
}

export function subscribeToStoryAccess(callback) {
  if (typeof window === "undefined") return () => {};

  function handleAccessChange() {
    callback(getUnlockedStoryIds());
  }

  window.addEventListener("storage", handleAccessChange);
  window.addEventListener(STORY_ACCESS_EVENT, handleAccessChange);

  return () => {
    window.removeEventListener("storage", handleAccessChange);
    window.removeEventListener(STORY_ACCESS_EVENT, handleAccessChange);
  };
}