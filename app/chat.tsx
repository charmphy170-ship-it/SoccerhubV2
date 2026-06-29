'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Send, Users, Loader2, Globe } from 'lucide-react';

function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('chat_messages')
          .select('*, profiles(username, avatar_url)')
          .eq('match_id', 'global')
          .order('created_at', { ascending: true })
          .limit(100);

        if (fetchError) throw fetchError;
        if (isMounted) {
          setMessages(data || []);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Chat load error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load messages');
          setLoading(false);
        }
      }
    };

    const setupSubscription = () => {
      const channel = supabase
        .channel('global-chat')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: 'match_id=eq.global',
          },
          (payload: any) => {
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
        )
        .subscribe((status: string) => {
          console.log('Global chat subscription status:', status);
          if (status === 'CHANNEL_ERROR') {
            setError('Chat connection failed. Retrying...');
          }
        });

      channelRef.current = channel;
    };

    loadMessages();
    setupSubscription();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const { error: insertError } = await supabase.from('chat_messages').insert({
        match_id: 'global',
        user_id: user.id,
        content: newMessage.trim(),
      });

      if (insertError) throw insertError;
      setNewMessage('');
    } catch (err: any) {
      console.error('Send error:', err);
      setError('Failed to send message. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-4 shadow-lg shadow-green-500/30">
            <Globe size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">Global Chat</h1>
          <p className="text-slate-400">Talk football with the community</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-500">{messages.length} messages</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="bg-slate-900/60 border border-slate-700/40 rounded-3xl overflow-hidden">
          <div className="h-[60vh] overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={24} className="animate-spin text-green-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <Users size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="text-slate-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
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
            <form onSubmit={handleSend} className="border-t border-slate-700/40 p-4 flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-30 text-white rounded-xl transition"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
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
      </div>
    </div>
  );
}
