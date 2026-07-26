export const runtime = "nodejs";

const LANGUAGE_NAMES = {
  cs: "Czech",
  en: "English",
  de: "German",
};

function readGeminiText(data) {
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim() || ""
  );
}

export async function GET() {
  return Response.json({
    ok: true,
    route: "/api/tutor",
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
  });
}

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model =
      process.env.GEMINI_MODEL || "gemini-3.6-flash";

    if (!apiKey) {
      return Response.json(
        {
          error:
            "Server nevidí GEMINI_API_KEY. Zkontrolujte .env.local a restartujte Next.js server.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const learnerText =
      typeof body?.text === "string"
        ? body.text.trim()
        : "";

    const language =
      typeof body?.language === "string"
        ? body.language
        : "";

    const history = Array.isArray(body?.history)
      ? body.history.slice(-12)
      : [];

    if (!learnerText) {
      return Response.json(
        { error: "Chybí text uživatele." },
        { status: 400 }
      );
    }

    if (!LANGUAGE_NAMES[language]) {
      return Response.json(
        { error: "Nepodporovaný jazyk." },
        { status: 400 }
      );
    }

    if (learnerText.length > 1000) {
      return Response.json(
        {
          error:
            "Jedna zpráva může mít maximálně 1000 znaků.",
        },
        { status: 400 }
      );
    }

    const cleanHistory = history
      .filter(
        (item) =>
          (item?.role === "user" ||
            item?.role === "assistant") &&
          typeof item?.text === "string"
      )
      .map((item) => ({
        role: item.role,
        text: item.text.slice(0, 1000),
      }));

    const targetLanguage = LANGUAGE_NAMES[language];

    const prompt = `
You are Anna, a patient professional language tutor.

TARGET LANGUAGE: ${targetLanguage}
EXPLANATION LANGUAGE: Czech

Your task:
1. Correct the learner's latest sentence.
2. Explain the most important correction briefly in Czech.
3. Continue the conversation naturally in the target language.

Correction rules:
- Correct grammar, spelling, capitalization, word choice, missing words,
  articles, prepositions, word order, and unnatural phrasing.
- Preserve the learner's intended meaning.
- If the learner writes a fragment, convert it into a natural complete sentence.
- "I stupid" must become "I am stupid."
- "I am check" must become "I am Czech."
- "I look you place" most likely means "I like your place."
- Set hasError to true whenever a meaningful correction is needed.
- correctedText must contain the complete corrected sentence.
- explanationCzech must explain the main correction in simple Czech.
- If the sentence is already correct and natural, set hasError to false.

Conversation rules:
- reply must be only in ${targetLanguage}.
- React to the learner's actual meaning.
- Ask one relevant open follow-up question.
- Do not repeat a generic question.
- Keep reply to 1–3 sentences.

Recent conversation:
${JSON.stringify(cleanHistory, null, 2)}

Latest learner sentence:
${JSON.stringify(learnerText)}
`.trim();

    const responseSchema = {
      type: "OBJECT",
      properties: {
        correctedText: {
          type: "STRING",
          description:
            "The complete corrected natural sentence in the target language.",
        },
        hasError: {
          type: "BOOLEAN",
          description:
            "True when the learner sentence contains a meaningful language error.",
        },
        explanationCzech: {
          type: "STRING",
          description:
            "A concise explanation of the correction in Czech.",
        },
        reply: {
          type: "STRING",
          description:
            "A natural reply in the target language ending with one relevant open question.",
        },
      },
      required: [
        "correctedText",
        "hasError",
        "explanationCzech",
        "reply",
      ],
    };

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            response_schema: responseSchema,
          },
        }),
      }
    );

    const rawResponse = await geminiResponse.text();

    let geminiData = null;

    try {
      geminiData = JSON.parse(rawResponse);
    } catch {
      geminiData = null;
    }

    if (!geminiResponse.ok) {
      const apiMessage =
        geminiData?.error?.message ||
        rawResponse ||
        `Gemini API vrátilo HTTP ${geminiResponse.status}.`;

      console.error(
        "Gemini API error:",
        geminiResponse.status,
        apiMessage
      );

      return Response.json(
        {
          error: apiMessage,
          status: geminiResponse.status,
        },
        { status: geminiResponse.status }
      );
    }

    const outputText = readGeminiText(geminiData);

    if (!outputText) {
      console.error(
        "Gemini response without text:",
        geminiData
      );

      return Response.json(
        {
          error:
            "Gemini odpovědělo, ale nevrátilo textový výsledek.",
        },
        { status: 502 }
      );
    }

    let result;

    try {
      result = JSON.parse(outputText);
    } catch (error) {
      console.error(
        "Gemini returned invalid JSON:",
        outputText,
        error
      );

      return Response.json(
        {
          error:
            "Gemini vrátilo neplatný JSON. Podívejte se do terminálu na přesný výstup.",
        },
        { status: 502 }
      );
    }

    if (
      typeof result.correctedText !== "string" ||
      typeof result.hasError !== "boolean" ||
      typeof result.explanationCzech !== "string" ||
      typeof result.reply !== "string"
    ) {
      return Response.json(
        {
          error:
            "Gemini odpověď nemá všechna požadovaná pole.",
        },
        { status: 502 }
      );
    }

    return Response.json({
      correctedText: result.correctedText.trim(),
      hasError: result.hasError,
      explanationCzech:
        result.explanationCzech.trim(),
      reply: result.reply.trim(),
    });
  } catch (error) {
    console.error("Tutor route error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Neočekávaná chyba serveru.",
      },
      { status: 500 }
    );
  }
}