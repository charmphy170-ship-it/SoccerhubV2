'use client';

import { Trophy, ThumbsUp, MessageCircle } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

interface PredictionCardProps {
  prediction: {
    id: string;
    home_score: number;
    away_score: number;
    reasoning?: string;
    created_at: string;
    profiles?: {
      username: string;
      avatar_url?: string;
    };
  };
  actualHome?: number | null;
  actualAway?: number | null;
}

export default function PredictionCard({ prediction, actualHome, actualAway }: PredictionCardProps) {
  const homeActual = actualHome ?? null;
  const awayActual = actualAway ?? null;

  const isCorrect =
    homeActual !== null &&
    awayActual !== null &&
    prediction.home_score === homeActual &&
    prediction.away_score === awayActual;

  const isClose =
    homeActual !== null &&
    awayActual !== null &&
    !isCorrect &&
    Math.abs(prediction.home_score - homeActual) <= 1 &&
    Math.abs(prediction.away_score - awayActual) <= 1;

  return (
    <div className="glass-strong rounded-xl p-4 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            {prediction.profiles?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold text-sm text-white">
              {prediction.profiles?.username || 'Anonymous'}
            </p>
            <p className="text-xs text-slate-500">{formatTimeAgo(prediction.created_at)}</p>
          </div>
        </div>
        {isCorrect && (
          <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">
            <Trophy size={12} />
            Exact!
          </span>
        )}
        {isClose && (
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
            Close!
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="bg-slate-800/60 rounded-lg px-4 py-2 text-center">
          <span className="text-2xl font-black text-white">
            {prediction.home_score} - {prediction.away_score}
          </span>
        </div>
        {prediction.reasoning && (
          <p className="text-sm text-slate-400 flex-1">{prediction.reasoning}</p>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <button className="flex items-center gap-1 hover:text-green-400 transition">
          <ThumbsUp size={14} />
          Like
        </button>
        <button className="flex items-center gap-1 hover:text-green-400 transition">
          <MessageCircle size={14} />
          Reply
        </button>
      </div>
    </div>
  );
}
