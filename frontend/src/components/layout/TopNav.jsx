import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ACTIVE_WORKOUT_KEY = 'gm_active_workout';

function formatDuration(startedAt) {
  if (!startedAt) return '0 min';
  const diff = Math.max(0, Date.now() - new Date(startedAt).getTime());
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hrs > 0) return `${hrs}h ${rem}m`;
  return `${mins} min`;
}

function TopNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [, setTick] = useState(0);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const readActive = () => {
      try {
        const raw = localStorage.getItem(ACTIVE_WORKOUT_KEY);
        setActiveWorkout(raw ? JSON.parse(raw) : null);
      } catch {
        setActiveWorkout(null);
      }
    };

    readActive();
    window.addEventListener('storage', readActive);

    const interval = setInterval(() => setTick((v) => v + 1), 15000);
    return () => {
      window.removeEventListener('storage', readActive);
      clearInterval(interval);
    };
  }, []);

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
          {activeWorkout?.startedAt && (
            <div className="hidden items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-xs text-blue-300 sm:flex">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-blue-400" />
              <span>
                Workout in Progress - {formatDuration(activeWorkout.startedAt)}
              </span>
            </div>
          )}

          <button
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
