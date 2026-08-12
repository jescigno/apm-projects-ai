import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  SEARCH_LIBRARIES,
  SEARCH_QUICK_FILTERS,
  SEARCH_RECENT_PROJECTS,
  SEARCH_TAG_CATEGORIES,
} from '../constants/searchFilters';
import { PROJECTS_PANEL_FOLDER_TREE } from '../constants/projectsPanelTree';
import { ICON_FOLDER } from '../constants/designSystem';
import { resolveThemedAsset, useThemeName } from '../utils/theme';

const ADD_MENU_SECTIONS = [
  { id: 'filters', label: 'Quick Filters', options: SEARCH_QUICK_FILTERS },
  { id: 'libraries', label: 'Libraries', options: SEARCH_LIBRARIES },
  { id: 'tags', label: 'Tags', options: SEARCH_TAG_CATEGORIES },
  { id: 'projects', label: 'Projects', options: null },
];

function flattenFolders(tree, depth = 0, acc = []) {
  for (const folder of tree) {
    acc.push({ id: folder.id, name: folder.name, depth });
    if (folder.children?.length) {
      flattenFolders(folder.children, depth + 1, acc);
    }
  }
  return acc;
}

const PROJECT_OPTIONS = flattenFolders(PROJECTS_PANEL_FOLDER_TREE);

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="search-refine-add-menu-chevron">
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="search-refine-add-menu-check">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SearchRefineAddMenu({
  open,
  anchorRef,
  menuRef,
  menuId,
  isPanel = false,
  selectedItems = [],
  onToggleItem,
  onClose,
}) {
  const themeName = useThemeName();
  const folderIcon = resolveThemedAsset(ICON_FOLDER, themeName);
  const submenuRef = useRef(null);
  const rowRefs = useRef({});
  const [menuRect, setMenuRect] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [submenuRect, setSubmenuRect] = useState(null);

  const isSelected = useCallback(
    (type, id) => selectedItems.some((item) => item.type === type && item.id === id),
    [selectedItems]
  );

  const updateMenuRect = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setMenuRect({
      bottom: window.innerHeight - rect.top + 8,
      left: rect.left,
      width: Math.max(isPanel ? 188 : 220, rect.width + (isPanel ? 100 : 140)),
    });
  }, [anchorRef, isPanel]);

  const updateSubmenuRect = useCallback(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const menuBox = menu.getBoundingClientRect();
    const submenuWidth = 220;
    let left = menuBox.right + 4;
    if (left + submenuWidth > window.innerWidth - 8) {
      left = Math.max(8, menuBox.left - submenuWidth - 4);
    }
    setSubmenuRect({
      top: menuBox.top,
      left,
      width: submenuWidth,
      height: menuBox.height,
    });
  }, [menuRef]);

  useEffect(() => {
    if (!open) {
      setActiveSection(null);
      setSubmenuRect(null);
      return undefined;
    }

    updateMenuRect();

    const handlePointerDown = (event) => {
      const target = event.target;
      if (
        anchorRef.current?.contains(target) ||
        menuRef.current?.contains(target) ||
        submenuRef.current?.contains(target)
      ) {
        return;
      }
      onClose?.();
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('resize', updateMenuRect);
    window.addEventListener('scroll', updateMenuRect, true);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updateMenuRect);
      window.removeEventListener('scroll', updateMenuRect, true);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, updateMenuRect, anchorRef, menuRef, onClose]);

  useEffect(() => {
    if (!activeSection) {
      setSubmenuRect(null);
      return;
    }
    updateSubmenuRect();
  }, [activeSection, menuRect, updateSubmenuRect]);

  if (!open || !menuRect) return null;

  const activeSectionData = ADD_MENU_SECTIONS.find((section) => section.id === activeSection);
  const projectOptions = activeSection === 'projects' ? PROJECT_OPTIONS : [];
  const listOptions =
    activeSection && activeSection !== 'projects'
      ? activeSectionData?.options ?? []
      : [];

  const menu = (
    <div
      ref={menuRef}
      id={menuId}
      className="search-refine-add-menu"
      role="menu"
      aria-label="Add filters, libraries, tags, or projects"
      style={{
        bottom: menuRect.bottom,
        left: menuRect.left,
        width: menuRect.width,
      }}
    >
      <div className="search-refine-add-menu-header">Recent Projects</div>
      <ul className="search-refine-add-menu-list search-refine-add-menu-list--recent">
        {SEARCH_RECENT_PROJECTS.map((project) => {
          const selected = isSelected('projects', project.id);
          return (
            <li key={project.id}>
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={selected}
                className={`search-refine-add-menu-item search-refine-add-menu-item--project${selected ? ' search-refine-add-menu-item--selected' : ''}`}
                onMouseEnter={() => setActiveSection(null)}
                onFocus={() => setActiveSection(null)}
                onClick={() => onToggleItem?.({
                  type: 'projects',
                  id: project.id,
                  label: project.label,
                })}
              >
                <img src={folderIcon} alt="" className="search-refine-add-submenu-icon" />
                <span className="search-refine-add-menu-item-label">{project.label}</span>
                {selected && <CheckIcon />}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="search-refine-add-menu-divider" role="separator" />
      <ul className="search-refine-add-menu-list">
        {ADD_MENU_SECTIONS.map((section) => (
          <li key={section.id}>
            <button
              ref={(node) => {
                rowRefs.current[section.id] = node;
              }}
              type="button"
              role="menuitem"
              className={`search-refine-add-menu-item${activeSection === section.id ? ' search-refine-add-menu-item--active' : ''}`}
              aria-haspopup="menu"
              aria-expanded={activeSection === section.id}
              onMouseEnter={() => setActiveSection(section.id)}
              onFocus={() => setActiveSection(section.id)}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="search-refine-add-menu-item-label">{section.label}</span>
              <ChevronRightIcon />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const submenu = activeSection && submenuRect && createPortal(
    <div
      ref={submenuRef}
      className="search-refine-add-submenu"
      role="menu"
      aria-label={activeSectionData?.label}
      style={{
        top: submenuRect.top,
        left: submenuRect.left,
        width: submenuRect.width,
        height: submenuRect.height,
      }}
    >
      <ul className="search-refine-add-submenu-list">
        {activeSection === 'projects'
          ? projectOptions.map((folder) => {
              const selected = isSelected('projects', folder.id);
              return (
                <li key={folder.id}>
                  <button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={selected}
                    className={`search-refine-add-submenu-item${selected ? ' search-refine-add-submenu-item--selected' : ''}`}
                    style={{ paddingLeft: `${12 + folder.depth * 14}px` }}
                    onClick={() => onToggleItem?.({
                      type: 'projects',
                      id: folder.id,
                      label: folder.name,
                    })}
                  >
                    <img src={folderIcon} alt="" className="search-refine-add-submenu-icon" />
                    <span className="search-refine-add-submenu-label">{folder.name}</span>
                    {selected && <CheckIcon />}
                  </button>
                </li>
              );
            })
          : listOptions.map((label) => {
              const selected = isSelected(activeSection, label);
              return (
                <li key={label}>
                  <button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={selected}
                    className={`search-refine-add-submenu-item${selected ? ' search-refine-add-submenu-item--selected' : ''}`}
                    onClick={() => onToggleItem?.({
                      type: activeSection,
                      id: label,
                      label,
                    })}
                  >
                    <span className="search-refine-add-submenu-label">{label}</span>
                    {selected && <CheckIcon />}
                  </button>
                </li>
              );
            })}
        {activeSection !== 'projects' && listOptions.length === 0 && (
          <li className="search-refine-add-submenu-empty">No options available</li>
        )}
      </ul>
    </div>,
    document.body
  );

  return createPortal(
    <>
      {menu}
      {submenu}
    </>,
    document.body
  );
}
