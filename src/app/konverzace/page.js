"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const languages = {
  cs: {
    label: "Čeština",
    flag: "🇨🇿",
    recognitionCode: "cs-CZ",
    speechCode: "cs-CZ",
    welcome:
      "Dobrý den! Jmenuji se Anna. Budeme spolu mluvit česky a já vás při chybě jemně opravím. Jak se dnes máte?",
    topics: [
      "Jak se máte",
      "Představení",
      "Odkud pocházíte",
      "Bydliště",
      "Práce nebo studium",
      "Koníčky",
      "Víkend",
      "Jídlo",
      "Cestování",
      "Výuka jazyka",
    ],
  },

  en: {
    label: "Angličtina",
    flag: "🇬🇧",
    recognitionCode: "en-US",
    speechCode: "en-US",
    welcome:
      "Hello! My name is Anna. We will speak English, and I will gently correct important mistakes. How are you today?",
    topics: [
      "How you are",
      "Introduction",
      "Country of origin",
      "Where you live",
      "Work or studies",
      "Hobbies",
      "Weekend",
      "Food",
      "Travel",
      "Language goals",
    ],
  },

  de: {
    label: "Němčina",
    flag: "🇩🇪",
    recognitionCode: "de-DE",
    speechCode: "de-DE",
    welcome:
      "Hallo! Ich heiße Anna. Wir sprechen Deutsch, und ich korrigiere wichtige Fehler freundlich. Wie geht es dir heute?",
    topics: [
      "Wie es dir geht",
      "Vorstellung",
      "Herkunft",
      "Wohnort",
      "Arbeit oder Studium",
      "Hobbys",
      "Wochenende",
      "Essen",
      "Reisen",
      "Sprachziele",
    ],
  },
};

function capitalizeSentence(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    return cleanText;
  }

  return cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
}

function finishSentence(text, language) {
  let result = text.trim().replace(/\s+/g, " ");

  if (!result) {
    return result;
  }

  if (language === "en") {
    result = result
      .replace(/\bi\b/g, "I")
      .replace(/\bi'm\b/gi, "I'm")
      .replace(/\bi've\b/gi, "I've")
      .replace(/\bi'll\b/gi, "I'll")
      .replace(/\bi'd\b/gi, "I'd");
  }

  result = capitalizeSentence(result);

  if (!/[.!?…]$/.test(result)) {
    result += ".";
  }

  return result;
}

function createCorrection(text, language) {
  const original = text.trim().replace(/\s+/g, " ");
  let corrected = original;
  const explanations = [];

  const applyRules = (rules) => {
    for (const rule of rules) {
      if (rule.pattern.test(corrected)) {
        corrected = corrected.replace(rule.pattern, rule.replace);

        if (!explanations.includes(rule.explanation)) {
          explanations.push(rule.explanation);
        }
      }
    }
  };

  if (language === "en") {
    applyRules([
      {
        pattern: /\bi am check\b/i,
        replace: "I am Czech",
        explanation:
          "„Check“ znamená kontrolovat nebo kontrolu. Národnost se píše „Czech“.",
      },
      {
        pattern: /\bi am czech\b/i,
        replace: "I am Czech",
        explanation:
          "Názvy národností se v angličtině píší s velkým počátečním písmenem.",
      },
      {
        pattern: /\bi am from czech\b/i,
        replace: "I am from the Czech Republic",
        explanation:
          "Pro název země použijte „the Czech Republic“ nebo „Czechia“.",
      },
      {
        pattern: /\bi from ([A-Za-zÀ-ž -]+)\b/i,
        replace: "I am from $1",
        explanation:
          "Ve větě o původu je potřeba sloveso „am“: I am from ...",
      },
      {
        pattern: /\bi am come from\b/i,
        replace: "I come from",
        explanation:
          "Správně je „I come from“, bez slovesa „am“.",
      },
      {
        pattern: /\bi have (\d{1,3}) years(?: old)?\b/i,
        replace: "I am $1 years old",
        explanation:
          "V angličtině se věk říká pomocí slovesa „to be“: I am ... years old.",
      },
      {
        pattern: /\bi am (\d{1,3}) years\b/i,
        replace: "I am $1 years old",
        explanation:
          "Za údajem o věku přidejte „years old“.",
      },
      {
        pattern: /\bi am work(?:ing)? as\b/i,
        replace: "I work as",
        explanation:
          "Pro běžné zaměstnání použijte „I work as ...“.",
      },
      {
        pattern: /\bi am work\b/i,
        replace: "I work",
        explanation:
          "Pro běžné zaměstnání použijte „I work“, nikoli „I am work“.",
      },
      {
        pattern: /\bi working as\b/i,
        replace: "I work as",
        explanation:
          "Ve větě chybí pomocné sloveso, nebo je vhodnější prostý čas: I work as ...",
      },
      {
        pattern: /\bi am engineer\b/i,
        replace: "I am an engineer",
        explanation:
          "Před názvem povolání v jednotném čísle použijte člen „a“ nebo „an“.",
      },
      {
        pattern: /\bi am a engineer\b/i,
        replace: "I am an engineer",
        explanation:
          "Před slovem začínajícím samohláskovým zvukem použijte člen „an“.",
      },
      {
        pattern: /\bi live (?:at|on) ([A-Za-zÀ-ž -]+)\b/i,
        replace: "I live in $1",
        explanation:
          "U města nebo země se obvykle používá předložka „in“.",
      },
      {
        pattern: /\bi living in\b/i,
        replace: "I live in",
        explanation:
          "Pro trvalé bydliště je přirozenější prostý čas: I live in ...",
      },
      {
        pattern: /\bi like play\b/i,
        replace: "I like playing",
        explanation:
          "Po slovese „like“ lze použít sloveso s koncovkou „-ing“: I like playing.",
      },
      {
        pattern: /\bi like to playing\b/i,
        replace: "I like playing",
        explanation:
          "Použijte buď „I like playing“, nebo „I like to play“.",
      },
      {
        pattern: /\bi want learn\b/i,
        replace: "I want to learn",
        explanation:
          "Po slovese „want“ následuje infinitiv s „to“: want to learn.",
      },
      {
        pattern: /\bi can to ([A-Za-z]+)\b/i,
        replace: "I can $1",
        explanation:
          "Po modálním slovese „can“ se „to“ nepoužívá.",
      },
      {
        pattern: /\bi don't can\b/i,
        replace: "I can't",
        explanation:
          "Zápor slovesa „can“ je „cannot“ nebo „can't“.",
      },
      {
        pattern: /\bi am agree\b/i,
        replace: "I agree",
        explanation:
          "Sloveso „agree“ nepoužíváme se slovesem „am“.",
      },
      {
        pattern: /\bi am interesting in\b/i,
        replace: "I am interested in",
        explanation:
          "Člověk je „interested“; věc nebo téma může být „interesting“.",
      },
      {
        pattern: /\bi am boring\b/i,
        replace: "I am bored",
        explanation:
          "Když se nudíte, použijte „I am bored“. „I am boring“ znamená, že nudíte ostatní.",
      },
      {
        pattern: /\bi speak english good\b/i,
        replace: "I speak English well",
        explanation:
          "Sloveso „speak“ popisuje příslovce „well“, nikoli přídavné jméno „good“.",
      },
      {
        pattern: /\bpeople is\b/i,
        replace: "people are",
        explanation:
          "Slovo „people“ je množné číslo, proto používáme „are“.",
      },
      {
        pattern: /\bmuch people\b/i,
        replace: "many people",
        explanation:
          "U počitatelného množného čísla používáme „many people“.",
      },
      {
        pattern: /\bhe have\b/i,
        replace: "he has",
        explanation:
          "Ve 3. osobě jednotného čísla používáme „has“.",
      },
      {
        pattern: /\bshe have\b/i,
        replace: "she has",
        explanation:
          "Ve 3. osobě jednotného čísla používáme „has“.",
      },
      {
        pattern: /\bit have\b/i,
        replace: "it has",
        explanation:
          "Ve 3. osobě jednotného čísla používáme „has“.",
      },
      {
        pattern: /\bmore better\b/i,
        replace: "better",
        explanation:
          "„Better“ je již druhý stupeň, proto před něj nepřidáváme „more“.",
      },
      {
        pattern: /\byesterday i go\b/i,
        replace: "Yesterday I went",
        explanation:
          "Po slově „yesterday“ použijte minulý čas: go → went.",
      },
    ]);
  }

  if (language === "de") {
    applyRules([
      {
        pattern: /\bich habe (\d{1,3}) jahre(?: alt)?\b/i,
        replace: "Ich bin $1 Jahre alt",
        explanation:
          "V němčině se věk vyjadřuje slovesem „sein“: Ich bin ... Jahre alt.",
      },
      {
        pattern: /\bich bin aus tschechien\b/i,
        replace: "Ich komme aus Tschechien",
        explanation:
          "Pro původ je přirozenější věta „Ich komme aus ...“.",
      },
      {
        pattern: /\bich komme von tschechien\b/i,
        replace: "Ich komme aus Tschechien",
        explanation:
          "U země původu se používá předložka „aus“.",
      },
      {
        pattern: /\bich wohne (?:auf|an) ([A-Za-zÀ-ž -]+)\b/i,
        replace: "Ich wohne in $1",
        explanation:
          "U měst a zemí používáme obvykle předložku „in“.",
      },
      {
        pattern: /\bich gerne ([A-Za-zÄÖÜäöüß]+)\b/i,
        replace: "Ich $1 gern",
        explanation:
          "Slovo „gern“ stojí obvykle za slovesem.",
      },
      {
        pattern: /\bich bin arbeiten\b/i,
        replace: "Ich arbeite",
        explanation:
          "Pro běžné zaměstnání použijte „Ich arbeite“.",
      },
      {
        pattern: /\bich habe gearbeitet als\b/i,
        replace: "Ich habe als",
        explanation:
          "Ve větě s povoláním stojí „als“ přímo před názvem práce.",
      },
      {
        pattern: /\bich kann zu ([A-Za-zÄÖÜäöüß]+)\b/i,
        replace: "Ich kann $1",
        explanation:
          "Po modálním slovese „können“ se infinitiv používá bez „zu“.",
      },
    ]);
  }

  if (language === "cs") {
    applyRules([
      {
        pattern: /\bjsem z ukrajina\b/i,
        replace: "Jsem z Ukrajiny",
        explanation:
          "Po předložce „z“ používáme 2. pád: z Ukrajiny.",
      },
      {
        pattern: /\bjsem z česko\b/i,
        replace: "Jsem z Česka",
        explanation:
          "Po předložce „z“ používáme 2. pád: z Česka.",
      },
      {
        pattern: /\bbydlím v brno\b/i,
        replace: "Bydlím v Brně",
        explanation:
          "Po předložce „v“ je zde správný tvar „v Brně“.",
      },
      {
        pattern: /\bbydlím v praha\b/i,
        replace: "Bydlím v Praze",
        explanation:
          "Po předložce „v“ je zde správný tvar „v Praze“.",
      },
      {
        pattern: /\bmám (\d{1,3}) roků\b/i,
        replace: "Je mi $1 let",
        explanation:
          "V češtině se věk přirozeně vyjadřuje větou „Je mi ... let“.",
      },
      {
        pattern: /\bjsem (\d{1,3}) let\b/i,
        replace: "Je mi $1 let",
        explanation:
          "V češtině se věk vyjadřuje vazbou „Je mi ... let“.",
      },
      {
        pattern: /\bpracuji na firma\b/i,
        replace: "Pracuji ve firmě",
        explanation:
          "Správně používáme spojení „ve firmě“.",
      },
      {
        pattern: /\bjá se líbí\b/i,
        replace: "Mně se líbí",
        explanation:
          "U slovesa „líbit se“ používáme 3. pád: mně se líbí.",
      },
      {
        pattern: /\bjá mám rád cestovat\b/i,
        replace: "Rád cestuji",
        explanation:
          "Přirozenější česká věta je „Rád cestuji“.",
      },
    ]);
  }

  const beforeFinishing = corrected;
  corrected = finishSentence(corrected, language);

  if (
    beforeFinishing !== corrected &&
    explanations.length === 0
  ) {
    explanations.push(
      "Upravil jsem velké počáteční písmeno, zápis zájmena nebo interpunkci."
    );
  }

  const changed = corrected !== original;

  return {
    corrected,
    changed,
    explanation: explanations.join(" "),
  };
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function getMoodReply(text, language) {
  if (language === "cs") {
    if (includesAny(text, ["dobře", "skvěle", "výborně", "fajn"])) {
      return "To ráda slyším.";
    }

    if (includesAny(text, ["špatně", "unaven", "smut", "nemoc"])) {
      return "To mě mrzí. Doufám, že se brzy budete cítit lépe.";
    }

    return "Děkuji za odpověď.";
  }

  if (language === "en") {
    if (includesAny(text, ["good", "great", "fine", "excellent"])) {
      return "I am glad to hear that.";
    }

    if (includesAny(text, ["bad", "tired", "sad", "ill", "sick"])) {
      return "I am sorry to hear that. I hope you feel better soon.";
    }

    return "Thank you for telling me.";
  }

  if (includesAny(text, ["gut", "sehr gut", "prima", "super"])) {
    return "Das freut mich.";
  }

  if (includesAny(text, ["schlecht", "müde", "traurig", "krank"])) {
    return "Das tut mir leid. Ich hoffe, dass es dir bald besser geht.";
  }

  return "Danke für deine Antwort.";
}

function extractName(text, language) {
  const patterns = {
    cs: [
      /jmenuji se\s+([A-Za-zÀ-ž-]+)/i,
      /moje jméno je\s+([A-Za-zÀ-ž-]+)/i,
    ],
    en: [
      /my name is\s+([A-Za-zÀ-ž-]+)/i,
      /i am\s+([A-Za-zÀ-ž-]+)/i,
      /i'm\s+([A-Za-zÀ-ž-]+)/i,
    ],
    de: [
      /ich heiße\s+([A-Za-zÀ-ž-]+)/i,
      /mein name ist\s+([A-Za-zÀ-ž-]+)/i,
    ],
  };

  for (const pattern of patterns[language]) {
    const match = text.match(pattern);

    if (match?.[1]) {
      return capitalizeSentence(match[1]);
    }
  }

  const words = text.trim().split(/\s+/);

  if (words.length <= 3 && words.length > 0) {
    return capitalizeSentence(words[words.length - 1].replace(/[.,!?]/g, ""));
  }

  return "";
}

function createOpenReply(text, language) {
  if (language === "cs") {
    if (includesAny(text, ["práce", "pracuji", "zaměstnání", "firma"])) {
      return "Co je na vaší práci nejtěžší a co vás naopak nejvíce baví?";
    }

    if (includesAny(text, ["rád", "ráda", "koníček", "sport", "kreslím"])) {
      return "Jak často se tomuto koníčku věnujete a s kým ho obvykle děláte?";
    }

    if (includesAny(text, ["rodina", "manžel", "manželka", "děti"])) {
      return "To je zajímavé. Co nejraději děláte společně jako rodina?";
    }

    if (includesAny(text, ["jídlo", "vařím", "restaurace", "pizza"])) {
      return "Jaké jídlo umíte nejlépe připravit a proč ho máte rád nebo ráda?";
    }

    if (includesAny(text, ["cest", "dovolen", "moře", "výlet"])) {
      return "Které místo vás zatím nejvíce překvapilo a kam byste se chtěl nebo chtěla podívat příště?";
    }

    if (includesAny(text, ["angličt", "němčin", "češtin", "jazyk"])) {
      return "Která část jazyka je pro vás nejtěžší: mluvení, poslech, gramatika, nebo slovní zásoba?";
    }

    return "To je zajímavé. Proč je to pro vás důležité a můžete uvést konkrétní příklad?";
  }

  if (language === "en") {
    if (includesAny(text, ["work", "job", "company", "office"])) {
      return "What is the most difficult part of your job, and what do you enjoy most about it?";
    }

    if (includesAny(text, ["hobby", "sport", "drawing", "music", "i like"])) {
      return "How often do you do this, and who do you usually do it with?";
    }

    if (includesAny(text, ["family", "wife", "husband", "children"])) {
      return "That sounds important. What do you enjoy doing together as a family?";
    }

    if (includesAny(text, ["food", "cook", "restaurant", "pizza"])) {
      return "What meal can you cook best, and why do you like it?";
    }

    if (includesAny(text, ["travel", "holiday", "sea", "trip"])) {
      return "Which place has surprised you the most, and where would you like to go next?";
    }

    if (includesAny(text, ["english", "german", "czech", "language"])) {
      return "Which part is the hardest for you: speaking, listening, grammar, or vocabulary?";
    }

    return "That is interesting. Why is it important to you, and can you give me a specific example?";
  }

  if (includesAny(text, ["arbeit", "beruf", "firma", "büro"])) {
    return "Was ist an deiner Arbeit am schwierigsten, und was gefällt dir am besten?";
  }

  if (includesAny(text, ["hobby", "sport", "zeichnen", "musik", "ich mag"])) {
    return "Wie oft machst du das, und mit wem machst du es normalerweise?";
  }

  if (includesAny(text, ["familie", "frau", "mann", "kinder"])) {
    return "Das klingt wichtig. Was macht ihr als Familie am liebsten zusammen?";
  }

  if (includesAny(text, ["essen", "kochen", "restaurant", "pizza"])) {
    return "Welches Gericht kannst du am besten kochen, und warum magst du es?";
  }

  if (includesAny(text, ["reise", "urlaub", "meer", "ausflug"])) {
    return "Welcher Ort hat dich bisher am meisten überrascht, und wohin möchtest du als Nächstes reisen?";
  }

  if (includesAny(text, ["englisch", "deutsch", "tschechisch", "sprache"])) {
    return "Was ist für dich am schwierigsten: Sprechen, Hören, Grammatik oder Wortschatz?";
  }

  return "Das ist interessant. Warum ist das für dich wichtig, und kannst du ein konkretes Beispiel nennen?";
}

function createConversationTurn({
  text,
  language,
  step,
  profile,
}) {
  const normalizedText = text.toLocaleLowerCase();
  const updates = {};
  let reply = "";
  let nextStep = Math.min(step + 1, 10);

  if (language === "cs") {
    switch (step) {
      case 0:
        reply = `${getMoodReply(normalizedText, language)} Jak se jmenujete?`;
        break;

      case 1: {
        const name = extractName(text, language);
        if (name) updates.name = name;
        reply = name
          ? `Těší mě, ${name}. Odkud pocházíte?`
          : "Těší mě. Odkud pocházíte?";
        break;
      }

      case 2:
        updates.origin = text;
        reply =
          "To je zajímavé. Kde nyní bydlíte a co se vám na tomto místě líbí?";
        break;

      case 3:
        updates.location = text;
        reply =
          "Jak se vám tam žije? Pracujete, studujete, nebo se věnujete něčemu jinému?";
        break;

      case 4:
        updates.work = text;
        reply =
          "Co vás na vaší práci nebo studiu nejvíce baví a co je pro vás naopak obtížné?";
        break;

      case 5:
        reply =
          "Děkuji. Co rád nebo ráda děláte ve volném čase? Máte nějaký oblíbený koníček?";
        break;

      case 6:
        updates.hobby = text;
        reply =
          "To zní zajímavě. Jak často se tomu věnujete a kdy jste s tím začal nebo začala?";
        break;

      case 7:
        reply =
          "Co obvykle děláte o víkendu? Popište mi váš ideální volný den.";
        break;

      case 8:
        reply =
          "Jaké jídlo máte nejraději? Umíte ho také připravit?";
        break;

      case 9:
        reply =
          "Rád nebo ráda cestujete? Které místo jste navštívil nebo navštívila naposledy?";
        break;

      default:
        reply = createOpenReply(normalizedText, language);
        nextStep = 10;
    }
  }

  if (language === "en") {
    switch (step) {
      case 0:
        reply = `${getMoodReply(normalizedText, language)} What is your name?`;
        break;

      case 1: {
        const name = extractName(text, language);
        if (name) updates.name = name;
        reply = name
          ? `Nice to meet you, ${name}. Which country are you from?`
          : "Nice to meet you. Which country are you from?";
        break;
      }

      case 2:
        updates.origin = text;
        reply =
          "That is interesting. Where do you live now, and what do you like about that place?";
        break;

      case 3:
        updates.location = text;
        reply =
          "What is life there like? Do you work, study, or do something else?";
        break;

      case 4:
        updates.work = text;
        reply =
          "What do you enjoy most about your work or studies, and what is difficult for you?";
        break;

      case 5:
        reply =
          "Thank you. What do you like doing in your free time? Do you have a favourite hobby?";
        break;

      case 6:
        updates.hobby = text;
        reply =
          "That sounds interesting. How often do you do it, and when did you start?";
        break;

      case 7:
        reply =
          "What do you usually do at the weekend? Please describe your ideal free day.";
        break;

      case 8:
        reply =
          "What is your favourite food? Can you cook it yourself?";
        break;

      case 9:
        reply =
          "Do you enjoy travelling? Which place did you visit most recently?";
        break;

      default:
        reply = createOpenReply(normalizedText, language);
        nextStep = 10;
    }
  }

  if (language === "de") {
    switch (step) {
      case 0:
        reply = `${getMoodReply(normalizedText, language)} Wie heißt du?`;
        break;

      case 1: {
        const name = extractName(text, language);
        if (name) updates.name = name;
        reply = name
          ? `Freut mich, ${name}. Aus welchem Land kommst du?`
          : "Freut mich. Aus welchem Land kommst du?";
        break;
      }

      case 2:
        updates.origin = text;
        reply =
          "Das ist interessant. Wo wohnst du jetzt, und was gefällt dir an diesem Ort?";
        break;

      case 3:
        updates.location = text;
        reply =
          "Wie lebt es sich dort? Arbeitest du, studierst du, oder machst du etwas anderes?";
        break;

      case 4:
        updates.work = text;
        reply =
          "Was gefällt dir an deiner Arbeit oder deinem Studium am besten, und was ist schwierig?";
        break;

      case 5:
        reply =
          "Danke. Was machst du gern in deiner Freizeit? Hast du ein Lieblingshobby?";
        break;

      case 6:
        updates.hobby = text;
        reply =
          "Das klingt interessant. Wie oft machst du das, und wann hast du damit angefangen?";
        break;

      case 7:
        reply =
          "Was machst du normalerweise am Wochenende? Beschreibe bitte deinen idealen freien Tag.";
        break;

      case 8:
        reply =
          "Was ist dein Lieblingsessen? Kannst du es auch selbst kochen?";
        break;

      case 9:
        reply =
          "Reist du gern? Welchen Ort hast du zuletzt besucht?";
        break;

      default:
        reply = createOpenReply(normalizedText, language);
        nextStep = 10;
    }
  }

  const name = updates.name || profile.name;

  if (name && step >= 3 && Math.random() < 0.22) {
    reply = `${name}, ${reply.charAt(0).toLowerCase()}${reply.slice(1)}`;
  }

  return {
    reply,
    nextStep,
    updates,
  };
}


async function requestAiTutor({
  text,
  language,
  history,
}) {
  const response = await fetch("/api/tutor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      language,
      history,
    }),
  });

  const rawText = await response.text();

  let data = null;

  try {
    data = JSON.parse(rawText);
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        rawText ||
        `Server vrátil chybu HTTP ${response.status}.`
    );
  }

  if (!data) {
    throw new Error(
      "Server nevrátil platnou JSON odpověď."
    );
  }

  return data;
}


export default function ConversationPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("cs");
  const [conversationStep, setConversationStep] = useState(0);
  const [profile, setProfile] = useState({});
  const [typedText, setTypedText] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: languages.cs.welcome,
    },
  ]);

  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentLanguage = languages[selectedLanguage];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, liveTranscript]);

  function speakText(text) {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      setErrorMessage(
        "Tento prohlížeč nepodporuje hlasové předčítání."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage.speechCode;
    utterance.rate = 0.94;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const languagePrefix = currentLanguage.speechCode
      .slice(0, 2)
      .toLowerCase();

    const matchingVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(languagePrefix)
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  async function addUserMessage(text) {
    const cleanText = text.trim();

    if (!cleanText || isThinking) {
      return;
    }

    const userMessageId = Date.now();

    const historyForAi = [
      ...messages.slice(-12).map((message) => ({
        role: message.role,
        text: message.text,
      })),
      {
        role: "user",
        text: cleanText,
      },
    ];

    setTypedText("");
    setErrorMessage("");
    setIsThinking(true);

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: userMessageId,
        role: "user",
        text: cleanText,
        correction: "",
        explanation: "",
        correctionStatus: "checking",
      },
    ]);

    try {
      const aiResult = await requestAiTutor({
        text: cleanText,
        language: selectedLanguage,
        history: historyForAi,
      });

      setConversationStep((currentStep) =>
        Math.min(currentStep + 1, 10)
      );

      setMessages((currentMessages) => [
        ...currentMessages.map((message) =>
          message.id === userMessageId
            ? {
                ...message,
                correction:
                  aiResult.hasError
                    ? aiResult.correctedText
                    : "",
                explanation:
                  aiResult.explanationCzech || "",
                correctionStatus:
                  aiResult.hasError
                    ? "corrected"
                    : "ok",
              }
            : message
        ),
        {
          id: Date.now() + 1,
          role: "assistant",
          text: aiResult.reply,
        },
      ]);

      setTimeout(() => {
        speakText(aiResult.reply);
      }, 220);
    } catch (error) {
      const fallbackResult = createConversationTurn({
        text: cleanText,
        language: selectedLanguage,
        step: conversationStep,
        profile,
      });

      setMessages((currentMessages) => [
        ...currentMessages.map((message) =>
          message.id === userMessageId
            ? {
                ...message,
                correctionStatus: "error",
                explanation:
                  error instanceof Error
                    ? error.message
                    : "AI kontrola se nepodařila.",
              }
            : message
        ),
        {
          id: Date.now() + 1,
          role: "assistant",
          text: fallbackResult.reply,
        },
      ]);

      setErrorMessage(
        "AI gramatická kontrola se nepodařila. Konverzace pokračuje v omezeném režimu."
      );
    } finally {
      setIsThinking(false);
    }
  }

  function startListening() {
    if (isThinking) {
      return;
    }

    setErrorMessage("");
    setLiveTranscript("");

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        "Rozpoznávání řeči není v tomto prohlížeči podporováno. Použijte Google Chrome nebo Microsoft Edge."
      );
      return;
    }

    window.speechSynthesis?.cancel();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = currentLanguage.recognitionCode;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimText = "";
      let finalText = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const transcript = event.results[index][0].transcript;

        if (event.results[index].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      setLiveTranscript(finalText || interimText);

      if (finalText.trim()) {
        addUserMessage(finalText);
        setLiveTranscript("");
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "not-allowed") {
        setErrorMessage(
          "Prohlížeč nemá povolený přístup k mikrofonu. Povolte mikrofon v adresním řádku."
        );
        return;
      }

      if (event.error === "no-speech") {
        setErrorMessage(
          "Nebyla rozpoznána žádná řeč. Zkuste mluvit hlasitěji a blíže k mikrofonu."
        );
        return;
      }

      setErrorMessage(
        `Rozpoznávání řeči se nepodařilo spustit: ${event.error}`
      );
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function changeLanguage(languageKey) {
    const language = languages[languageKey];

    setSelectedLanguage(languageKey);
    setConversationStep(0);
    setProfile({});
    setTypedText("");
    setLiveTranscript("");
    setErrorMessage("");

    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();

    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        text: language.welcome,
      },
    ]);
  }

  function resetConversation() {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();

    setConversationStep(0);
    setProfile({});
    setTypedText("");
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        text: currentLanguage.welcome,
      },
    ]);

    setLiveTranscript("");
    setErrorMessage("");
    setIsListening(false);
  }

  function handleTypedSubmit(event) {
    event.preventDefault();
    addUserMessage(typedText);
  }

  return (
    <main className="conversationPage">
      <section className="conversationContainer">
        <div className="conversationTopbar">
          <Link href="/" className="conversationBackLink">
            ← Zpět na hlavní stránku
          </Link>

          <button
            type="button"
            className="conversationResetButton"
            onClick={resetConversation}
          >
            Obnovit konverzaci
          </button>
        </div>

        <header className="conversationHeader">
          <div className="conversationHeaderIcon">🎤</div>

          <h1>Hlasová konverzace</h1>

          <p>
            Aplikace nyní vede delší rozhovor, pamatuje si jeho
            průběh a u vybraných častých chyb zobrazí opravenou
            větu i krátké vysvětlení.
          </p>
        </header>

        <div className="conversationLanguageTabs">
          {Object.entries(languages).map(
            ([languageKey, language]) => (
              <button
                key={languageKey}
                type="button"
                className={
                  selectedLanguage === languageKey
                    ? "conversationLanguageButton active"
                    : "conversationLanguageButton"
                }
                onClick={() => changeLanguage(languageKey)}
              >
                <span>{language.flag}</span>
                {language.label}
              </button>
            )
          )}
        </div>

        <div className="conversationTopicBar">
          <span>Aktuální téma:</span>
          <strong>
            {currentLanguage.topics[
              Math.min(
                conversationStep,
                currentLanguage.topics.length - 1
              )
            ]}
          </strong>
          <span className="conversationTopicProgress">
            Krok {Math.min(conversationStep + 1, 10)} z 10
          </span>
        </div>

        <section className="conversationCard">
          <div className="conversationPerson">
            <div className="conversationAvatar">👩‍🏫</div>

            <div>
              <h2>Anna</h2>
              <p>Vaše virtuální jazyková partnerka</p>
            </div>

            <span className="conversationOnline">Online</span>
          </div>

          <div className="conversationMessages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "conversationMessage user"
                    : "conversationMessage assistant"
                }
              >
                <span className="conversationMessageRole">
                  {message.role === "user" ? "Vy" : "Anna"}
                </span>

                <p>{message.text}</p>

                {message.role === "user" && (
                  <div
                    className={[
                      "conversationCorrection",
                      message.correctionStatus === "ok"
                        ? "isCorrect"
                        : "",
                      message.correctionStatus === "checking"
                        ? "isChecking"
                        : "",
                      message.correctionStatus === "error"
                        ? "isError"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <strong>
                      {message.correctionStatus === "checking"
                        ? "⏳ AI kontroluje větu…"
                        : message.correctionStatus === "error"
                          ? "⚠️ AI kontrola se nepodařila"
                          : message.correctionStatus === "ok"
                            ? "✅ Věta je v pořádku"
                            : "✏️ Opravená věta:"}
                    </strong>

                    {message.correction && (
                      <p>{message.correction}</p>
                    )}

                    {message.explanation && (
                      <span>{message.explanation}</span>
                    )}
                  </div>
                )}

                {message.role === "assistant" && (
                  <button
                    type="button"
                    className="conversationSpeakButton"
                    onClick={() => speakText(message.text)}
                    aria-label="Přehrát odpověď"
                  >
                    🔊 Přehrát
                  </button>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="conversationMessage assistant thinking">
                <span className="conversationMessageRole">
                  Anna
                </span>
                <p>Kontroluji větu a připravuji odpověď…</p>
              </div>
            )}

            {liveTranscript && (
              <div className="conversationMessage user live">
                <span className="conversationMessageRole">
                  Rozpoznávám…
                </span>
                <p>{liveTranscript}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {errorMessage && (
            <div className="conversationError">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="conversationControls">
            {!isListening ? (
              <button
                type="button"
                className="conversationMicrophoneButton"
                onClick={startListening}
                disabled={isThinking}
              >
                <span>🎤</span>
                {isThinking
                  ? "Anna přemýšlí…"
                  : "Začít mluvit"}
              </button>
            ) : (
              <button
                type="button"
                className="conversationStopButton"
                onClick={stopListening}
              >
                <span className="conversationPulse" />
                Zastavit nahrávání
              </button>
            )}

            <p>
              {isListening
                ? "Poslouchám… Mluvte nyní."
                : "Můžete mluvit do mikrofonu nebo odpověď napsat."}
            </p>

            <form
              className="conversationTextForm"
              onSubmit={handleTypedSubmit}
            >
              <input
                type="text"
                value={typedText}
                onChange={(event) =>
                  setTypedText(event.target.value)
                }
                placeholder="Napište odpověď pro rychlé testování..."
              />

              <button
                type="submit"
                disabled={
                  isThinking || !typedText.trim()
                }
              >
                Odeslat
              </button>
            </form>
          </div>
        </section>

        <section className="conversationHelp">
          <h2>Co je nyní lepší?</h2>

          <div className="conversationHelpGrid">
            <div>
              <span>1</span>
              <h3>Delší rozhovor</h3>
              <p>
                Anna postupně probere práci, koníčky, víkend,
                jídlo, cestování a jazykové cíle.
              </p>
            </div>

            <div>
              <span>2</span>
              <h3>Opravy vět</h3>
              <p>
                U častých chyb se pod vaší zprávou zobrazí
                lepší věta a krátké vysvětlení.
              </p>
            </div>

            <div>
              <span>3</span>
              <h3>Navazující otázky</h3>
              <p>
                Po úvodních tématech se otázky přizpůsobují
                slovům, která ve své odpovědi použijete.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}