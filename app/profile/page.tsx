'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Trophy, TrendingUp, Activity, Calendar, Loader2, Camera, Heart, Globe, Edit3, Check, X, Shield, Star } from 'lucide-react';
import { STOCK_AVATARS, CLUBS, COUNTRIES } from '@/types';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'settings'>('overview');

  // Edit form states
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editClub, setEditClub] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setEditUsername(profileData.username || '');
        setEditBio(profileData.bio || '');
        setEditAvatar(profileData.avatar_url || '');
        setEditClub(profileData.favorite_club || '');
        setEditCountry(profileData.favorite_country || '');
      }

      const { data: preds } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setPredictions(preds || []);

      setLoading(false);
    };

    loadProfile();
  }, [supabase, router]);

  const handleSave = async () => {
    setSaving(true);
    let avatarUrl = editAvatar;

    // Upload custom image if selected
    if (uploadedFile) {
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, uploadedFile);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        avatarUrl = publicUrl;
      }
    }

    const clubData = CLUBS.find(c => c.name === editClub);
    const countryData = COUNTRIES.find(c => c.name === editCountry);

    const updates = {
      username: editUsername,
      bio: editBio,
      avatar_url: avatarUrl,
      favorite_club: editClub,
      favorite_club_logo: clubData?.logo || null,
      favorite_country: editCountry,
      favorite_country_flag: countryData?.flag || null,
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setProfile({ ...profile, ...updates });
      setEditing(false);
      setUploadedFile(null);
    }
    setSaving(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 size={32} className="animate-spin text-green-500" />
      </div>
    );
  }

  const total = (profile?.wins || 0) + (profile?.losses || 0) + (profile?.draws || 0);
  const winRate = total > 0 ? Math.round((profile?.wins / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Banner */}
      <div className="relative h-64 bg-gradient-to-br from-green-900/40 via-slate-900 to-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        {/* Profile Card */}
        <div className="glass-strong rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-1 shadow-lg shadow-green-500/20">
                <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-white">{profile?.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
              {editing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition"
                >
                  <Camera size={18} />
                </button>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="input-field text-xl font-bold"
                    placeholder="Username"
                  />
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="input-field resize-none h-20"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-black text-white mb-1">{profile?.username}</h1>
                  <p className="text-slate-400 text-sm mb-3">{user?.email}</p>
                  {profile?.bio && <p className="text-slate-300 text-sm max-w-md">{profile.bio}</p>}

                  {/* Favorite Club & Country */}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {profile?.favorite_club && (
                      <span className="flex items-center gap-2 text-sm bg-slate-800/60 border border-slate-700/30 px-3 py-1.5 rounded-full">
                        <Heart size={14} className="text-red-400" />
                        {profile.favorite_club_logo && <img src={profile.favorite_club_logo} alt="" className="w-5 h-5 object-contain" />}
                        {profile.favorite_club}
                      </span>
                    )}
                    {profile?.favorite_country && (
                      <span className="flex items-center gap-2 text-sm bg-slate-800/60 border border-slate-700/30 px-3 py-1.5 rounded-full">
                        <Globe size={14} className="text-blue-400" />
                        <span className="text-lg">{profile.favorite_country_flag}</span>
                        {profile.favorite_country}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Edit Button */}
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Save
                  </button>
                  <button onClick={() => { setEditing(false); setUploadedFile(null); }} className="btn-secondary">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2">
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Avatar Picker (when editing) */}
          {editing && (
            <div className="mt-6 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/30">
              <p className="text-sm font-medium text-slate-300 mb-3">Choose an avatar or upload your own</p>
              <div className="flex flex-wrap gap-3">
                {STOCK_AVATARS.map((avatar, i) => (
                  <button
                    key={i}
                    onClick={() => { setEditAvatar(avatar); setUploadedFile(null); }}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                      editAvatar === avatar ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <img src={avatar} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Club Picker */}
              <p className="text-sm font-medium text-slate-300 mt-4 mb-3">Favorite Club</p>
              <div className="flex flex-wrap gap-2">
                {CLUBS.map((club) => (
                  <button
                    key={club.name}
                    onClick={() => setEditClub(editClub === club.name ? '' : club.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition ${
                      editClub === club.name
                        ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                        : 'bg-slate-800/60 border border-slate-700/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    <img src={club.logo} alt="" className="w-5 h-5 object-contain" />
                    {club.name}
                  </button>
                ))}
              </div>

              {/* Country Picker */}
              <p className="text-sm font-medium text-slate-300 mt-4 mb-3">Favorite Country</p>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.name}
                    onClick={() => setEditCountry(editCountry === country.name ? '' : country.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition ${
                      editCountry === country.name
                        ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                        : 'bg-slate-800/60 border border-slate-700/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    {country.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'overview', label: 'Overview', icon: Shield },
            { key: 'predictions', label: 'Predictions', icon: Star },
            { key: 'settings', label: 'Settings', icon: Edit3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: TrendingUp, value: `${winRate}%`, label: 'Win Rate', color: 'text-green-400' },
                { icon: Calendar, value: total.toString(), label: 'Predictions', color: 'text-blue-400' },
                { icon: Trophy, value: (profile?.wins || 0).toString(), label: 'Wins', color: 'text-yellow-400' },
                { icon: Activity, value: (profile?.losses || 0).toString(), label: 'Losses', color: 'text-red-400' },
              ].map((stat, i) => (
                <div key={i} className="glass-strong rounded-2xl p-5 text-center card-hover">
                  <stat.icon size={24} className={`mx-auto mb-2 ${stat.color}`} />
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Prediction Accuracy</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Correct Predictions</span>
                    <span className="text-green-400 font-bold">{profile?.wins || 0}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${winRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Total Predictions</span>
                    <span className="text-white font-bold">{total}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full w-full" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold mb-4">Recent Predictions</h2>
            {predictions.length === 0 ? (
              <div className="glass-strong rounded-2xl p-8 text-center">
                <Trophy size={32} className="mx-auto mb-3 text-slate-600" />
                <p className="text-slate-500">No predictions yet. Start predicting matches!</p>
              </div>
            ) : (
              predictions.map((pred) => (
                <div
                  key={pred.id}
                  className="glass-strong rounded-xl p-4 flex items-center justify-between card-hover"
                >
                  <div>
                    <p className="font-semibold text-white">Match ID: {pred.match_id}</p>
                    <p className="text-sm text-slate-500">
                      Predicted: {pred.home_score} - {pred.away_score}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(pred.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass-strong rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl">
                <div>
                  <p className="font-medium text-white">Email</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">Verified</span>
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/feed');
                }}
                className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 font-medium transition text-left"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
