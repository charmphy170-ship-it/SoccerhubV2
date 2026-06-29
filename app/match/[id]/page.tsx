'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  ArrowLeft, Send, Trophy, MessageSquare, Loader2, MapPin,
  Target, User, Star, Calendar, TrendingUp, Shield, Footprints,
  AlertTriangle, Award, ChevronDown, ChevronUp
} from 'lucide-react';
import { getMatchById } from '@/lib/api-football';
import { getPredictions, getPlayerPredictions, getChatMessages, sendChatMessage, createPrediction, createPlayerPrediction, subscribeToChat } from '@/lib/supabase';
import PredictionCard from '@/components/PredictionCard';
import PlayerPredictionCard from '@/components/PlayerPredictionCard';
import { formatTimeAgo } from '@/lib/utils';

const PLAYER_PREDICTION_TYPES = [
  { key: 'goals', label: 'Goals', icon: Target, description: 'How many goals will they score?' },
  { key: 'assists', label: 'Assists', icon: Footprints, description: 'How many assists?' },
  { key: 'yellow_cards', label: 'Yellow Cards', icon: AlertTriangle, description: 'Will they get a yellow?' },
  { key: 'red_card', label: 'Red Card', icon: Shield, description: 'Will they get sent off?' },
  { key: 'motm', label: 'MOTM', icon: Award, description: 'Man of the Match?' },
];

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [playerPredictions, setPlayerPredictions] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'predictions' | 'players' | 'chat'>('predictions');

  // Match prediction form
  const [predHome, setPredHome] = useState('');
  const [predAway, setPredAway] = useState('');
  const [predReason, setPredReason] = useState('');

  // Player prediction form
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedPredType, setSelectedPredType] = useState('goals');
  const [predValue, setPredValue] = useState('');
  const [showPlayerForm, setShowPlayerForm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  useEffect(() => {
    const loadMatch = async () => {
      const [matchData, predsData, playerPredsData, chatData] = await Promise.all([
        getMatchById(matchId),
        getPredictions(matchId),
        getPlayerPredictions(matchId),
        getChatMessages(matchId),
      ]);
      setMatch(matchData);
      setPredictions(predsData);
      setPlayerPredictions(playerPredsData);
      setChatMessages(chatData);
      setLoading(false);
    };

    loadMatch();

    const subscription = subscribeToChat(matchId, (payload) => {
      setChatMessages((prev) => [...prev, payload.new]);
    });

    return () => {
      subscription.then((sub) => sub.unsubscribe());
    };
  }, [matchId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    await sendChatMessage({
      match_id: matchId,
      user_id: user.id,
      content: newMessage.trim(),
    });
    setNewMessage('');
  };

  const handleMatchPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !predHome || !predAway) return;

    setSubmitting(true);
    await createPrediction({
      match_id: matchId,
      user_id: user.id,
      home_score: parseInt(predHome),
      away_score: parseInt(predAway),
      reasoning: predReason || undefined,
    });

    const preds = await getPredictions(matchId);
    setPredictions(preds);
    setPredHome('');
    setPredAway('');
    setPredReason('');
    setSubmitting(false);
  };

  const handlePlayerPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPlayer || !predValue) return;

    setSubmitting(true);
    await createPlayerPrediction({
      match_id: matchId,
      user_id: user.id,
      player_id: selectedPlayer,
      player_name: selectedPlayer,
      prediction_type: selectedPredType,
      predicted_value: parseInt(predValue),
    });

    const preds = await getPlayerPredictions(matchId);
    setPlayerPredictions(preds);
    setSelectedPlayer('');
    setPredValue('');
    setShowPlayerForm(false);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-green-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-400">Loading match...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="text-8xl mb-4">🏟️</div>
          <h1 className="text-3xl font-bold mb-3">Match not found</h1>
          <p className="text-slate-400 mb-6">This match may have ended or doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/feed')}
            className="btn-primary"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  const isLive = match.status === 'live';
  const isPast = match.status === 'finished';
  const matchDate = new Date(match.time);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Match Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 pt-8 pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent" />

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          {/* Back Button */}
          <button
            onClick={() => router.push('/feed')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
          >
            <ArrowLeft size={18} />
            Back to Feed
          </button>

          {/* Match Info */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold text-slate-500 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/30">
              {match.league}
            </span>
            {isLive && (
              <span className="badge-live">
                <span className="w-2 h-2 bg-red-500 rounded-full live-dot" />
                LIVE {match.display_clock && `• ${match.display_clock}`}
              </span>
            )}
            {isPast && <span className="badge-finished">Finished</span>}
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 flex flex-col items-center text-center">
              {match.home_logo ? (
                <img src={match.home_logo} alt={match.home_team} className="w-24 h-24 object-contain mb-4 drop-shadow-2xl" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 text-3xl font-bold text-slate-400">
                  {match.home_short || match.home_team.charAt(0)}
                </div>
              )}
              <h2 className="text-2xl font-black">{match.home_team}</h2>
              <span className="text-sm text-slate-500 mt-1">Home</span>
            </div>

            <div className="flex flex-col items-center min-w-[160px]">
              {match.home_score !== null && match.away_score !== null ? (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-4">
                    <span className={`text-6xl font-black ${isLive ? 'text-green-400' : 'text-white'}`}>
                      {match.home_score}
                    </span>
                    <span className="text-slate-600 text-3xl font-light">—</span>
                    <span className={`text-6xl font-black ${isLive ? 'text-green-400' : 'text-white'}`}>
                      {match.away_score}
                    </span>
                  </div>
                  {isLive && match.display_clock && (
                    <div className="mt-3 flex items-center gap-2 text-lg font-bold text-red-400 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 animate-pulse">
                      <span className="w-3 h-3 bg-red-500 rounded-full live-dot" />
                      {match.period === 1 ? '1st Half' : match.period === 2 ? '2nd Half' : match.period === 3 ? 'Extra Time' : match.period === 4 ? 'Penalties' : 'Live'} — {match.display_clock}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-black text-slate-600">VS</span>
                  {isLive && match.display_clock && (
                    <div className="mt-3 flex items-center gap-2 text-lg font-bold text-red-400 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 animate-pulse">
                      <span className="w-3 h-3 bg-red-500 rounded-full live-dot" />
                      {match.period === 1 ? '1st Half' : match.period === 2 ? '2nd Half' : match.period === 3 ? 'Extra Time' : match.period === 4 ? 'Penalties' : 'Live'} — {match.display_clock}
                    </div>
                  )}
                </div>
              )}
              <p className="mt-4 text-sm text-slate-400">
                {matchDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-sm text-slate-500">
                {matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center text-center">
              {match.away_logo ? (
                <img src={match.away_logo} alt={match.away_team} className="w-24 h-24 object-contain mb-4 drop-shadow-2xl" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 text-3xl font-bold text-slate-400">
                  {match.away_short || match.away_team.charAt(0)}
                </div>
              )}
              <h2 className="text-2xl font-black">{match.away_team}</h2>
              <span className="text-sm text-slate-500 mt-1">Away</span>
            </div>
          </div>

          {match.venue && (
            <div className="mt-6 text-center">
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 bg-slate-800/40 px-4 py-2 rounded-full">
                <MapPin size={14} />
                {match.venue}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Match Prediction Form */}
        {!isPast && user && (
          <div className="glass-strong rounded-3xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target size={20} className="text-green-400" />
              Predict the Score
            </h3>
            <form onSubmit={handleMatchPrediction} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">{match.home_team}</label>
                  <input
                    type="number"
                    min="0"
                    value={predHome}
                    onChange={(e) => setPredHome(e.target.value)}
                    required
                    className="input-field text-center text-2xl font-black"
                    placeholder="0"
                  />
                </div>
                <span className="text-slate-500 font-bold text-2xl pt-5">—</span>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">{match.away_team}</label>
                  <input
                    type="number"
                    min="0"
                    value={predAway}
                    onChange={(e) => setPredAway(e.target.value)}
                    required
                    className="input-field text-center text-2xl font-black"
                    placeholder="0"
                  />
                </div>
              </div>
              <textarea
                value={predReason}
                onChange={(e) => setPredReason(e.target.value)}
                placeholder="Why do you think this will be the score? (optional)"
                className="input-field resize-none h-20"
              />
              <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2">
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Trophy size={18} />}
                Submit Prediction
              </button>
            </form>
          </div>
        )}

        {!user && !isPast && (
          <div className="glass-strong rounded-3xl p-6 mb-8 text-center">
            <p className="text-slate-400">
              <a href="/login" className="text-green-400 hover:text-green-300 font-semibold">Login</a>{' '}
              to make predictions and join the chat
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'predictions', label: 'Score Predictions', icon: Trophy, count: predictions.length },
            { key: 'players', label: 'Player Predictions', icon: User, count: playerPredictions.length },
            { key: 'chat', label: 'Live Chat', icon: MessageSquare, count: chatMessages.length },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-slate-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Score Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-4">
            {predictions.length === 0 ? (
              <div className="glass-strong rounded-3xl p-8 text-center">
                <Trophy size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="text-slate-500">No score predictions yet. Be the first!</p>
              </div>
            ) : (
              predictions.map((pred) => (
                <PredictionCard key={pred.id} prediction={pred} actualHome={match.home_score} actualAway={match.away_score} />
              ))
            )}
          </div>
        )}

        {/* Player Predictions Tab */}
        {activeTab === 'players' && (
          <div className="space-y-4">
            {/* Player Prediction Form */}
            {user && !isPast && (
              <div className="glass-strong rounded-3xl p-6 mb-6">
                <button
                  onClick={() => setShowPlayerForm(!showPlayerForm)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Star size={20} className="text-green-400" />
                    <span className="font-bold">Predict Player Performance</span>
                  </div>
                  {showPlayerForm ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {showPlayerForm && (
                  <form onSubmit={handlePlayerPrediction} className="mt-4 space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">Select Prediction Type</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {PLAYER_PREDICTION_TYPES.map((type) => {
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.key}
                              type="button"
                              onClick={() => setSelectedPredType(type.key)}
                              className={`p-3 rounded-xl text-left transition ${
                                selectedPredType === type.key
                                  ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                                  : 'bg-slate-800/40 border border-slate-700/30 text-slate-400 hover:text-white'
                              }`}
                            >
                              <Icon size={18} className="mb-1" />
                              <p className="text-sm font-semibold">{type.label}</p>
                              <p className="text-xs opacity-70">{type.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">Player Name</label>
                      <input
                        type="text"
                        value={selectedPlayer}
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        required
                        placeholder="e.g., Erling Haaland"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">
                        Predicted {PLAYER_PREDICTION_TYPES.find(t => t.key === selectedPredType)?.label}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={predValue}
                        onChange={(e) => setPredValue(e.target.value)}
                        required
                        placeholder="0"
                        className="input-field text-center text-xl font-black"
                      />
                    </div>

                    <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2">
                      {submitting ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} />}
                      Submit Player Prediction
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Player Predictions List */}
            {playerPredictions.length === 0 ? (
              <div className="glass-strong rounded-3xl p-8 text-center">
                <User size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="text-slate-500">No player predictions yet. Be the first to predict!</p>
              </div>
            ) : (
              playerPredictions.map((pred) => (
                <PlayerPredictionCard key={pred.id} prediction={pred} />
              ))
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="glass-strong rounded-3xl overflow-hidden">
            <div className="h-96 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={40} className="mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 animate-fade-in">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {msg.profiles?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{msg.profiles?.username || 'Anonymous'}</span>
                        <span className="text-xs text-slate-600">{formatTimeAgo(msg.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-300 break-words">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {user ? (
              <form onSubmit={handleSendMessage} className="border-t border-slate-700/40 p-4 flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 input-field"
                />
                <button type="submit" disabled={!newMessage.trim()} className="px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-500/30 text-white rounded-xl transition">
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <div className="border-t border-slate-700/40 p-4 text-center">
                <p className="text-sm text-slate-500">
                  <a href="/login" className="text-green-400 hover:text-green-300 font-semibold">Login</a>{' '}
                  to join the chat
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
