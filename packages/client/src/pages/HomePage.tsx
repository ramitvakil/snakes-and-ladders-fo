import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex flex-col items-center justify-center gap-12 py-16">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500 bg-clip-text text-transparent">
            Snakes &amp; Ladders
          </span>
        </h1>
        <p className="mt-2 text-xl text-gray-400">F&amp;O Market Edition</p>
        <p className="mx-auto mt-4 max-w-xl text-gray-500">
          A roguelite board game where your market intuition matters. Navigate 100 tiles of
          bull runs, fat-finger errors, and VIX storms. Build conviction, manage greeks, and
          race to ₹2,00,000 capital.
        </p>
      </div>

      {/* CTA */}
      <div className="flex gap-4">
        {isAuthenticated ? (
          <>
            <Link
              to="/lobby"
              className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500"
            >
              Play Now
            </Link>
            <Link
              to="/leaderboard"
              className="rounded-lg border border-gray-600 px-6 py-3 font-semibold text-gray-300 transition hover:bg-gray-800"
            >
              Leaderboard
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/register"
              className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-gray-600 px-6 py-3 font-semibold text-gray-300 transition hover:bg-gray-800"
            >
              Sign In
            </Link>
          </>
        )}
      </div>

      {isAuthenticated && user && (
        <p className="text-sm text-gray-500">
          Welcome back, <span className="text-emerald-400">{user.displayName}</span> —{' '}
          <span className="capitalize">{user.tier}</span> tier
        </p>
      )}

      {/* Features */}
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {[
          { title: '100-Tile Board', desc: 'Snakes, ladders, event tiles, and market warps with real F&O flavor.' },
          { title: 'VIX Engine', desc: 'Real-time volatility simulation using an Ornstein-Uhlenbeck mean-reverting model.' },
          { title: 'Greek Modifiers', desc: 'Theta decay, gamma acceleration, and vega amplification shape every turn.' },
        ].map((f) => (
          <div key={f.title} className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-bold text-emerald-400">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
