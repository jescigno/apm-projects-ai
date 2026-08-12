import { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SearchRefineAddMenu from './SearchRefineAddMenu';
import { ICON_FOLDER } from '../constants/designSystem';
import { resolveThemedAsset, useThemeName } from '../utils/theme';

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
}) {
  const isPanel = variant === 'panel';
  const placeholder = isPanel ? 'Ask a question...' : 'Refine your search';
  const themeName = useThemeName();
  const folderIcon = resolveThemedAsset(ICON_FOLDER, themeName);
  const menuId = useId();
  const barRef = useRef(null);
  const localInputRef = useRef(null);
  const addBtnRef = useRef(null);
  const addMenuRef = useRef(null);
  const resolvedInputRef = inputRef ?? localInputRef;

  const [refineQuery, setRefineQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const toggleSelectedItem = ({ type, id, label }) => {
    setSelectedItems((prev) => {
      const exists = prev.some((item) => item.type === type && item.id === id);
      if (exists) {
        return prev.filter((item) => !(item.type === type && item.id === id));
      }
      return [...prev, { type, id, label }];
    });
  };

  const removeSelectedItem = (type, id) => {
    setSelectedItems((prev) => prev.filter((item) => !(item.type === type && item.id === id)));
  };

  const handleSubmit = () => {
    const trimmed = refineQuery.trim();
    if (!trimmed && selectedItems.length === 0) return;

    const folderIds = selectedItems
      .filter((item) => item.type === 'projects')
      .map((item) => item.id);

    onRefineSubmit?.({
      refineQuery: trimmed,
      folderIds,
      selectedItems,
    });
    setRefineQuery('');
    setSelectedItems([]);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    handleSubmit();
  };

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
            {selectedItems.length > 0 && (
              <div className="search-refine-bar-folder-tags" aria-label="Selected filters and projects">
                {selectedItems.map((item) => (
                  <span key={`${item.type}-${item.id}`} className="search-refine-bar-folder-tag">
                    {item.type === 'projects' && (
                      <img src={folderIcon} alt="" className="search-refine-bar-folder-tag-icon" />
                    )}
                    <span className="search-refine-bar-folder-tag-label">{item.label}</span>
                    <button
                      type="button"
                      className="search-refine-bar-folder-tag-remove"
                      aria-label={`Remove ${item.label}`}
                      onClick={() => removeSelectedItem(item.type, item.id)}
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
            ref={addBtnRef}
            type="button"
            className={`search-refine-bar-action-btn search-refine-bar-add-btn${addMenuOpen ? ' search-refine-bar-action-btn--active' : ''}`}
            aria-label="Add filters, libraries, tags, or projects"
            aria-expanded={addMenuOpen}
            aria-haspopup="menu"
            aria-controls={addMenuOpen ? menuId : undefined}
            onClick={() => setAddMenuOpen((open) => !open)}
          >
            <PlusIcon />
          </button>
          <button
            type="submit"
            className="search-refine-bar-submit-btn"
            aria-label="Submit refined search"
            disabled={!refineQuery.trim() && selectedItems.length === 0}
          >
            <EnterIcon />
          </button>
        </form>
      </div>

      <SearchRefineAddMenu
        open={addMenuOpen}
        anchorRef={addBtnRef}
        menuRef={addMenuRef}
        menuId={menuId}
        isPanel={isPanel}
        selectedItems={selectedItems}
        onToggleItem={toggleSelectedItem}
        onClose={() => setAddMenuOpen(false)}
      />
    </>
  );

  if (isPanel) {
    return content;
  }

  return createPortal(content, document.body);
}
