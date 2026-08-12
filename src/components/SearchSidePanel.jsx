import SearchChatPanel, {
  SearchChatPanelResizeHandle,
} from './SearchChatPanel';
import SearchFiltersPanel from './SearchFiltersPanel';
import {
  SEARCH_CHAT_PANEL_MAX_WIDTH,
  SEARCH_CHAT_PANEL_MIN_WIDTH,
} from '../constants/searchChat';

function SearchSidePanelTabs({ activeTab, onTabChange }) {
  return (
    <div className="search-side-panel-tabs" role="tablist" aria-label="Search panel">
      <button
        type="button"
        role="tab"
        id="search-side-panel-tab-filters"
        aria-selected={activeTab === 'filters'}
        aria-controls="search-side-panel-panel-filters"
        className={`search-side-panel-tab${activeTab === 'filters' ? ' search-side-panel-tab--active' : ''}`}
        onClick={() => onTabChange('filters')}
      >
        Filters
      </button>
      <button
        type="button"
        role="tab"
        id="search-side-panel-tab-chat"
        aria-selected={activeTab === 'chat'}
        aria-controls="search-side-panel-panel-chat"
        className={`search-side-panel-tab${activeTab === 'chat' ? ' search-side-panel-tab--active' : ''}`}
        onClick={() => onTabChange('chat')}
      >
        Chat
      </button>
    </div>
  );
}

export default function SearchSidePanel({
  searchChatOpen,
  chatEngaged = false,
  sidePanelTab,
  onSidePanelTabChange,
  messages,
  onRefineSubmit,
  onHintSelect,
  width,
  onWidthChange,
}) {
  if (!searchChatOpen) {
    return <SearchFiltersPanel />;
  }

  const panelStyle = {
    width,
    flexBasis: width,
  };

  const isChatTab = sidePanelTab === 'chat';

  return (
    <aside
      className={`search-side-panel search-chat-panel search-side-panel--${sidePanelTab}`}
      style={panelStyle}
      aria-label={isChatTab ? 'Search chat' : 'Search filters'}
    >
      <SearchChatPanelResizeHandle
        width={width}
        onWidthChange={onWidthChange}
        minWidth={SEARCH_CHAT_PANEL_MIN_WIDTH}
        maxWidth={SEARCH_CHAT_PANEL_MAX_WIDTH}
      />
      <SearchSidePanelTabs activeTab={sidePanelTab} onTabChange={onSidePanelTabChange} />
      <div
        role="tabpanel"
        id={isChatTab ? 'search-side-panel-panel-chat' : 'search-side-panel-panel-filters'}
        aria-labelledby={isChatTab ? 'search-side-panel-tab-chat' : 'search-side-panel-tab-filters'}
        className="search-side-panel-content"
      >
        {isChatTab ? (
          <SearchChatPanel
            embedded
            chatEngaged={chatEngaged}
            messages={messages}
            onRefineSubmit={onRefineSubmit}
            onHintSelect={onHintSelect}
          />
        ) : (
          <SearchFiltersPanel embedded />
        )}
      </div>
    </aside>
  );
}
