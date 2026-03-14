import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const links = [
  { path: '/', label: 'Dashboard', icon: 'home' },
  { path: '/exercises', label: 'Exercises', icon: 'bolt' },
  { path: '/plans', label: 'Plans', icon: 'calendar' },
  { path: '/progress', label: 'Progress', icon: 'chart' },
  { path: '/history', label: 'History', icon: 'clock' },
  { path: '/settings/system', label: 'Settings', icon: 'cog', adminOnly: true }
];

function Icon({ name }) {
  const map = {
    home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1v-10.5Z" />,
    bolt: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m13 2-8 11h6l-1 9 9-12h-6l0-8Z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 19V5m8 14V9m8 10V3" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 7v5l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 3v3m8-3v3M4 9h16m-14 12h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />,
    cog: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.607 2.296.07 2.572-1.065Z M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
  };

  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {map[name]}
    </svg>
  );
}

function Sidebar() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const visibleLinks = links.filter((link) => !link.adminOnly || isAdmin);
  const pathname = location.pathname;

  const isLinkActive = (linkPath, isNavLinkActive) => {
    if (linkPath === '/progress') {
      return isNavLinkActive || pathname.startsWith('/edit-manual/');
    }
    return isNavLinkActive;
  };

  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-app-subtle bg-card p-6 md:block">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-app-muted">Gym Management</p>
          <h1 className="mt-2 text-2xl font-bold">Progress Suite</h1>
        </div>

        <nav className="space-y-2">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `nav-item ${isLinkActive(link.path, isActive) ? 'nav-item-active' : 'nav-item-idle'}`}
            >
              <Icon name={link.icon} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <nav
        className={`mobile-bottom-nav md:hidden ${
          visibleLinks.length <= 4 ? 'grid-cols-4' : visibleLinks.length === 5 ? 'grid-cols-5' : 'grid-cols-6'
        }`}
      >
        {visibleLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `mobile-nav-item ${isLinkActive(link.path, isActive) ? 'mobile-nav-item-active' : ''}`}
          >
            <Icon name={link.icon} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default Sidebar;
