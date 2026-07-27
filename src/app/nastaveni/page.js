"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "./nastaveni.css";

const SETTINGS_KEY = "storyLanguageSettings";

const DEFAULT_SETTINGS = {
  defaultLanguage: "en",
  readingSpeed: 0.9,
  fontSize: "medium",
  selectedVoice: "",
  autoContinue: true,
  showTranslations: true,
  highlightCurrentWord: true,
};

const LANGUAGE_OPTIONS = {
  en: {
    label: "Angličtina",
    flag: "🇬🇧",
    speechCode: "en-US",
    preview: "Welcome to language learning. Let us practise together.",
  },
  de: {
    label: "Němčina",
    flag: "🇩🇪",
    speechCode: "de-DE",
    preview: "Willkommen beim Sprachenlernen. Lassen Sie uns gemeinsam üben.",
  },
  cs: {
    label: "Čeština",
    flag: "🇨🇿",
    speechCode: "cs-CZ",
    preview: "Vítejte ve výuce jazyků. Pojďme společně procvičovat.",
  },
};

function loadStoredSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);

    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(stored);

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function NastaveniPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [voices, setVoices] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSettings(loadStoredSettings());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    function loadVoices() {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      setVoices(window.speechSynthesis.getVoices());
    }

    loadVoices();

    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  const availableVoices = useMemo(() => {
    const language = LANGUAGE_OPTIONS[settings.defaultLanguage];

    const prefix = language.speechCode.slice(0, 2).toLowerCase();

    return voices.filter((voice) =>
      voice.lang.toLowerCase().startsWith(prefix),
    );
  }, [voices, settings.defaultLanguage]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (
      settings.selectedVoice &&
      !availableVoices.some((voice) => voice.name === settings.selectedVoice)
    ) {
      setSettings((current) => ({
        ...current,
        selectedVoice: "",
      }));
    }
  }, [availableVoices, isLoaded, settings.selectedVoice]);

  function updateSetting(name, value) {
    setSettings((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    window.dispatchEvent(
      new CustomEvent("settings-updated", {
        detail: settings,
      }),
    );

    setMessage("Nastavení bylo uloženo.");

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  function resetSettings() {
    const confirmed = window.confirm(
      "Opravdu chcete obnovit výchozí nastavení?",
    );

    if (!confirmed) {
      return;
    }

    setSettings(DEFAULT_SETTINGS);

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));

    window.dispatchEvent(
      new CustomEvent("settings-updated", {
        detail: DEFAULT_SETTINGS,
      }),
    );

    setMessage("Výchozí nastavení bylo obnoveno.");
  }

  function testVoice() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setMessage("Tento prohlížeč nepodporuje hlasové předčítání.");
      return;
    }

    const language = LANGUAGE_OPTIONS[settings.defaultLanguage];

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(language.preview);

    utterance.lang = language.speechCode;
    utterance.rate = Number(settings.readingSpeed);

    const selectedVoice =
      availableVoices.find((voice) => voice.name === settings.selectedVoice) ||
      availableVoices[0];

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  return (
    <main className="settingsPage">
      <section className="settingsContainer">
        <div className="settingsTopbar">
          <Link href="/" className="settingsBackLink">
            ← Zpět na hlavní stránku
          </Link>

          <button
            type="button"
            className="settingsResetTopButton"
            onClick={resetSettings}
          >
            Obnovit výchozí
          </button>
        </div>

        <header className="settingsHeader">
          <div className="settingsHeaderIcon">⚙️</div>

          <h1>Nastavení</h1>

          <p>
            Nastavte výchozí jazyk, hlas, rychlost předčítání a chování
            interaktivních příběhů.
          </p>
        </header>

        <div className="settingsGrid">
          <section className="settingsCard">
            <div className="settingsCardHeading">
              <span>🌍</span>
              <div>
                <h2>Výchozí jazyk</h2>
                <p>
                  Tento jazyk se nabídne jako první v příbězích a cvičeních.
                </p>
              </div>
            </div>

            <div className="settingsLanguageOptions">
              {Object.entries(LANGUAGE_OPTIONS).map(([key, language]) => (
                <button
                  key={key}
                  type="button"
                  className={settings.defaultLanguage === key ? "active" : ""}
                  onClick={() => updateSetting("defaultLanguage", key)}
                >
                  <span>{language.flag}</span>
                  {language.label}
                </button>
              ))}
            </div>
          </section>

          <section className="settingsCard">
            <div className="settingsCardHeading">
              <span>🔊</span>
              <div>
                <h2>Hlas předčítání</h2>
                <p>Vyberte hlas dostupný ve vašem prohlížeči.</p>
              </div>
            </div>

            <label className="settingsField">
              <span>Vybraný hlas</span>

              <select
                value={settings.selectedVoice}
                onChange={(event) =>
                  updateSetting("selectedVoice", event.target.value)
                }
              >
                <option value="">Automaticky vybrat nejlepší hlas</option>

                {availableVoices.map((voice) => (
                  <option
                    key={`${voice.name}-${voice.lang}`}
                    value={voice.name}
                  >
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </label>

            {availableVoices.length === 0 && (
              <div className="settingsWarning">
                Pro zvolený jazyk nebyl nalezen žádný hlas. Windows může
                vyžadovat instalaci jazykového hlasu.
              </div>
            )}

            <button
              type="button"
              className="settingsTestButton"
              onClick={testVoice}
            >
              ▶ Vyzkoušet hlas
            </button>
          </section>

          <section className="settingsCard">
            <div className="settingsCardHeading">
              <span>⏱️</span>
              <div>
                <h2>Rychlost předčítání</h2>
                <p>Upravte rychlost čtení příběhů a výslovnostních ukázek.</p>
              </div>
            </div>

            <div className="settingsRangeHeader">
              <span>Pomalu</span>
              <strong>{Number(settings.readingSpeed).toFixed(1)}×</strong>
              <span>Rychle</span>
            </div>

            <input
              className="settingsRange"
              type="range"
              min="0.6"
              max="1.4"
              step="0.1"
              value={settings.readingSpeed}
              onChange={(event) =>
                updateSetting("readingSpeed", Number(event.target.value))
              }
            />

            <div className="settingsPresetButtons">
              <button
                type="button"
                onClick={() => updateSetting("readingSpeed", 0.7)}
              >
                0,7×
              </button>

              <button
                type="button"
                onClick={() => updateSetting("readingSpeed", 0.9)}
              >
                0,9×
              </button>

              <button
                type="button"
                onClick={() => updateSetting("readingSpeed", 1.1)}
              >
                1,1×
              </button>
            </div>
          </section>

          <section className="settingsCard">
            <div className="settingsCardHeading">
              <span>🔤</span>
              <div>
                <h2>Velikost textu</h2>
                <p>Nastavte velikost textu v interaktivních příbězích.</p>
              </div>
            </div>

            <div className="settingsFontOptions">
              <button
                type="button"
                className={settings.fontSize === "small" ? "active" : ""}
                onClick={() => updateSetting("fontSize", "small")}
              >
                <span className="small">A</span>
                Menší
              </button>

              <button
                type="button"
                className={settings.fontSize === "medium" ? "active" : ""}
                onClick={() => updateSetting("fontSize", "medium")}
              >
                <span className="medium">A</span>
                Střední
              </button>

              <button
                type="button"
                className={settings.fontSize === "large" ? "active" : ""}
                onClick={() => updateSetting("fontSize", "large")}
              >
                <span className="large">A</span>
                Větší
              </button>
            </div>
          </section>

          <section className="settingsCard settingsWideCard">
            <div className="settingsCardHeading">
              <span>📖</span>
              <div>
                <h2>Chování příběhů</h2>
                <p>Zapněte nebo vypněte pomocné funkce při čtení.</p>
              </div>
            </div>

            <div className="settingsSwitchList">
              <label>
                <div>
                  <strong>Automaticky pokračovat</strong>
                  <span>Po zavření překladu pokračovat ve čtení.</span>
                </div>

                <input
                  type="checkbox"
                  checked={settings.autoContinue}
                  onChange={(event) =>
                    updateSetting("autoContinue", event.target.checked)
                  }
                />

                <span className="settingsSwitch" />
              </label>

              <label>
                <div>
                  <strong>Zobrazovat překlady</strong>
                  <span>U příběhu zobrazit překlad celé věty.</span>
                </div>

                <input
                  type="checkbox"
                  checked={settings.showTranslations}
                  onChange={(event) =>
                    updateSetting("showTranslations", event.target.checked)
                  }
                />

                <span className="settingsSwitch" />
              </label>

              <label>
                <div>
                  <strong>Zvýraznit čtené slovo</strong>
                  <span>Během předčítání barevně označit aktuální slovo.</span>
                </div>

                <input
                  type="checkbox"
                  checked={settings.highlightCurrentWord}
                  onChange={(event) =>
                    updateSetting("highlightCurrentWord", event.target.checked)
                  }
                />

                <span className="settingsSwitch" />
              </label>
            </div>
          </section>
        </div>

        {message && <div className="settingsMessage">✅ {message}</div>}

        <div className="settingsBottomActions">
          <button
            type="button"
            className="settingsResetButton"
            onClick={resetSettings}
          >
            Obnovit výchozí nastavení
          </button>

          <button
            type="button"
            className="settingsSaveButton"
            onClick={saveSettings}
          >
            💾 Uložit nastavení
          </button>
        </div>
      </section>
    </main>
  );
}