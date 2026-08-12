import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PROJECTS_PANEL_FOLDER_TREE } from '../constants/projectsPanelTree';
import { ICON_FOLDER } from '../constants/designSystem';
import { resolveThemedAsset, useThemeName } from '../utils/theme';

function flattenFolders(tree, depth = 0, acc = []) {
  for (const folder of tree) {
    acc.push({ id: folder.id, name: folder.name, depth });
    if (folder.children?.length) {
      flattenFolders(folder.children, depth + 1, acc);
    }
  }
  return acc;
}

const FOLDER_OPTIONS = flattenFolders(PROJECTS_PANEL_FOLDER_TREE);

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="search-refine-bar-action-icon">
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EnterIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="search-refine-bar-submit-icon">
      <path
        d="M5 10h8M11 6l4 4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SearchRefineBar({
  variant = 'floating',
  onRefineSubmit,
  inputRef,
  pendingRefineHint,
  onPendingRefineHintConsumed,
}) {
  const isPanel = variant === 'panel';
  const placeholder = isPanel ? 'Ask a question...' : 'Refine your search';
  const themeName = useThemeName();
  const folderIcon = resolveThemedAsset(ICON_FOLDER, themeName);
  const listboxId = useId();
  const barRef = useRef(null);
  const localInputRef = useRef(null);
  const folderBtnRef = useRef(null);
  const folderMenuRef = useRef(null);
  const resolvedInputRef = inputRef ?? localInputRef;

  const [refineQuery, setRefineQuery] = useState('');
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [folderMenuRect, setFolderMenuRect] = useState(null);

  const updateFolderMenuRect = useCallback(() => {
    const anchor = folderBtnRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setFolderMenuRect({
      bottom: window.innerHeight - rect.top + 8,
      left: rect.left,
      width: Math.max(isPanel ? 200 : 240, rect.width + (isPanel ? 120 : 180)),
    });
  }, [isPanel]);

  useEffect(() => {
    if (!folderPickerOpen) return undefined;

    updateFolderMenuRect();

    const handlePointerDown = (event) => {
      const target = event.target;
      if (
        folderBtnRef.current?.contains(target) ||
        folderMenuRef.current?.contains(target)
      ) {
        return;
      }
      setFolderPickerOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setFolderPickerOpen(false);
      }
    };

    window.addEventListener('resize', updateFolderMenuRect);
    window.addEventListener('scroll', updateFolderMenuRect, true);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updateFolderMenuRect);
      window.removeEventListener('scroll', updateFolderMenuRect, true);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [folderPickerOpen, updateFolderMenuRect]);

  useEffect(() => {
    if (!pendingRefineHint) return;
    setRefineQuery(pendingRefineHint);
    resolvedInputRef?.current?.focus();
    onPendingRefineHintConsumed?.();
  }, [pendingRefineHint, resolvedInputRef, onPendingRefineHintConsumed]);

  const toggleFolder = (folderId) => {
    setSelectedFolderIds((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );
  };

  const handleSubmit = () => {
    const trimmed = refineQuery.trim();
    if (!trimmed && selectedFolderIds.length === 0) return;
    onRefineSubmit?.({
      refineQuery: trimmed,
      folderIds: selectedFolderIds,
    });
    setRefineQuery('');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    handleSubmit();
  };

  const selectedFolders = FOLDER_OPTIONS.filter((folder) => selectedFolderIds.includes(folder.id));

  const content = (
    <>
      <div
        className={isPanel ? 'search-refine-compose search-refine-compose--panel' : 'search-refine-bar'}
        ref={barRef}
      >
        <form
          className={`search-refine-bar-form${isPanel ? ' search-refine-bar-form--panel' : ''}`}
          onSubmit={handleFormSubmit}
        >
          <div className="search-refine-bar-input-wrap">
            {selectedFolders.length > 0 && (
              <div className="search-refine-bar-folder-tags" aria-label="Selected project folders">
                {selectedFolders.map((folder) => (
                  <span key={folder.id} className="search-refine-bar-folder-tag">
                    <img src={folderIcon} alt="" className="search-refine-bar-folder-tag-icon" />
                    <span className="search-refine-bar-folder-tag-label">{folder.name}</span>
                    <button
                      type="button"
                      className="search-refine-bar-folder-tag-remove"
                      aria-label={`Remove ${folder.name}`}
                      onClick={() => toggleFolder(folder.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              ref={resolvedInputRef}
              type="text"
              className="search-refine-bar-input"
              value={refineQuery}
              onChange={(event) => setRefineQuery(event.target.value)}
              placeholder={placeholder}
              aria-label={placeholder}
            />
          </div>
          <button
            ref={folderBtnRef}
            type="button"
            className={`search-refine-bar-action-btn search-refine-bar-folder-btn${folderPickerOpen ? ' search-refine-bar-action-btn--active' : ''}`}
            aria-label="Add project folders"
            aria-expanded={folderPickerOpen}
            aria-haspopup="listbox"
            aria-controls={folderPickerOpen ? listboxId : undefined}
            onClick={() => setFolderPickerOpen((open) => !open)}
          >
            <PlusIcon />
          </button>
          <button
            type="submit"
            className="search-refine-bar-submit-btn"
            aria-label="Submit refined search"
            disabled={!refineQuery.trim() && selectedFolderIds.length === 0}
          >
            <EnterIcon />
          </button>
        </form>
      </div>

      {folderPickerOpen && folderMenuRect && createPortal(
        <div
          ref={folderMenuRef}
          id={listboxId}
          className="search-refine-bar-folder-menu"
          role="listbox"
          aria-label="Project folders"
          aria-multiselectable="true"
          style={{
            bottom: folderMenuRect.bottom,
            left: folderMenuRect.left,
            width: folderMenuRect.width,
          }}
        >
          <div className="search-refine-bar-folder-menu-header">Add project folders</div>
          <ul className="search-refine-bar-folder-menu-list">
            {FOLDER_OPTIONS.map((folder) => {
              const selected = selectedFolderIds.includes(folder.id);
              return (
                <li key={folder.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`search-refine-bar-folder-menu-item${selected ? ' search-refine-bar-folder-menu-item--selected' : ''}`}
                    style={{ paddingLeft: `${12 + folder.depth * 16}px` }}
                    onClick={() => toggleFolder(folder.id)}
                  >
                    <img src={folderIcon} alt="" className="search-refine-bar-folder-menu-icon" />
                    <span className="search-refine-bar-folder-menu-label">{folder.name}</span>
                    {selected && (
                      <svg viewBox="0 0 16 16" fill="none" aria-hidden className="search-refine-bar-folder-menu-check">
                        <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>,
        document.body
      )}
    </>
  );

  if (isPanel) {
    return content;
  }

  return createPortal(content, document.body);
}
