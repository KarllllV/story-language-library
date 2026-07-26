export const SETTINGS_STORAGE_KEY = "storyLanguageSettings";

export const DEFAULT_APP_SETTINGS = {
  defaultLanguage: "en",
  readingSpeed: 0.9,
  fontSize: "medium",
  selectedVoice: "",
  autoContinue: true,
  showTranslations: true,
  highlightCurrentWord: true,
};

export function getAppSettings() {
  if (typeof window === "undefined") {
    return DEFAULT_APP_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!stored) {
      return DEFAULT_APP_SETTINGS;
    }

    return {
      ...DEFAULT_APP_SETTINGS,
      ...JSON.parse(stored),
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function saveAppSettings(settings) {
  if (typeof window === "undefined") {
    return;
  }

  const nextSettings = {
    ...DEFAULT_APP_SETTINGS,
    ...settings,
  };

  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(nextSettings)
  );

  window.dispatchEvent(
    new CustomEvent("settings-updated", {
      detail: nextSettings,
    })
  );
}

export function getFontSizeInPixels(size) {
  const sizes = {
    small: 18,
    medium: 21,
    large: 25,
  };

  return sizes[size] || sizes.medium;
}