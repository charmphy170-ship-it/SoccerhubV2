const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

const LEAGUES = [
  { id: 'eng.1', name: 'Premier League' },
  { id: 'esp.1', name: 'La Liga' },
  { id: 'ger.1', name: 'Bundesliga' },
  { id: 'ita.1', name: 'Serie A' },
  { id: 'fra.1', name: 'Ligue 1' },
  { id: 'uefa.champions', name: 'Champions League' },
  { id: 'uefa.europa', name: 'Europa League' },
  { id: 'fifa.world', name: 'World Cup' },
  { id: 'fifa.world.q', name: 'World Cup Qualifiers' },
  { id: 'uefa.nations', name: 'Nations League' },
  { id: 'eng.fa', name: 'FA Cup' },
  { id: 'eng.carabao', name: 'Carabao Cup' },
  { id: 'fifa.friendly', name: 'International Friendly' },
  { id: 'usa.1', name: 'MLS' },
  { id: 'bra.1', name: 'Brasileirão' },
  { id: 'ned.1', name: 'Eredivisie' },
  { id: 'por.1', name: 'Primeira Liga' },
];

async function fetchESPN(leagueId: string, date?: string) {
  let url = `${ESPN_BASE}/${leagueId}/scoreboard`;
  if (date) {
    url += `?dates=${date}`;
  }

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      console.warn(`ESPN API error for ${leagueId}: ${res.status}`);
      return null;
    }

    return res.json();
  } catch (err) {
    console.warn(`Fetch error for ${leagueId}:`, err);
    return null;
  }
}

export async function getAllMatches(date?: string) {
  const results = await Promise.allSettled(
    LEAGUES.map((l) => fetchESPN(l.id, date))
  );

  const allMatches: any[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value?.events) {
      const league = LEAGUES[index];
      result.value.events.forEach((event: any) => {
        allMatches.push(transformESPNEvent(event, league));
      });
    }
  });

  return allMatches.sort(
    (a, b) =>
      new Date(a.match_time).getTime() - new Date(b.match_time).getTime()
  );
}

export async function getMatchById(matchId: string) {
  for (const league of LEAGUES) {
    try {
      const data = await fetchESPN(league.id);
      if (data?.events) {
        const match = data.events.find((e: any) => e.id === matchId);
        if (match) {
          return transformESPNEvent(match, league);
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function getWorldCupMatches() {
  const data = await fetchESPN('fifa.world');
  if (!data?.events) return [];
  return data.events.map((e: any) =>
    transformESPNEvent(e, { id: 'fifa.world', name: 'World Cup 2026' })
  );
}

function transformESPNEvent(event: any, league: any) {
  const competitors = event.competitions?.[0]?.competitors || [];
  const homeTeam = competitors.find((c: any) => c.homeAway === 'home');
  const awayTeam = competitors.find((c: any) => c.homeAway === 'away');
  const status = event.status?.type;

  let matchStatus: 'upcoming' | 'live' | 'finished' = 'upcoming';
  if (status?.state === 'in') matchStatus = 'live';
  else if (status?.completed) matchStatus = 'finished';

  const odds = event.competitions?.[0]?.odds?.[0];

  return {
    id: event.id,
    home_team: homeTeam?.team?.displayName || homeTeam?.team?.name || 'TBD',
    away_team: awayTeam?.team?.displayName || awayTeam?.team?.name || 'TBD',
    home_short: homeTeam?.team?.abbreviation || '',
    away_short: awayTeam?.team?.abbreviation || '',
    home_logo: homeTeam?.team?.logo || '',
    away_logo: awayTeam?.team?.logo || '',
    match_time: event.date,
    league: league.name,
    status: matchStatus,
    home_score: homeTeam?.score ? parseInt(homeTeam.score) : null,
    away_score: awayTeam?.score ? parseInt(awayTeam.score) : null,
    display_clock: status?.displayClock || '',
    period: status?.period || 0,
    venue: event.competitions?.[0]?.venue?.fullName || '',
    home_odds: odds?.homeTeamOdds?.moneyLine || null,
    draw_odds: odds?.drawOdds?.moneyLine || null,
    away_odds: odds?.awayTeamOdds?.moneyLine || null,
  };
}

export async function getGroupStandings() {
  return [];
}

export async function getTeams() {
  return [];
}

export function transformMatch(apiMatch: any) {
  return apiMatch;
}
