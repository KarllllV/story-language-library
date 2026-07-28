import { createHmac, randomUUID } from "node:crypto";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LANGUAGE_NAMES = {
  cs: "Czech",
  en: "English",
  de: "German",
};

const VISITOR_COOKIE = "storyTutorVisitor";
const VISITOR_DAILY_LIMIT = 30;
const IP_DAILY_LIMIT = 60;
const GLOBAL_DAILY_LIMIT = 400;
const IP_MINUTE_LIMIT = 4;
const GLOBAL_MINUTE_LIMIT = 12;
const DAILY_KEY_TTL_SECONDS = 3 * 24 * 60 * 60;
const MINUTE_KEY_TTL_SECONDS = 2 * 60;

const RATE_LIMIT_SCRIPT = `
local current = {}
local blockedIndex = 0

for i = 1, #KEYS do
  current[i] = tonumber(redis.call("GET", KEYS[i]) or "0")

  if blockedIndex == 0 and current[i] >= tonumber(ARGV[i]) then
    blockedIndex = i
  end
end

if blockedIndex > 0 then
  local blockedResult = {0, blockedIndex}

  for i = 1, #current do
    table.insert(blockedResult, current[i])
  end

  return blockedResult
end

local allowedResult = {1, 0}

for i = 1, #KEYS do
  local newValue = redis.call("INCR", KEYS[i])

  if newValue == 1 then
    redis.call("EXPIRE", KEYS[i], tonumber(ARGV[#KEYS + i]))
  end

  table.insert(allowedResult, newValue)
end

return allowedResult
`;

let redisClient = null;

function getRedis() {
  if (redisClient) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

function readGeminiText(data) {
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim() || ""
  );
}

function readCookie(request, name) {
  const cookieHeader = request.headers.get("cookie") || "";

  for (const cookiePart of cookieHeader.split(";")) {
    const separatorIndex = cookiePart.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const cookieName = cookiePart
      .slice(0, separatorIndex)
      .trim();

    if (cookieName !== name) {
      continue;
    }

    try {
      return decodeURIComponent(
        cookiePart.slice(separatorIndex + 1).trim()
      );
    } catch {
      return "";
    }
  }

  return "";
}

function getVisitor(request) {
  const storedId = readCookie(request, VISITOR_COOKIE);
  const isValidId = /^[a-f0-9-]{20,64}$/i.test(storedId);

  return {
    id: isValidId ? storedId : randomUUID(),
    isNew: !isValidId,
  };
}

function getClientIp(request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for") || "";

  return (
    forwardedFor.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function secureHash(value) {
  const salt = process.env.RATE_LIMIT_SALT;

  if (!salt) {
    return null;
  }

  return createHmac("sha256", salt)
    .update(value)
    .digest("hex");
}

function getPacificDayKey() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) =>
        ["year", "month", "day"].includes(part.type)
      )
      .map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function createLimitIdentity(request) {
  const visitor = getVisitor(request);
  const visitorHash = secureHash(visitor.id);
  const ipHash = secureHash(getClientIp(request));

  if (!visitorHash || !ipHash) {
    return {
      visitor,
      error:
        "Na serveru chybí RATE_LIMIT_SALT. AI konverzace byla bezpečně pozastavena.",
    };
  }

  return {
    visitor,
    visitorHash,
    ipHash,
    error: "",
  };
}

function addVisitorCookie(response, visitor) {
  if (!visitor?.isNew) {
    return response;
  }

  const secure =
    process.env.NODE_ENV === "production"
      ? "; Secure"
      : "";

  response.headers.append(
    "Set-Cookie",
    `${VISITOR_COOKIE}=${encodeURIComponent(
      visitor.id
    )}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}`
  );

  return response;
}

function jsonResponse(
  data,
  { status = 200, headers = {} } = {},
  visitor = null
) {
  const response = Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });

  return addVisitorCookie(response, visitor);
}

function getDailyKeys(identity) {
  const dayKey = getPacificDayKey();

  return [
    `story-tutor:day:${dayKey}:visitor:${identity.visitorHash}`,
    `story-tutor:day:${dayKey}:ip:${identity.ipHash}`,
    `story-tutor:day:${dayKey}:global`,
  ];
}

function calculateRemaining(
  visitorCount,
  ipCount,
  globalCount
) {
  return Math.max(
    0,
    Math.min(
      VISITOR_DAILY_LIMIT - visitorCount,
      IP_DAILY_LIMIT - ipCount,
      GLOBAL_DAILY_LIMIT - globalCount
    )
  );
}

async function readLimitStatus(redis, identity) {
  const values = await redis.mget(...getDailyKeys(identity));

  const visitorCount = Number(values?.[0] || 0);
  const ipCount = Number(values?.[1] || 0);
  const globalCount = Number(values?.[2] || 0);

  return {
    dailyLimit: VISITOR_DAILY_LIMIT,
    remaining: calculateRemaining(
      visitorCount,
      ipCount,
      globalCount
    ),
  };
}

async function consumeLimit(redis, identity) {
  const minuteKey = Math.floor(Date.now() / 60000);
  const dailyKeys = getDailyKeys(identity);

  const keys = [
    `story-tutor:minute:${minuteKey}:ip:${identity.ipHash}`,
    `story-tutor:minute:${minuteKey}:global`,
    ...dailyKeys,
  ];

  const limits = [
    IP_MINUTE_LIMIT,
    GLOBAL_MINUTE_LIMIT,
    VISITOR_DAILY_LIMIT,
    IP_DAILY_LIMIT,
    GLOBAL_DAILY_LIMIT,
  ];

  const expirations = [
    MINUTE_KEY_TTL_SECONDS,
    MINUTE_KEY_TTL_SECONDS,
    DAILY_KEY_TTL_SECONDS,
    DAILY_KEY_TTL_SECONDS,
    DAILY_KEY_TTL_SECONDS,
  ];

  const rawResult = await redis.eval(
    RATE_LIMIT_SCRIPT,
    keys,
    [...limits, ...expirations]
  );

  if (!Array.isArray(rawResult) || rawResult.length < 7) {
    throw new Error(
      "Počítadlo limitu vrátilo neplatnou odpověď."
    );
  }

  const result = rawResult.map((value) => Number(value));
  const allowed = result[0] === 1;
  const blockedIndex = result[1];
  const counts = result.slice(2);

  const remaining = calculateRemaining(
    counts[2] || 0,
    counts[3] || 0,
    counts[4] || 0
  );

  if (allowed) {
    return {
      allowed: true,
      dailyLimit: VISITOR_DAILY_LIMIT,
      remaining,
    };
  }

  const blockedResponses = {
    1: {
      code: "MINUTE_IP_LIMIT",
      error:
        "Odesíláte zprávy příliš rychle. Počkejte prosím chvíli a zkuste to znovu.",
    },
    2: {
      code: "MINUTE_GLOBAL_LIMIT",
      error:
        "AI konverzaci právě používá více lidí. Počkejte prosím chvíli a zkuste to znovu.",
    },
    3: {
      code: "DAILY_VISITOR_LIMIT",
      error:
        "Dnešní bezplatný limit 30 AI odpovědí byl vyčerpán. Zkuste to prosím znovu zítra.",
    },
    4: {
      code: "DAILY_IP_LIMIT",
      error:
        "Dnešní bezplatný limit pro tuto internetovou síť byl vyčerpán. Zkuste to prosím znovu zítra.",
    },
    5: {
      code: "DAILY_GLOBAL_LIMIT",
      error:
        "Dnešní kapacita AI konverzace je vyčerpána. Zkuste to prosím znovu zítra.",
    },
  };

  return {
    allowed: false,
    dailyLimit: VISITOR_DAILY_LIMIT,
    remaining,
    ...(blockedResponses[blockedIndex] ||
      blockedResponses[5]),
  };
}

function rateLimitSetupError(visitor) {
  return jsonResponse(
    {
      error:
        "Serverové počítadlo AI konverzace není nastavené. Zkontrolujte proměnné UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN a RATE_LIMIT_SALT.",
      code: "RATE_LIMIT_NOT_CONFIGURED",
    },
    { status: 503 },
    visitor
  );
}

export async function GET(request) {
  const model =
    process.env.GEMINI_MODEL ||
    "gemini-3.5-flash-lite";

  const identity = createLimitIdentity(request);

  if (identity.error) {
    return rateLimitSetupError(identity.visitor);
  }

  const redis = getRedis();

  if (!redis) {
    return rateLimitSetupError(identity.visitor);
  }

  try {
    const status = await readLimitStatus(redis, identity);

    return jsonResponse(
      {
        ok: true,
        route: "/api/tutor",
        hasKey: Boolean(process.env.GEMINI_API_KEY),
        model,
        ...status,
      },
      {},
      identity.visitor
    );
  } catch (error) {
    console.error("Rate limit status error:", error);

    return jsonResponse(
      {
        error:
          "Nepodařilo se načíst zabezpečení AI konverzace. Zkuste to prosím později.",
        code: "RATE_LIMIT_UNAVAILABLE",
      },
      { status: 503 },
      identity.visitor
    );
  }
}

export async function POST(request) {
  const identity = createLimitIdentity(request);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model =
      process.env.GEMINI_MODEL ||
      "gemini-3.5-flash-lite";

    if (!apiKey) {
      return jsonResponse(
        {
          error:
            "Server nevidí GEMINI_API_KEY. Zkontrolujte .env.local a restartujte Next.js server.",
        },
        { status: 500 },
        identity.visitor
      );
    }

    const contentLength = Number(
      request.headers.get("content-length") || 0
    );

    if (contentLength > 50000) {
      return jsonResponse(
        {
          error: "Odeslaný požadavek je příliš velký.",
        },
        { status: 413 },
        identity.visitor
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        { error: "Požadavek neobsahuje platná data." },
        { status: 400 },
        identity.visitor
      );
    }

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
      return jsonResponse(
        { error: "Chybí text uživatele." },
        { status: 400 },
        identity.visitor
      );
    }

    if (!LANGUAGE_NAMES[language]) {
      return jsonResponse(
        { error: "Nepodporovaný jazyk." },
        { status: 400 },
        identity.visitor
      );
    }

    if (learnerText.length > 1000) {
      return jsonResponse(
        {
          error:
            "Jedna zpráva může mít maximálně 1000 znaků.",
        },
        { status: 400 },
        identity.visitor
      );
    }

    if (identity.error) {
      return rateLimitSetupError(identity.visitor);
    }

    const redis = getRedis();

    if (!redis) {
      return rateLimitSetupError(identity.visitor);
    }

    let limitResult;

    try {
      limitResult = await consumeLimit(redis, identity);
    } catch (error) {
      console.error("Rate limit check error:", error);

      return jsonResponse(
        {
          error:
            "Ochranu AI konverzace se nepodařilo ověřit. Zkuste to prosím později.",
          code: "RATE_LIMIT_UNAVAILABLE",
        },
        { status: 503 },
        identity.visitor
      );
    }

    if (!limitResult.allowed) {
      return jsonResponse(
        limitResult,
        {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        },
        identity.visitor
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
            maxOutputTokens: 500,
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

      return jsonResponse(
        {
          error: apiMessage,
          status: geminiResponse.status,
          dailyLimit: limitResult.dailyLimit,
          remaining: limitResult.remaining,
        },
        { status: geminiResponse.status },
        identity.visitor
      );
    }

    const outputText = readGeminiText(geminiData);

    if (!outputText) {
      console.error(
        "Gemini response without text:",
        geminiData
      );

      return jsonResponse(
        {
          error:
            "Gemini odpovědělo, ale nevrátilo textový výsledek.",
          dailyLimit: limitResult.dailyLimit,
          remaining: limitResult.remaining,
        },
        { status: 502 },
        identity.visitor
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

      return jsonResponse(
        {
          error:
            "Gemini vrátilo neplatný JSON. Podívejte se do terminálu na přesný výstup.",
          dailyLimit: limitResult.dailyLimit,
          remaining: limitResult.remaining,
        },
        { status: 502 },
        identity.visitor
      );
    }

    if (
      typeof result.correctedText !== "string" ||
      typeof result.hasError !== "boolean" ||
      typeof result.explanationCzech !== "string" ||
      typeof result.reply !== "string"
    ) {
      return jsonResponse(
        {
          error:
            "Gemini odpověď nemá všechna požadovaná pole.",
          dailyLimit: limitResult.dailyLimit,
          remaining: limitResult.remaining,
        },
        { status: 502 },
        identity.visitor
      );
    }

    return jsonResponse(
      {
        correctedText: result.correctedText.trim(),
        hasError: result.hasError,
        explanationCzech:
          result.explanationCzech.trim(),
        reply: result.reply.trim(),
        dailyLimit: limitResult.dailyLimit,
        remaining: limitResult.remaining,
      },
      {},
      identity.visitor
    );
  } catch (error) {
    console.error("Tutor route error:", error);

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Neočekávaná chyba serveru.",
      },
      { status: 500 },
      identity.visitor
    );
  }
}