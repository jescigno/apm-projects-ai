import { useEffect, useRef, useState } from 'react';
import { SEARCH_QUICK_FILTERS, SEARCH_TAG_CATEGORIES } from '../constants/searchFilters';
import { SearchChatPanelResizeHandle } from './SearchChatPanel';

export const SEARCH_FILTERS_PANEL_DEFAULT_WIDTH = 164;
export const SEARCH_FILTERS_PANEL_MIN_WIDTH = 164;
export const SEARCH_FILTERS_PANEL_MAX_WIDTH = 480;

const FILTER_SECTION_ICONS = {
  sessions: '/icons/history.svg',
  quickFilters: '/icons/filters_quickfilters.svg',
  libraries: '/icons/filters_library.svg',
  tags: '/icons/filters_tags.svg',
};

function FilterSectionIcon({ src, className = '' }) {
  return (
    <img
      src={src}
      alt=""
      className={`search-filters-section-icon${className ? ` ${className}` : ''}`}
      width={22}
      height={23}
      draggable={false}
      aria-hidden
    />
  );
}

function ChevronUpIcon() {
  return (
    <svg className="search-filters-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="search-filters-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchSessionList({ sessions = [], activeSessionId = null, onSessionSelect }) {
  if (sessions.length === 0) {
    return <p className="search-filters-session-empty">No conversations yet</p>;
  }

  return (
    <ul className="search-filters-list" aria-label="Chat history">
      {sessions.map((session) => {
        const selected = session.id === activeSessionId;
        return (
          <li key={session.id}>
            <button
              type="button"
              className={`search-filters-list-item search-filters-session${selected ? ' search-filters-list-item--active' : ''}`}
              aria-current={selected ? 'true' : undefined}
              onClick={() => onSessionSelect?.(session)}
            >
              <span className="search-filters-session-title">{session.title}</span>
              {session.timeLabel && <span className="search-filters-session-time">{session.timeLabel}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="search-filters-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SearchFiltersPanel({
  embedded = false,
  quickFilters = SEARCH_QUICK_FILTERS,
  defaultSectionsOpen = true,
  sessions = null,
  sessionsOpenByDefault = false,
  exclusiveSections = false,
  activeSessionId = null,
  onSessionSelect,
  width,
  onWidthChange,
  minWidth = SEARCH_FILTERS_PANEL_MIN_WIDTH,
  maxWidth = SEARCH_FILTERS_PANEL_MAX_WIDTH,
}) {
  const [openSections, setOpenSections] = useState(() => {
    const initial = new Set();
    if (sessionsOpenByDefault) initial.add('sessions');
    if (defaultSectionsOpen) {
      initial.add('quickFilters');
      initial.add('tags');
    }
    return initial;
  });
  const [activeQuickFilters, setActiveQuickFilters] = useState(() => new Set());
  const bodyRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return undefined;

    let scrollEndTimer;
    const onScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => setIsScrolling(false), 800);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      clearTimeout(scrollEndTimer);
    };
  }, []);

  const toggleSection = (id) => {
    setOpenSections((current) => {
      const isOpen = current.has(id);
      if (exclusiveSections) return isOpen ? new Set() : new Set([id]);
      const next = new Set(current);
      if (isOpen) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sessionsOpen = openSections.has('sessions');
  const quickFiltersOpen = openSections.has('quickFilters');
  const tagsOpen = openSections.has('tags');

  const toggleQuickFilter = (label) => {
    setActiveQuickFilters((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const body = (
    <div
      ref={bodyRef}
      className={`search-filters-panel-body${isScrolling ? ' search-filters-panel-body--scrolling' : ''}`}
    >
        {sessions && (
          <section className="search-filters-group">
            <button
              type="button"
              className="search-filters-group-header"
              aria-expanded={sessionsOpen}
              onClick={() => toggleSection('sessions')}
            >
              <span className="search-filters-group-header-main">
                <FilterSectionIcon src={FILTER_SECTION_ICONS.sessions} className="search-filters-section-icon--history" />
                <span className="search-filters-group-title">Sessions</span>
              </span>
              {sessionsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
            {sessionsOpen && (
              <SearchSessionList
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSessionSelect={onSessionSelect}
              />
            )}
          </section>
        )}

        <section className="search-filters-group">
          <button
            type="button"
            className="search-filters-group-header"
            aria-expanded={quickFiltersOpen}
            onClick={() => toggleSection('quickFilters')}
          >
            <span className="search-filters-group-header-main">
              <FilterSectionIcon src={FILTER_SECTION_ICONS.quickFilters} />
              <span className="search-filters-group-title">Quick Filters</span>
            </span>
            {quickFiltersOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
          {quickFiltersOpen && (
            <ul className="search-filters-list">
              {quickFilters.map((label) => {
                const active = activeQuickFilters.has(label);
                return (
                  <li key={label}>
                    <button
                      type="button"
                      className={`search-filters-list-item${active ? ' search-filters-list-item--active' : ''}`}
                      aria-pressed={active}
                      onClick={() => toggleQuickFilter(label)}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="search-filters-group search-filters-group--nav">
          <button type="button" className="search-filters-group-header search-filters-group-header--nav">
            <span className="search-filters-group-header-main">
              <FilterSectionIcon src={FILTER_SECTION_ICONS.libraries} />
              <span className="search-filters-group-title">Libraries</span>
            </span>
            <ChevronRightIcon />
          </button>
        </section>

        <section className="search-filters-group">
          <button
            type="button"
            className="search-filters-group-header"
            aria-expanded={tagsOpen}
            onClick={() => toggleSection('tags')}
          >
            <span className="search-filters-group-header-main">
              <FilterSectionIcon src={FILTER_SECTION_ICONS.tags} />
              <span className="search-filters-group-title">Tags</span>
            </span>
            {tagsOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </button>
          {tagsOpen && (
            <ul className="search-filters-list">
              {SEARCH_TAG_CATEGORIES.map((label) => (
                <li key={label}>
                  <button type="button" className="search-filters-list-item">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
  );

  if (embedded) {
    return body;
  }

  return (
    <aside
      className="search-filters-panel"
      aria-label="Search filters"
      style={width ? { width, flexBasis: width } : undefined}
    >
      {onWidthChange ? (
        <SearchChatPanelResizeHandle
          width={width}
          onWidthChange={onWidthChange}
          minWidth={minWidth}
          maxWidth={maxWidth}
          label="Resize filters panel"
        />
      ) : null}
      {body}
    </aside>
  );
}
