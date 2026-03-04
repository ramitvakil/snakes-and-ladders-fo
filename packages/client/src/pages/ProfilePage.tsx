import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import { SubscriptionTier } from '@game/shared';
import toast from 'react-hot-toast';

interface PlayerStats {
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    highestCapital: number;
    longestStreak: number;
    totalCapitalEarned: number;
  } | null;
  activeGames: number;
}

interface TierInfo {
  tier: SubscriptionTier;
  price: number;
  features: string[];
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateTier = useAuthStore((s) => s.updateTier);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [tiers, setTiers] = useState<TierInfo[]>([]);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    api.get<PlayerStats>('/api/players/me/stats').then(setStats).catch(() => {});
    api.get<Record<string, { features: string[]; maxPlayers: number }>>('/api/subscription/tiers')
      .then((d) => {
        const tierObj = (d as any).tiers ?? d;
        const tierArray = Object.entries(tierObj).map(([name, val]: [string, any]) => ({
          tier: name as SubscriptionTier,
          price: name === 'Apprentice' ? 0 : name === 'MarketWarrior' ? 299 : 999,
          features: Array.isArray(val.features)
            ? val.features
            : typeof val.features === 'object' && val.features !== null
              ? Object.entries(val.features)
                  .filter(([, v]) => v === true)
                  .map(([k]) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c: string) => c.toUpperCase()).trim())
              : [],
        }));
        setTiers(tierArray);
      })
      .catch(() => {});
  }, []);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    setUpgrading(true);
    try {
      await api.post('/api/subscription/upgrade', { tier });
      updateTier(tier);
      toast.success(`Upgraded to ${tier}!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upgrade failed');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Profile</h1>

      {/* User Info */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-emerald-400">{user?.displayName}</h2>
        <p className="text-sm text-gray-400">{user?.email}</p>
        <p className="mt-1 text-sm text-gray-500">
          Tier: <span className="capitalize text-yellow-400">{user?.tier}</span>
        </p>
      </div>

      {/* Stats */}
      {stats?.stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Games Played', value: stats.stats.gamesPlayed },
            { label: 'Games Won', value: stats.stats.gamesWon },
            { label: 'Highest Capital', value: `₹${stats.stats.highestCapital.toLocaleString('en-IN')}` },
            { label: 'Win Streak', value: stats.stats.longestStreak },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Subscription Tiers */}
      <div>
        <h2 className="mb-4 text-xl font-bold">Subscription Tiers</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {tiers.map((t) => {
            const isCurrent = user?.tier === t.tier;
            return (
              <div
                key={t.tier}
                className={`glass-card rounded-xl p-5 ${isCurrent ? 'ring-2 ring-emerald-500' : ''}`}
              >
                <h3 className="text-lg font-bold text-white">{t.tier}</h3>
                <p className="text-2xl font-extrabold text-emerald-400">
                  {t.price === 0 ? 'Free' : `₹${t.price}/mo`}
                </p>
                <ul className="mt-3 space-y-1">
                  {t.features.map((f) => (
                    <li key={f} className="text-sm text-gray-400">
                      • {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <p className="mt-4 text-center text-sm font-semibold text-emerald-400">Current Plan</p>
                ) : (
                  <button
                    onClick={() => handleUpgrade(t.tier)}
                    disabled={upgrading}
                    className="mt-4 w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
