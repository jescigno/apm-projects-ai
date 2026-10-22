import SearchHomeContent from '../components/SearchHomeContent';
import SearchResultsContent from '../components/SearchResultsContent';
import SearchResultsContentV2 from '../components/SearchResultsContentV2';
import { SEARCH_RESULTS_TRACKS } from '../components/TrackList';

export default function SearchPage({
  searchQuery,
  resultsVersion = 1,
  onRecentSearchSelect,
  soundsLikePanelOpen,
  onSoundsLikeClick,
  onSoundsLikeWithSelection,
  tracks = SEARCH_RESULTS_TRACKS,
  enterHighlightTrackNum,
  scrollToBottomSignal,
}) {
  const showResults = Boolean(searchQuery?.trim());

  if (showResults) {
    const Results = resultsVersion === 2 ? SearchResultsContentV2 : SearchResultsContent;

    return (
      <div className="search-results">
        <Results
          soundsLikePanelOpen={soundsLikePanelOpen}
          onSoundsLikeClick={onSoundsLikeClick}
          onSoundsLikeWithSelection={onSoundsLikeWithSelection}
          tracks={tracks}
          enterHighlightTrackNum={enterHighlightTrackNum}
          scrollToBottomSignal={scrollToBottomSignal}
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
