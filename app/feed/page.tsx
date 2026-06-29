'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Trophy, RefreshCw, Calendar, Flame, Clock, Filter, Zap, TrendingUp } from 'lucide-react';
import MatchCard from '@/components/MatchCard';
import { getAllMatches } from '@/lib/api-football';

export default function FeedPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [filter, setFilter] = useState('today');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [counts, setCounts] = useState({ today: 0, tomorrow: 0, live: 0, upcoming: 0 });
  const [selectedLeague, setSelectedLeague] = useState('all');
  const router = useRouter();
  const supabase = createClientComponentClient();

  const now = new Date();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllMatches();
      setMatches(all);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    let result = matches;

    if (selectedLeague !== 'all') {
      result = result.filter((m) => m.league === selectedLeague);
    }

    if (filter === 'today') {
      result = result.filter((m) => {
        const d = new Date(m.match_time);
        return d >= today && d < tomorrow;
      });
    } else if (filter === 'tomorrow') {
      result = result.filter((m) => {
        const d = new Date(m.match_time);
        return d >= tomorrow && d < dayAfter;
      });
    } else if (filter === 'live') {
      result = result.filter((m) => m.status === 'live');
    } else if (filter === 'upcoming') {
      result = result.filter((m) => {
        const d = new Date(m.match_time);
        return m.status === 'upcoming' && d >= today;
      });
    }

    setFiltered(result);

    setCounts({
      today: matches.filter((m) => {
        const d = new Date(m.match_time);
        return d >= today && d < tomorrow;
      }).length,
      tomorrow: matches.filter((m) => {
        const d = new Date(m.match_time);
        return d >= tomorrow && d < dayAfter;
      }).length,
      live: matches.filter((m) => m.status === 'live').length,
      upcoming: matches.filter((m) => m.status === 'upcoming').length,
    });
  }, [matches, filter, selectedLeague]);

  const tabs = [
    { key: 'today', label: 'Today', icon: Calendar, count: counts.today },
    { key: 'tomorrow', label: 'Tomorrow', icon: Clock, count: counts.tomorrow },
    { key: 'upcoming', label: 'Upcoming', icon: Filter, count: counts.upcoming },
    { key: 'live', label: 'Live', icon: Flame, count: counts.live },
    { key: 'all', label: 'All', icon: Trophy, count: matches.length },
  ];

  const leagues = ['all', ...Array.from(new Set(matches.map((m) => m.league)))];

  const getFilterLabel = () => {
    if (filter === 'today') return 'today';
    if (filter === 'tomorrow') return 'tomorrow';
    if (filter === 'live') return 'currently live';
    if (filter === 'upcoming') return 'upcoming';
    return '';
  };

  const getEmptyMessage = () => {
    if (filter === 'today') return 'No matches scheduled for today. Check other tabs!';
    if (filter === 'tomorrow') return 'No matches scheduled for tomorrow.';
    if (filter === 'upcoming') return 'No upcoming matches found.';
    if (filter === 'live') return 'No matches are currently live.';
    return 'No matches found. Try refreshing!';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden pt-12 pb-16">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 animate-float">
                <span className="text-4xl">⚽</span>
              </div>
              <div>
                <h1 className="text-5xl font-black text-gradient tracking-tight">SoccerHub</h1>
                <p className="text-slate-400 text-sm mt-1">Live Scores • Predictions • Community</p>
              </div>
            </div>

            <p className="text-slate-400 text-lg">
              {now.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              {lastUpdated && (
                <span className="text-slate-500 ml-2 text-sm">• Updated {lastUpdated}</span>
              )}
            </p>

            {!user && (
              <button
                onClick={() => router.push('/login')}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-full text-sm font-bold transition shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-105"
              >
                Login to Predict & Chat
              </button>
            )}
          </div>

          <div className="flex justify-center gap-4 mb-8">
            {[
              { icon: Zap, value: counts.live > 0 ? `${counts.live} Live` : 'No Live', label: 'Matches', color: counts.live > 0 ? 'text-red-400' : 'text-slate-500' },
              { icon: Calendar, value: counts.today.toString(), label: 'Today', color: 'text-green-400' },
              { icon: TrendingUp, value: matches.length.toString(), label: 'Total', color: 'text-blue-400' },
            ].map((stat, i) => (
              <div key={i} className="glass-strong rounded-2xl px-6 py-3 text-center">
                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    filter === tab.key
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 scale-105'
                      : 'glass text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${filter === tab.key ? 'bg-white/20' : 'bg-slate-600'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {leagues.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {leagues.map((league) => (
                <button
                  key={league}
                  onClick={() => setSelectedLeague(league)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedLeague === league
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'glass text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {league === 'all' ? 'All Leagues' : league}
                </button>
              ))}
            </div>
          )}

          <div className="text-center mb-8">
            <button
              onClick={fetchMatches}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-xl text-sm transition disabled:opacity-50 hover:bg-slate-800/60"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Loading matches...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-12">
        {loading && filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-green-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-slate-400 text-lg">Loading matches from ESPN...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 glass-strong rounded-3xl">
            <div className="text-7xl mb-6">🏟️</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No matches {getFilterLabel()}
            </h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              {getEmptyMessage()}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-6 py-2.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full hover:bg-green-500/20 transition font-medium"
              >
                Show All Matches
              </button>
            )}
          </div>
        ) : (
          <>
            {filter === 'today' && counts.today > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl text-center">
                <span className="text-green-400 font-bold text-lg">
                  🏆 {counts.today} match{counts.today !== 1 ? 'es' : ''} today!
                </span>
              </div>
            )}
            <div className="grid gap-4">
              {filtered.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
