export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_short?: string;
  away_short?: string;
  home_logo?: string;
  away_logo?: string;
  match_time: string;
  league: string;
  status: 'upcoming' | 'live' | 'finished';
  home_score: number | null;
  away_score: number | null;
  display_clock?: string;
  period?: number;
  venue?: string;
  home_odds?: number | null;
  draw_odds?: number | null;
  away_odds?: number | null;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  team_logo?: string;
  number?: number;
  photo?: string;
}

export interface MatchPrediction {
  id: string;
  match_id: string;
  user_id: string;
  home_score: number;
  away_score: number;
  reasoning?: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export interface PlayerPrediction {
  id: string;
  match_id: string;
  user_id: string;
  player_id: string;
  player_name: string;
  prediction_type: 'goals' | 'assists' | 'yellow_cards' | 'red_card' | 'motm';
  predicted_value: number;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export interface ChatMessage {
  id: string;
  match_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  favorite_club?: string;
  favorite_club_logo?: string;
  favorite_country?: string;
  favorite_country_flag?: string;
  bio?: string;
  wins: number;
  losses: number;
  draws: number;
  created_at?: string;
}

export const STOCK_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Molly',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bear',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Kiki',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nala',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Rocky',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Coco',
];

export const CLUBS = [
  { name: 'Arsenal', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png' },
  { name: 'Aston Villa', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/362.png' },
  { name: 'Barcelona', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png' },
  { name: 'Bayern Munich', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png' },
  { name: 'Chelsea', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/363.png' },
  { name: 'Dortmund', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png' },
  { name: 'Inter Milan', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png' },
  { name: 'Juventus', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png' },
  { name: 'Liverpool', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png' },
  { name: 'Man City', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png' },
  { name: 'Man United', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png' },
  { name: 'Milan', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png' },
  { name: 'Napoli', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/114.png' },
  { name: 'PSG', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png' },
  { name: 'Real Madrid', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png' },
  { name: 'Tottenham', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/367.png' },
];

export const COUNTRIES = [
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'Mexico', flag: '🇲🇽' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'USA', flag: '🇺🇸' },
];
