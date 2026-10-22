import SearchChatPanel, {
  SearchChatPanelResizeHandle,
} from './SearchChatPanel';
import SearchFiltersPanel, { SearchSessionList } from './SearchFiltersPanel';
import {
  SEARCH_CHAT_PANEL_MAX_WIDTH,
  SEARCH_CHAT_PANEL_MIN_WIDTH,
} from '../constants/searchChat';

const VERSION_1_TABS = [
  { id: 'filters', label: 'Filters' },
  { id: 'chat', label: 'Chat' },
];

const VERSION_2_TABS = [
  { id: 'filters', label: 'Filters' },
  { id: 'history', label: 'History' },
  { id: 'chat', label: 'Chat' },
];

function SearchFiltersForVersion({
  embedded = false,
  resultsVersion = 1,
  sessions = null,
  activeSessionId = null,
  onSessionSelect,
  showSessions = true,
  width,
  onWidthChange,
}) {
  const isV2 = resultsVersion === 2;

  return (
    <SearchFiltersPanel
      key={resultsVersion}
      embedded={embedded}
      defaultSectionsOpen={!isV2}
      exclusiveSections={isV2}
      sessions={isV2 && showSessions ? sessions : null}
      activeSessionId={activeSessionId}
      onSessionSelect={onSessionSelect}
      width={embedded ? undefined : width}
      onWidthChange={embedded ? undefined : onWidthChange}
    />
  );
}

function SearchSidePanelTabs({ activeTab, onTabChange, tabs }) {
  return (
    <div className="search-side-panel-tabs" role="tablist" aria-label="Search panel">
      {tabs.map((tab) => {
        const selected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`search-side-panel-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`search-side-panel-panel-${tab.id}`}
            className={`search-side-panel-tab${selected ? ' search-side-panel-tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function SearchHistoryPanel({ sessions, activeSessionId, onSessionSelect }) {
  return (
    <div className="search-history-panel">
      <SearchSessionList
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionSelect={onSessionSelect}
      />
    </div>
  );
}

export default function SearchSidePanel({
  searchChatOpen,
  chatEngaged = false,
  sidePanelTab,
  onSidePanelTabChange,
  searchQuery = '',
  messages,
  onRefineSubmit,
  onHintSelect,
  width,
  onWidthChange,
  resultsVersion = 1,
  sessions = null,
  activeSessionId = null,
  onSessionSelect,
  filtersWidth,
  onFiltersWidthChange,
}) {
  if (!searchChatOpen) {
    return (
      <SearchFiltersForVersion
        resultsVersion={resultsVersion}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionSelect={onSessionSelect}
        width={filtersWidth}
        onWidthChange={onFiltersWidthChange}
      />
    );
  }

  const panelStyle = {
    width,
    flexBasis: width,
  };

  const tabs = resultsVersion === 2 ? VERSION_2_TABS : VERSION_1_TABS;
  const activeTab = tabs.some((tab) => tab.id === sidePanelTab) ? sidePanelTab : 'chat';
  const panelLabel =
    activeTab === 'chat' ? 'Search chat' : activeTab === 'history' ? 'Search history' : 'Search filters';

  return (
    <aside
      className={`search-side-panel search-chat-panel search-side-panel--${activeTab}`}
      style={panelStyle}
      aria-label={panelLabel}
    >
      <SearchChatPanelResizeHandle
        width={width}
        onWidthChange={onWidthChange}
        minWidth={SEARCH_CHAT_PANEL_MIN_WIDTH}
        maxWidth={SEARCH_CHAT_PANEL_MAX_WIDTH}
      />
      <SearchSidePanelTabs activeTab={activeTab} onTabChange={onSidePanelTabChange} tabs={tabs} />
      <div
        role="tabpanel"
        id={`search-side-panel-panel-${activeTab}`}
        aria-labelledby={`search-side-panel-tab-${activeTab}`}
        className="search-side-panel-content"
      >
        {activeTab === 'chat' ? (
          <SearchChatPanel
            embedded
            searchQuery={searchQuery}
            chatEngaged={chatEngaged}
            messages={messages}
            onRefineSubmit={onRefineSubmit}
            onHintSelect={onHintSelect}
          />
        ) : activeTab === 'history' ? (
          <SearchHistoryPanel
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSessionSelect={onSessionSelect}
          />
        ) : (
          <SearchFiltersForVersion
            embedded
            resultsVersion={resultsVersion}
            showSessions={false}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSessionSelect={onSessionSelect}
          />
        )}
      </div>
    </aside>
  );
}
