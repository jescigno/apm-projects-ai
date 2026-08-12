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
