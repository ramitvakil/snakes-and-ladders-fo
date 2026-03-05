import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import HelpButton from './HelpButton';
import ThemeSwitcher from './ThemeSwitcher';

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const connectionStatus = useUIStore((s) => s.connectionStatus);

  const statusConfig: Record<string, { color: string; label: string }> = {
    connected: { color: 'bg-emerald-400', label: 'Online' },
    connecting: { color: 'bg-yellow-400 animate-pulse', label: 'Connecting' },
    reconnecting: { color: 'bg-yellow-400 animate-pulse', label: 'Reconnecting' },
    disconnected: { color: 'bg-gray-500', label: 'Offline' },
    error: { color: 'bg-red-500', label: 'Error' },
  };

  const status = statusConfig[connectionStatus] ?? { color: 'bg-gray-500', label: 'Offline' };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-700/30 bg-gray-900/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 group">
          <span className="text-lg font-black tracking-tight text-emerald-400 group-hover:text-emerald-300 transition-colors">
            S&amp;L
          </span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">F&amp;O</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connection */}
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${status.color}`} />
            <span className="text-[10px] text-gray-500 hidden sm:inline">{status.label}</span>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <NavLink to="/leaderboard">Leaderboard</NavLink>
            <NavLink to="/learn">Learn</NavLink>
          </div>

          <ThemeSwitcher />
          <HelpButton />

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NavLink to="/lobby">Lobby</NavLink>
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 rounded-lg bg-gray-800/60 px-2.5 py-1 text-xs font-semibold text-gray-300 transition hover:bg-gray-700/60"
                >
                  <span className="h-5 w-5 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-gray-900">
                    {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
                  </span>
                  {user?.displayName}
                </Link>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    logout();
                    navigate('/');
                    setMobileOpen(false);
                  }}
                  className="rounded-lg border border-gray-700/50 px-2.5 py-1 text-[11px] font-medium text-gray-500 transition hover:border-gray-600 hover:text-gray-300"
                >
                  Sign Out
                </motion.button>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/login"
                  className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/30"
                >
                  Sign In
                </Link>
              </motion.div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden rounded-lg border border-gray-700/50 px-2 py-1 text-[11px] text-gray-300"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-700/30 px-4 py-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <MobileNavLink to="/leaderboard" onSelect={() => setMobileOpen(false)}>Leaderboard</MobileNavLink>
            <MobileNavLink to="/learn" onSelect={() => setMobileOpen(false)}>Learn</MobileNavLink>
            {isAuthenticated && <MobileNavLink to="/lobby" onSelect={() => setMobileOpen(false)}>Lobby</MobileNavLink>}
            {isAuthenticated && <MobileNavLink to="/profile" onSelect={() => setMobileOpen(false)}>Profile</MobileNavLink>}
            {!isAuthenticated && <MobileNavLink to="/login" onSelect={() => setMobileOpen(false)}>Sign In</MobileNavLink>}
            {isAuthenticated && (
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                  setMobileOpen(false);
                }}
                className="rounded-lg border border-gray-700/50 px-3 py-2 text-left text-gray-300"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-[12px] font-medium text-gray-500 transition hover:text-gray-200"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children, onSelect }: { to: string; children: React.ReactNode; onSelect: () => void }) {
  return (
    <Link
      to={to}
      onClick={onSelect}
      className="rounded-lg border border-gray-700/50 px-3 py-2 text-gray-300"
    >
      {children}
    </Link>
  );
}
