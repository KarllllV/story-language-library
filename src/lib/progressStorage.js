const COMPLETED_STORIES_KEY = "completedStories";
const CONVERSATION_STATS_KEY = "conversationStats";

function safelyParse(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function markStoryAsCompleted({
  id,
  title,
  language,
}) {
  const currentStories = safelyParse(
    localStorage.getItem(COMPLETED_STORIES_KEY),
    []
  );

  const completedStories = Array.isArray(
    currentStories
  )
    ? currentStories
    : [];

  const alreadyCompleted =
    completedStories.some(
      (story) => story.id === id
    );

  if (!alreadyCompleted) {
    completedStories.push({
      id,
      title,
      language,
      completedAt: new Date().toISOString(),
    });

    localStorage.setItem(
      COMPLETED_STORIES_KEY,
      JSON.stringify(completedStories)
    );
  }
}

export function recordConversationActivity({
  corrected = false,
}) {
  const currentStats = safelyParse(
    localStorage.getItem(CONVERSATION_STATS_KEY),
    {}
  );

  const nextStats = {
    sessions: Number(currentStats.sessions || 0),
    messages:
      Number(currentStats.messages || 0) + 1,
    corrections:
      Number(currentStats.corrections || 0) +
      (corrected ? 1 : 0),
    lastUsedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    CONVERSATION_STATS_KEY,
    JSON.stringify(nextStats)
  );
}

export function startConversationSession() {
  const currentStats = safelyParse(
    localStorage.getItem(CONVERSATION_STATS_KEY),
    {}
  );

  const nextStats = {
    sessions:
      Number(currentStats.sessions || 0) + 1,
    messages: Number(currentStats.messages || 0),
    corrections: Number(
      currentStats.corrections || 0
    ),
    lastUsedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    CONVERSATION_STATS_KEY,
    JSON.stringify(nextStats)
  );
}