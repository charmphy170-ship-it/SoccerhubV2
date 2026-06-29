import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClientComponentClient();

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

export async function getPredictions(matchId: string) {
  const { data } = await supabase
    .from('predictions')
    .select('*, profiles(username, avatar_url)')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getPlayerPredictions(matchId: string) {
  const { data } = await supabase
    .from('player_predictions')
    .select('*, profiles(username, avatar_url)')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getChatMessages(matchId: string) {
  const { data } = await supabase
    .from('chat_messages')
    .select('*, profiles(username, avatar_url)')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })
    .limit(100);
  return data || [];
}

export async function createPrediction(prediction: any) {
  const { data, error } = await supabase
    .from('predictions')
    .insert(prediction)
    .select()
    .single();
  return { data, error };
}

export async function createPlayerPrediction(prediction: any) {
  const { data, error } = await supabase
    .from('player_predictions')
    .insert(prediction)
    .select()
    .single();
  return { data, error };
}

export async function sendChatMessage(message: any) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(message)
    .select()
    .single();
  return { data, error };
}

export async function subscribeToChat(matchId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`chat:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `match_id=eq.${matchId}`,
      },
      callback
    )
    .subscribe();
}

export async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return publicUrl;
}
