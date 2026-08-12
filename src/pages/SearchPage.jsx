import SearchHomeContent from '../components/SearchHomeContent';
import SearchResultsContent from '../components/SearchResultsContent';
import { SEARCH_RESULTS_TRACKS } from '../components/TrackList';

export default function SearchPage({
  searchQuery,
  onRecentSearchSelect,
  soundsLikePanelOpen,
  onSoundsLikeClick,
  onSoundsLikeWithSelection,
  tracks = SEARCH_RESULTS_TRACKS,
  enterHighlightTrackNum,
  scrollToBottomSignal,
  onRefineSubmit,
  searchChatOpen,
  pendingRefineHint,
  onPendingRefineHintConsumed,
}) {
  const showResults = Boolean(searchQuery?.trim());

  if (showResults) {
    return (
      <div className="search-results">
        <SearchResultsContent
          soundsLikePanelOpen={soundsLikePanelOpen}
          onSoundsLikeClick={onSoundsLikeClick}
          onSoundsLikeWithSelection={onSoundsLikeWithSelection}
          tracks={tracks}
          enterHighlightTrackNum={enterHighlightTrackNum}
          scrollToBottomSignal={scrollToBottomSignal}
          onRefineSubmit={onRefineSubmit}
          searchChatOpen={searchChatOpen}
          pendingRefineHint={pendingRefineHint}
          onPendingRefineHintConsumed={onPendingRefineHintConsumed}
        />
      </div>
    );
  }

  return (
    <div className="search-home">
      <SearchHomeContent onRecentSearchSelect={onRecentSearchSelect} />
    </div>
  );
}
