import { NextResponse } from 'next/server';

const ESPN_LEAGUES: Record<string, string> = {
  'super-lig': 'tur.1',
  'premier-lig': 'eng.1',
  'la-liga': 'esp.1',
  'serie-a': 'ita.1',
  'bundesliga': 'ger.1',
  'ligue-1': 'fra.1',
  'eredivisie': 'ned.1',
  'liga-portugal': 'por.1',
  'tff-1-lig': 'tur.2',
  'championship': 'eng.2',
  'la-liga-2': 'esp.2',
  'serie-b': 'ita.2',
  'bundesliga-2': 'ger.2',
  'champions-league': 'uefa.champions',
  'europa-league': 'uefa.europa',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get('league') || 'super-lig';

  try {
    const espnCode = ESPN_LEAGUES[league];

    if (!espnCode) {
      return NextResponse.json({
        success: false,
        error: 'Bilinmeyen lig',
        data: [],
      });
    }

    const espnData = await fetchFromESPN(espnCode);
    if (espnData && espnData.length > 0) {
      return NextResponse.json({
        success: true,
        data: espnData,
        lastUpdate: new Date().toISOString(),
        source: 'espn',
        league: league,
      });
    }

    return NextResponse.json({
      success: true,
      data: getFallbackData(league),
      lastUpdate: new Date().toISOString(),
      source: 'cache',
      league: league,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: true,
      data: getFallbackData(league),
      lastUpdate: new Date().toISOString(),
      source: 'cache',
      league: league,
    });
  }
}

async function fetchFromESPN(leagueCode: string) {
  try {
    const response = await fetch(
      `https://site.api.espn.com/apis/v2/sports/soccer/${leagueCode}/standings`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) return null;

    const data = await response.json();

    let standings = data?.children?.[0]?.standings?.entries;

    if (!standings && data?.standings?.entries) {
      standings = data.standings.entries;
    }

    if (!standings) return null;

    return standings.map((entry: any, index: number) => ({
      sira: entry.stats?.find((s: any) => s.name === 'rank')?.value || index + 1,
      takim: entry.team?.displayName || entry.team?.name || entry.team?.shortDisplayName,
      oynanan: getStatValue(entry.stats, 'gamesPlayed'),
      galibiyet: getStatValue(entry.stats, 'wins'),
      beraberlik: getStatValue(entry.stats, 'ties'),
      malubiyet: getStatValue(entry.stats, 'losses'),
      atilanGol: getStatValue(entry.stats, 'pointsFor'),
      yenilenGol: getStatValue(entry.stats, 'pointsAgainst'),
      averaj: getStatValue(entry.stats, 'pointDifferential'),
      puan: getStatValue(entry.stats, 'points'),
      logo: entry.team?.logos?.[0]?.href || '',
    })).sort((a: any, b: any) => b.puan - a.puan || b.averaj - a.averaj);
  } catch (error) {
    console.error('ESPN Error:', error);
    return null;
  }
}

function getStatValue(stats: any[], name: string): number {
  const stat = stats?.find((s: any) => s.name === name);
  return stat?.value || 0;
}

function getFallbackData(league: string) {
  if (league === 'super-lig') {
    return [
      { sira: 1, takim: 'Galatasaray', oynanan: 19, galibiyet: 15, beraberlik: 5, malubiyet: 0, atilanGol: 47, yenilenGol: 17, averaj: 30, puan: 50 },
      { sira: 2, takim: 'Fenerbahçe', oynanan: 19, galibiyet: 13, beraberlik: 3, malubiyet: 3, atilanGol: 48, yenilenGol: 19, averaj: 29, puan: 42 },
      { sira: 3, takim: 'Samsunspor', oynanan: 19, galibiyet: 10, beraberlik: 5, malubiyet: 4, atilanGol: 29, yenilenGol: 18, averaj: 11, puan: 35 },
      { sira: 4, takim: 'Trabzonspor', oynanan: 19, galibiyet: 10, beraberlik: 5, malubiyet: 4, atilanGol: 38, yenilenGol: 24, averaj: 14, puan: 35 },
      { sira: 5, takim: 'Göztepe', oynanan: 19, galibiyet: 10, beraberlik: 4, malubiyet: 5, atilanGol: 32, yenilenGol: 17, averaj: 15, puan: 34 },
      { sira: 6, takim: 'Beşiktaş', oynanan: 19, galibiyet: 9, beraberlik: 3, malubiyet: 7, atilanGol: 32, yenilenGol: 28, averaj: 4, puan: 30 },
      { sira: 7, takim: 'Eyüpspor', oynanan: 19, galibiyet: 8, beraberlik: 5, malubiyet: 6, atilanGol: 24, yenilenGol: 21, averaj: 3, puan: 29 },
      { sira: 8, takim: 'Başakşehir', oynanan: 19, galibiyet: 8, beraberlik: 4, malubiyet: 7, atilanGol: 26, yenilenGol: 25, averaj: 1, puan: 28 },
      { sira: 9, takim: 'Alanyaspor', oynanan: 19, galibiyet: 7, beraberlik: 6, malubiyet: 6, atilanGol: 23, yenilenGol: 22, averaj: 1, puan: 27 },
      { sira: 10, takim: 'Sivasspor', oynanan: 19, galibiyet: 6, beraberlik: 8, malubiyet: 5, atilanGol: 22, yenilenGol: 21, averaj: 1, puan: 26 },
      { sira: 11, takim: 'Rizespor', oynanan: 19, galibiyet: 7, beraberlik: 4, malubiyet: 8, atilanGol: 24, yenilenGol: 27, averaj: -3, puan: 25 },
      { sira: 12, takim: 'Antalyaspor', oynanan: 19, galibiyet: 6, beraberlik: 5, malubiyet: 8, atilanGol: 22, yenilenGol: 31, averaj: -9, puan: 23 },
      { sira: 13, takim: 'Kasımpaşa', oynanan: 19, galibiyet: 6, beraberlik: 4, malubiyet: 9, atilanGol: 24, yenilenGol: 33, averaj: -9, puan: 22 },
      { sira: 14, takim: 'Konyaspor', oynanan: 19, galibiyet: 5, beraberlik: 6, malubiyet: 8, atilanGol: 24, yenilenGol: 27, averaj: -3, puan: 21 },
      { sira: 15, takim: 'Gaziantep FK', oynanan: 19, galibiyet: 5, beraberlik: 5, malubiyet: 9, atilanGol: 21, yenilenGol: 27, averaj: -6, puan: 20 },
      { sira: 16, takim: 'Bodrum FK', oynanan: 19, galibiyet: 4, beraberlik: 5, malubiyet: 10, atilanGol: 17, yenilenGol: 30, averaj: -13, puan: 17 },
      { sira: 17, takim: 'Hatayspor', oynanan: 19, galibiyet: 4, beraberlik: 4, malubiyet: 11, atilanGol: 19, yenilenGol: 35, averaj: -16, puan: 16 },
      { sira: 18, takim: 'Adana Demirspor', oynanan: 19, galibiyet: 3, beraberlik: 4, malubiyet: 12, atilanGol: 16, yenilenGol: 33, averaj: -17, puan: 13 },
      { sira: 19, takim: 'Kayserispor', oynanan: 19, galibiyet: 1, beraberlik: 5, malubiyet: 13, atilanGol: 12, yenilenGol: 35, averaj: -23, puan: 8 },
    ];
  }

  return [];
}
