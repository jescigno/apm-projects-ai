import { useEffect, useRef } from 'react';
import { findFolderById, PROJECTS_PANEL_FOLDER_TREE } from '../constants/projectsPanelTree';
import {
  SEARCH_CHAT_HINTS,
  SEARCH_CHAT_PANEL_MAX_WIDTH,
  SEARCH_CHAT_PANEL_MIN_WIDTH,
} from '../constants/searchChat';
import SearchRefineBar from './SearchRefineBar';

function getFolderNames(folderIds = []) {
  return folderIds
    .map((id) => findFolderById(PROJECTS_PANEL_FOLDER_TREE, id)?.name)
    .filter(Boolean);
}

export function SearchChatPanelResizeHandle({
  onWidthChange,
  width,
  minWidth,
  maxWidth,
  label = 'Resize chat panel',
}) {
  const resizeRef = useRef(null);
  const widthRef = useRef(width);
  widthRef.current = width;

  useEffect(() => {
    if (!resizeRef.current || !onWidthChange) return;

    const handle = resizeRef.current;

    const onMouseDown = (event) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = widthRef.current;

      const onMouseMove = (moveEvent) => {
        const delta = moveEvent.clientX - startX;
        const next = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));
        onWidthChange(next);
      };

      const onMouseUp = () => {
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
    return () => handle.removeEventListener('mousedown', onMouseDown);
  }, [onWidthChange, minWidth, maxWidth]);

  return (
    <div
      ref={resizeRef}
      className="search-chat-panel-resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
    />
  );
}

function SearchChatHints({ layout = 'carousel', onHintSelect }) {
  const isStacked = layout === 'stacked';

  return (
    <div
      className={isStacked ? 'search-chat-hints-stack' : 'search-chat-hints-carousel'}
      aria-label="Suggested questions"
    >
      <div className={isStacked ? 'search-chat-hints-stack-list' : 'search-chat-hints-track'}>
        {SEARCH_CHAT_HINTS.map((hint) => (
          <button
            key={hint.id}
            type="button"
            className="search-chat-hint-chip"
            onClick={() => onHintSelect?.(hint.label)}
          >
            {hint.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SearchChatPanelContent({
  searchQuery = '',
  messages = [],
  chatEngaged = false,
  onRefineSubmit,
  onHintSelect,
}) {
  const bodyRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    if (!chatEngaged) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, chatEngaged]);

  const threadMessages = messages.filter((message, index) => {
    if (index !== 0 || message.role !== 'user') return true;
    return message.content !== searchQuery.trim();
  });

  return (
    <>
      {searchQuery.trim() ? (
        <p className="search-chat-query">{searchQuery.trim()}</p>
      ) : null}
      <div
        className={`search-chat-panel-body${chatEngaged ? '' : ' search-chat-panel-body--intro'}`}
        ref={bodyRef}
      >
        {chatEngaged ? (
          <div className="search-chat-thread">
            {threadMessages.map((message) => {
              const folderNames = message.folderIds ? getFolderNames(message.folderIds) : [];
              return (
                <div
                  key={message.id}
                  className={`search-chat-message search-chat-message--${message.role}`}
                >
                  <div className="search-chat-message-content">{message.content}</div>
                  {folderNames.length > 0 && (
                    <div className="search-chat-message-folders">
                      {folderNames.map((name) => (
                        <span key={name} className="search-chat-message-folder-tag">
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={endRef} className="search-chat-thread-end" aria-hidden />
          </div>
        ) : (
          <SearchChatHints layout="stacked" onHintSelect={onHintSelect} />
        )}
      </div>
      <div className="search-chat-panel-footer">
        {chatEngaged && <SearchChatHints layout="carousel" onHintSelect={onHintSelect} />}
        <SearchRefineBar
          variant="panel"
          onRefineSubmit={onRefineSubmit}
        />
      </div>
    </>
  );
}

export default function SearchChatPanel({
  searchQuery = '',
  messages = [],
  chatEngaged = false,
  onRefineSubmit,
  onHintSelect,
  width,
  onWidthChange,
  minWidth = SEARCH_CHAT_PANEL_MIN_WIDTH,
  maxWidth = SEARCH_CHAT_PANEL_MAX_WIDTH,
  embedded = false,
}) {
  const content = (
    <SearchChatPanelContent
      searchQuery={searchQuery}
      messages={messages}
      chatEngaged={chatEngaged}
      onRefineSubmit={onRefineSubmit}
      onHintSelect={onHintSelect}
    />
  );

  if (embedded) {
    return <div className="search-chat-panel-embedded">{content}</div>;
  }

  const panelStyle = {
    width,
    flexBasis: width,
  };

  return (
    <aside className="search-chat-panel" style={panelStyle} aria-label="Search chat">
      <SearchChatPanelResizeHandle
        width={width}
        onWidthChange={onWidthChange}
        minWidth={minWidth}
        maxWidth={maxWidth}
      />
      {content}
    </aside>
  );
}
