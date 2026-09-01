import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Plus, LayoutDashboard, LogOut, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PasswordConfirmModal from './PasswordConfirmModal';

const SCROLL_REVEAL_THRESHOLD = 80;

export default function Navbar() {
  const { driver, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [showSearchIcon, setShowSearchIcon] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Show the search icon once the person has scrolled down past the
  // threshold (i.e. they're deeper into the list), hide it again once
  // they're back near the top of the page.
  useEffect(() => {
    function handleScroll() {
      setShowSearchIcon(window.scrollY > SCROLL_REVEAL_THRESHOLD);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoutConfirmed = () => {
    setConfirmingLogout(false);
    logout();
    navigate('/home');
  };

  const openSearchBar = () => setShowSearchBar(true);

  const closeSearchBar = () => {
    setShowSearchBar(false);
    setSearchValue('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/home?q=${encodeURIComponent(searchValue)}`);
    setShowSearchBar(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/home" className="brand">
          <span className="brand-name">Hirego</span>
        </Link>

        <div className="navbar-right">
          {showSearchBar ? (
            <form className="navbar-search-bar" onSubmit={handleSearchSubmit}>
              <Search size={16} />
              <input
                type="text"
                autoFocus
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search trucks..."
              />
              <button type="button" className="navbar-search-close" onClick={closeSearchBar} aria-label="Close search">
                <X size={16} />
              </button>
            </form>
          ) : (
            <>
              {showSearchIcon ? (
                <button
                  type="button"
                  className="navbar-icon-btn navbar-search-icon"
                  onClick={openSearchBar}
                  aria-label="Search"
                >
                  <Search size={19} />
                </button>
              ) : null}

              {/* Mobile only - icon buttons */}
              <div className="navbar-icons navbar-icons-mobile">
                {driver ? (
                  <>
                    <Link to="/dashboard" className="navbar-icon-btn" aria-label="Dashboard">
                      <LayoutDashboard size={19} />
                    </Link>
                    <button
                      type="button"
                      className="navbar-icon-btn"
                      onClick={() => setConfirmingLogout(true)}
                      aria-label="Log out"
                    >
                      <LogOut size={19} />
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/driver/login" className="navbar-icon-btn" aria-label="Driver login">
                      <LogIn size={19} />
                    </Link>
                    <Link to="/driver/signup" className="navbar-icon-btn" aria-label="List your truck">
                      <Plus size={19} />
                    </Link>
                  </>
                )}
              </div>

              {/* Desktop/tablet only - original text buttons */}
              <nav className="nav-links nav-links-desktop">
                {driver ? (
                  <>
                    <Link to="/dashboard" className="btn btn-nav btn-nav-grey btn-sm">Dashboard</Link>
                    <button
                      type="button"
                      className="btn btn-nav btn-nav-white btn-sm"
                      onClick={() => setConfirmingLogout(true)}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/driver/login" className="btn btn-nav btn-nav-grey btn-sm">Driver Login</Link>
                    <Link to="/driver/signup" className="btn btn-nav btn-nav-white btn-sm">List Your Truck</Link>
                  </>
                )}
              </nav>
            </>
          )}
        </div>
      </div>

      <PasswordConfirmModal
        open={confirmingLogout}
        title="Confirm password"
        message="Enter your password to log out."
        confirmLabel="Log out"
        onClose={() => setConfirmingLogout(false)}
        onConfirmed={handleLogoutConfirmed}
      />
    </header>
  );
}