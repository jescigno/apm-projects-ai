export const SEARCH_CHAT_PANEL_DEFAULT_WIDTH = 300;
export const SEARCH_CHAT_PANEL_MIN_WIDTH = 260;
export const SEARCH_CHAT_PANEL_MAX_WIDTH = 560;

export const SEARCH_CHAT_HINTS = [
  { id: 'recorded-this-year', label: 'Tracks recorded this year' },
  { id: 'artists-i-like', label: 'Tracks from artists I like' },
  { id: 'under-two-minutes', label: 'Upbeat tracks under 2 minutes' },
  { id: 'similar-to-favorites', label: 'Similar to my recent favorites' },
];

export function buildInitialAssistantResponse(searchQuery) {
  return `I found tracks matching "${searchQuery}". You can refine by mood, tempo, instrumentation, or project context — tell me what you'd like to adjust.`;
}

export function buildRefineAssistantResponse(refineQuery, folderNames = []) {
  const folderNote =
    folderNames.length > 0
      ? ` I'll also prioritize tracks that fit ${folderNames.length === 1 ? `your "${folderNames[0]}" project` : `your selected projects (${folderNames.join(', ')})`}.`
      : '';

  return `Got it — narrowing results for "${refineQuery}".${folderNote} I've updated the list to better match that direction. Want to keep refining?`;
}

export function buildFollowUpAssistantResponse(message) {
  return `Understood. I've applied "${message}" to your search. Check the updated results — or ask another follow-up to keep shaping the list.`;
}

const SEARCH_CHAT_SESSION_SEEDS = [
  { id: 'session-stadium', query: 'stadium rock anthem for live sports broadcast', timeLabel: '30 minutes ago' },
  { id: 'session-milan', query: 'milan olympics broadcast package music', timeLabel: '2 hours ago' },
  { id: 'session-promo', query: 'promo 30 second uplifting corporate', timeLabel: '1 day ago' },
  { id: 'session-acoustic', query: 'acoustic indie singer songwriter', timeLabel: '2 days ago' },
  { id: 'session-instrumental', query: 'instrumental only no vocals', timeLabel: '5 days ago' },
  { id: 'session-orchestral', query: 'uplifting orchestral build to climax', timeLabel: '1 week ago' },
];

export function createChatSession({ id, query, timeLabel = 'Just now', messages }) {
  return {
    id,
    title: query,
    query,
    timeLabel,
    messages:
      messages ??
      [
        { id: `${id}-user`, role: 'user', content: query },
        { id: `${id}-assistant`, role: 'assistant', content: buildRefineAssistantResponse(query) },
      ],
  };
}

/** Past chat conversations shown under Sessions in search results version 2. */
export const SEARCH_CHAT_SESSION_HISTORY = SEARCH_CHAT_SESSION_SEEDS.map((session) =>
  createChatSession(session)
);
