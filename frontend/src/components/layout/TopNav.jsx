import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function TopNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    const handleOutsideClick = (event) => {
      if (!event.target.closest('[data-profile-menu]')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const initials = useMemo(() => {
    const name = user?.username || 'U';
    return name.slice(0, 1).toUpperCase();
  }, [user?.username]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-app-subtle bg-app/80 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-app-muted">Fitness Intelligence</p>
          <h2 className="text-lg font-bold text-app-primary sm:text-xl">Gym Tracker</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="topnav-profile-menu-button"
            type="button"
            data-profile-menu
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-app-subtle bg-surface text-sm font-semibold text-app-primary transition hover:border-blue-500/60"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Open profile menu"
          >
            {initials}
          </button>

          {menuOpen && (
            <div
              data-profile-menu
              className="absolute right-4 top-16 z-40 w-48 rounded-xl border border-app-subtle bg-card p-2 shadow-card sm:right-6 lg:right-10"
              role="menu"
            >
              <div className="rounded-lg px-3 py-2 text-xs text-app-muted">
                Signed in as <span className="text-app-primary">{user?.username}</span>
              </div>
              <button
                id="topnav-logout-button"
                type="button"
                onClick={handleLogout}
                className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-app-primary transition hover:bg-surface"
                role="menuitem"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopNav;
