import { useEffect, useRef } from 'react';
import { findFolderById, PROJECTS_PANEL_FOLDER_TREE } from '../constants/projectsPanelTree';
import { SEARCH_CHAT_HINTS } from '../constants/searchChat';
import SearchRefineBar from './SearchRefineBar';

function getFolderNames(folderIds = []) {
  return folderIds
    .map((id) => findFolderById(PROJECTS_PANEL_FOLDER_TREE, id)?.name)
    .filter(Boolean);
}

export default function SearchChatPanel({
  messages = [],
  onRefineSubmit,
  onHintSelect,
  pendingRefineHint,
  onPendingRefineHintConsumed,
}) {
  const bodyRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return (
    <aside className="search-chat-panel" aria-label="Search chat">
      <div className="search-chat-panel-body" ref={bodyRef}>
        <div className="search-chat-thread">
          {messages.map((message) => {
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
      </div>
      <div className="search-chat-panel-footer">
        <div className="search-chat-hints-carousel" aria-label="Suggested questions">
          <div className="search-chat-hints-track">
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
        <SearchRefineBar
          variant="panel"
          onRefineSubmit={onRefineSubmit}
          pendingRefineHint={pendingRefineHint}
          onPendingRefineHintConsumed={onPendingRefineHintConsumed}
        />
      </div>
    </aside>
  );
}
