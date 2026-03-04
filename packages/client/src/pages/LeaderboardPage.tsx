import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  tier?: string;
  gamesPlayed: number;
  gamesWon: number;
  highestCapital: number;
  longestStreak: number;
  totalCapitalEarned: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'gamesWon' | 'highestCapital' | 'totalCapitalEarned'>('gamesWon');

  useEffect(() => {
    setLoading(true);
    api
      .get<{ leaderboard: LeaderboardEntry[] }>(`/api/players/leaderboard?sortBy=${sortBy}`)
      .then((data) => setEntries(data.leaderboard))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="gamesWon">Games Won</option>
          <option value="highestCapital">Highest Capital</option>
          <option value="totalCapitalEarned">Total Earned</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-500">No leaderboard data yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-700 text-gray-400">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3 text-right">Played</th>
                <th className="px-4 py-3 text-right">Won</th>
                <th className="px-4 py-3 text-right">Win Rate</th>
                <th className="px-4 py-3 text-right">Best Capital</th>
                <th className="px-4 py-3 text-right">Streak</th>
                <th className="px-4 py-3 text-right">Total Earned</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={`${e.displayName}-${i}`} className="border-b border-gray-800 transition hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-white">{e.displayName}</td>
                  <td className="px-4 py-3 text-right text-gray-300">{e.gamesPlayed}</td>
                  <td className="px-4 py-3 text-right text-emerald-400">{e.gamesWon}</td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {e.gamesPlayed > 0 ? `${((e.gamesWon / e.gamesPlayed) * 100).toFixed(0)}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-yellow-400">
                    ₹{e.highestCapital.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">{e.longestStreak}</td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    ₹{e.totalCapitalEarned.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
