import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Navbar Component
 * Main navigation menu for the application with user authentication
 */
function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const userMenuCloseTimerRef = useRef(null);

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/exercises', label: 'Exercises', icon: '💪' },
    { path: '/plans', label: 'Plans', icon: '📅' },
    { path: '/progress', label: 'Progress', icon: '📈' },
  ];

  // Add admin link if user is admin
  if (isAdmin) {
    navLinks.push({ path: '/settings/system', label: 'Admin', icon: '⚙️' });
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  const cancelUserMenuClose = () => {
    if (userMenuCloseTimerRef.current) {
      clearTimeout(userMenuCloseTimerRef.current);
      userMenuCloseTimerRef.current = null;
    }
  };

  const scheduleUserMenuClose = () => {
    cancelUserMenuClose();
    userMenuCloseTimerRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 150);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!userMenuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      cancelUserMenuClose();
    };
  }, []);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0" onClick={handleLinkClick}>
            <span className="text-2xl">🏋️</span>
            <span className="text-lg sm:text-xl font-bold text-gray-800">Gym Tracker</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors duration-200
                  ${
                    isActive(link.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            {/* User Menu - Desktop */}
            <div ref={userMenuRef} className="relative ml-3">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                onMouseEnter={cancelUserMenuClose}
                onMouseLeave={scheduleUserMenuClose}
                className={`
                  flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors duration-200
                  ${isUserMenuOpen ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}
                `}
                aria-label="User menu"
                aria-expanded={isUserMenuOpen}
              >
                <span className="text-sm font-medium">{user?.username}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200"
                  onMouseEnter={cancelUserMenuClose}
                  onMouseLeave={scheduleUserMenuClose}
                >
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded-md font-medium text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <span className="mr-2">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleLinkClick}
                className={`
                  block px-4 py-3 rounded-lg font-medium transition-colors duration-200
                  ${
                    isActive(link.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            {/* User Info & Logout - Mobile */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="px-4 py-2 text-sm text-gray-600">
                Logged in as <span className="font-medium text-gray-900">{user?.username}</span>
              </div>
              <button
                onClick={() => {
                  handleLinkClick();
                  handleLogout();
                }}
                className="w-full text-left px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <span className="mr-2">🚪</span>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
