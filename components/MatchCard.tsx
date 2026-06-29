'use client';

import { useRouter } from 'next/navigation';
import { MessageSquare, TrendingUp, MapPin } from 'lucide-react';

interface MatchCardProps {
  match: {
    id: string;
    home_team: string;
    away_team: string;
    home_short?: string;
    away_short?: string;
    home_logo?: string;
    away_logo?: string;
    match_time: string;
    league: string;
    status: string;
    home_score: number | null;
    away_score: number | null;
    display_clock?: string;
    period?: number;
    venue?: string;
    home_odds?: number | null;
    draw_odds?: number | null;
    away_odds?: number | null;
  };
}

export default function MatchCard({ match }: MatchCardProps) {
  const router = useRouter();
  const matchDate = new Date(match.match_time);
  const now = new Date();

  const isLive = match.status === 'live';
  const isPast = match.status === 'finished';
  const isToday = matchDate.toDateString() === now.toDateString();
  const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === matchDate.toDateString();

  const timeStr = matchDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const dateStr = matchDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const dayName = matchDate.toLocaleDateString('en-US', { weekday: 'short' });

  let timeUntilText = '';
  if (!isPast && !isLive) {
    const diff = matchDate.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) timeUntilText = `${days}d ${hours % 24}h`;
    else if (hours > 0) timeUntilText = `${hours}h`;
    else timeUntilText = 'Soon';
  }

  const hasScore = match.home_score !== null && match.away_score !== null;

  const getPeriodLabel = () => {
    if (match.period === 1) return '1st Half';
    if (match.period === 2) return '2nd Half';
    if (match.period === 3) return 'Extra Time';
    if (match.period === 4) return 'Penalties';
    return 'Live';
  };

  return (
    <div
      onClick={() => router.push(`/match/${match.id}`)}
      className="group glass-strong rounded-2xl p-5 cursor-pointer card-hover"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-semibold text-slate-500 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/30">
          {match.league}
        </span>
        {isLive ? (
          <div className="flex items-center gap-2">
            <span className="badge-live">
              <span className="w-2 h-2 bg-red-500 rounded-full live-dot" />
              LIVE
            </span>
          </div>
        ) : isPast ? (
          <span className="badge-finished">Finished</span>
        ) : isToday ? (
          <span className="badge-upcoming">TODAY {timeStr}</span>
        ) : isTomorrow ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
            TOMORROW {timeStr}
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            {dayName} {dateStr} • {timeStr}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-4">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center text-center">
          {match.home_logo ? (
            <div className="relative w-16 h-16 mb-3">
              <img
                src={match.home_logo}
                alt={match.home_team}
                className="w-full h-full object-contain drop-shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-400">${match.home_short || match.home_team.charAt(0)}</div>`;
                }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mb-3 text-xl font-bold text-slate-400">
              {match.home_short || match.home_team.charAt(0)}
            </div>
          )}
          <span className="font-bold text-sm leading-tight text-white">{match.home_team}</span>
          {match.home_short && <span className="text-xs text-slate-500 mt-1">{match.home_short}</span>}
        </div>

        {/* Score & Timer */}
        <div className="flex flex-col items-center min-w-[120px]">
          {hasScore ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-4">
                <span className={`text-4xl font-black ${isLive ? 'text-green-400' : 'text-white'}`}>
                  {match.home_score}
                </span>
                <span className="text-slate-600 text-xl font-light">—</span>
                <span className={`text-4xl font-black ${isLive ? 'text-green-400' : 'text-white'}`}>
                  {match.away_score}
                </span>
              </div>
              {isLive && match.display_clock && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot" />
                  {getPeriodLabel()} — {match.display_clock}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-slate-600">VS</span>
              {isLive && match.display_clock && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot" />
                  {getPeriodLabel()} — {match.display_clock}
                </div>
              )}
            </div>
          )}

          {match.home_odds && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-full">
              <TrendingUp size={12} />
              <span>1:{match.home_odds}</span>
              <span className="text-slate-600">|</span>
              <span>X:{match.draw_odds}</span>
              <span className="text-slate-600">|</span>
              <span>2:{match.away_odds}</span>
            </div>
          )}

          {timeUntilText && !hasScore && (
            <span className="mt-3 text-xs font-medium text-slate-500 bg-slate-800/40 px-3 py-1 rounded-full">
              {timeUntilText}
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center text-center">
          {match.away_logo ? (
            <div className="relative w-16 h-16 mb-3">
              <img
                src={match.away_logo}
                alt={match.away_team}
                className="w-full h-full object-contain drop-shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-400">${match.away_short || match.away_team.charAt(0)}</div>`;
                }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mb-3 text-xl font-bold text-slate-400">
              {match.away_short || match.away_team.charAt(0)}
            </div>
          )}
          <span className="font-bold text-sm leading-tight text-white">{match.away_team}</span>
          {match.away_short && <span className="text-xs text-slate-500 mt-1">{match.away_short}</span>}
        </div>
      </div>

      {/* Venue */}
      {match.venue && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={12} />
            {match.venue}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-slate-700/30 flex items-center justify-between">
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          <MessageSquare size={12} />
          {isLive ? 'Match in progress — Click to chat & predict!' : isPast ? 'Match ended — View predictions' : 'Click to predict & join chat'}
        </span>
        <span className="text-green-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          View →
        </span>
      </div>
    </div>
  );
}
