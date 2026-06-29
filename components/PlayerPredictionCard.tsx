'use client';

import { User, Target, Footprints, AlertTriangle, Shield, Award } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

interface PlayerPredictionCardProps {
  prediction: {
    id: string;
    player_name: string;
    prediction_type: string;
    predicted_value: number;
    created_at: string;
    profiles?: {
      username: string;
      avatar_url?: string;
    };
  };
}

const TYPE_ICONS: Record<string, any> = {
  goals: Target,
  assists: Footprints,
  yellow_cards: AlertTriangle,
  red_card: Shield,
  motm: Award,
};

const TYPE_LABELS: Record<string, string> = {
  goals: 'Goals',
  assists: 'Assists',
  yellow_cards: 'Yellow Cards',
  red_card: 'Red Card',
  motm: 'Man of the Match',
};

export default function PlayerPredictionCard({ prediction }: PlayerPredictionCardProps) {
  const Icon = TYPE_ICONS[prediction.prediction_type] || Target;
  const label = TYPE_LABELS[prediction.prediction_type] || prediction.prediction_type;

  return (
    <div className="glass-strong rounded-xl p-4 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            {prediction.profiles?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold text-sm text-white">{prediction.profiles?.username || 'Anonymous'}</p>
            <p className="text-xs text-slate-500">{formatTimeAgo(prediction.created_at)}</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
          <Icon size={12} />
          {label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-slate-800/60 rounded-lg px-4 py-2 text-center">
          <p className="text-xs text-slate-500 mb-1">{prediction.player_name}</p>
          <span className="text-2xl font-black text-white">{prediction.predicted_value}</span>
          <p className="text-xs text-slate-500 mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}
