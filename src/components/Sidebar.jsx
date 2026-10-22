import { NavLink } from 'react-router-dom';
import { ROUTE_DESIGN_SYSTEM, ROUTE_PROJECT_DETAILS, ROUTE_SEARCH } from '../constants/routes';
import { resolveThemedAsset, useThemeName } from '../utils/theme';

const LEFT_NAV_SEARCH_ICONS = {
  active: '/icons/LeftNav-Search-Active.svg?v=5',
  inactive: '/icons/LeftNav-Search-Inactive.svg?v=5',
};

const NAV_ITEMS = [
  {
    icon: '/nav-icons/Home.svg',
    activeIconLight: '/nav-icons/Home-active-lightmode.svg',
    title: 'Home',
    to: ROUTE_PROJECT_DETAILS,
  },
  { title: 'Search', to: ROUTE_SEARCH, isSearch: true },
  { icon: '/nav-icons/Calendar.svg', title: 'Calendar' },
  { icon: '/nav-icons/Playlists.svg', title: 'Playlists' },
  { icon: '/nav-icons/SoundEffects.svg', title: 'Sound Effects' },
];

function navItemIconSrc(item, theme, isActive) {
  if (isActive && theme === 'light' && item.activeIconLight) {
    return item.activeIconLight;
  }
  return resolveThemedAsset(item.icon, theme);
}

function NavSearchIcon({ theme }) {
  return (
    <>
      <img
        src={resolveThemedAsset(LEFT_NAV_SEARCH_ICONS.inactive, theme)}
        alt=""
        className="nav-item-search-icon nav-item-search-icon--inactive"
      />
      <img
        src={LEFT_NAV_SEARCH_ICONS.active}
        alt=""
        className="nav-item-search-icon nav-item-search-icon--active"
      />
    </>
  );
}

const SEARCH_RESULTS_VERSIONS = [1, 2];

function VersionSwitch({ value, onChange }) {
  const selectVersion = (version) => {
    if (version !== value) onChange?.(version);
  };

  const onKeyDown = (event) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const index = SEARCH_RESULTS_VERSIONS.indexOf(value);
    const nextIndex =
      event.key === 'ArrowDown'
        ? Math.min(index + 1, SEARCH_RESULTS_VERSIONS.length - 1)
        : Math.max(index - 1, 0);
    selectVersion(SEARCH_RESULTS_VERSIONS[nextIndex]);
    event.currentTarget.querySelectorAll('[role="radio"]')[nextIndex]?.focus();
  };

  return (
    <div className="version-switch" role="radiogroup" aria-labelledby="version-switch-label" onKeyDown={onKeyDown}>
      <span id="version-switch-label" className="version-switch__label">
        Version
      </span>
      <div className="version-switch__track">
        {SEARCH_RESULTS_VERSIONS.map((version) => {
          const selected = version === value;
          return (
            <button
              key={version}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              className={`version-switch__option${selected ? ' version-switch__option--selected' : ''}`}
              onClick={() => selectVersion(version)}
            >
              {version}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Sidebar({
  onHomeClick,
  searchResultsVersion = 1,
  onSearchResultsVersionChange,
  showVersionSwitch = true,
}) {
  const theme = useThemeName();

  return (
    <aside className="sidebar">
      <nav className="nav-icons" aria-label="Primary">
        {NAV_ITEMS.map((item) =>
          item.to ? (
            <NavLink
              key={item.title}
              to={item.to}
              end={item.to === ROUTE_PROJECT_DETAILS}
              className={({ isActive }) =>
                `nav-item${item.isSearch ? ' nav-item--search' : ''}${isActive ? ' nav-item--active' : ''}`
              }
              title={item.title}
              onClick={item.to === ROUTE_PROJECT_DETAILS ? onHomeClick : undefined}
            >
              {({ isActive }) =>
                item.isSearch ? (
                  <NavSearchIcon theme={theme} />
                ) : (
                  <img src={navItemIconSrc(item, theme, isActive)} alt="" />
                )
              }
            </NavLink>
          ) : (
            <a
              key={item.title}
              href="#"
              className="nav-item"
              title={item.title}
              onClick={(e) => e.preventDefault()}
            >
              <img src={resolveThemedAsset(item.icon, theme)} alt="" />
            </a>
          )
        )}
      </nav>
      <div className="sidebar-footer">
        {showVersionSwitch ? (
          <VersionSwitch value={searchResultsVersion} onChange={onSearchResultsVersionChange} />
        ) : null}
        <NavLink
          to={ROUTE_DESIGN_SYSTEM}
          className={({ isActive }) => `nav-item nav-item--design-system${isActive ? ' nav-item--active' : ''}`}
          title="Design System"
        >
          <img src="/icons/design-system.svg" alt="" />
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
