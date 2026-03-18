import { useGame } from '@/context/GameContext';
import { formatMoney } from '@/lib/gameUtils';
import { ChevronLeft, TrendingUp, DollarSign, Film, Star, BarChart3, PieChart, Users, Trophy } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type DailyBoxOffice } from '@/types/game';

type Screen = 'dashboard' | 'movies' | 'talent' | 'stats' | 'settings' | 'create-movie' | 'simulation';

interface StatsProps {
  onNavigate: (screen: Screen) => void;
}

export function Stats({ onNavigate }: StatsProps) {
  const { state } = useGame();
  const releasedMovies = state.movies.filter(m => m.phase === 'released');
  // const totalBoxOffice = releasedMovies.reduce((sum, m) => sum + (m.boxOffice?.total || 0), 0);
  const avgCriticScore = releasedMovies.length > 0 ? releasedMovies.reduce((sum, m) => sum + (m.reviews?.critic || 0), 0) / releasedMovies.length : 0;
  const avgAudienceScore = releasedMovies.length > 0 ? releasedMovies.reduce((sum, m) => sum + (m.reviews?.audience || 0), 0) / releasedMovies.length : 0;
  const bestMovie = releasedMovies.length > 0 ? releasedMovies.reduce((best, m) => (m.boxOffice?.total || 0) > (best.boxOffice?.total || 0) ? m : best) : null;
  const genreCounts = releasedMovies.reduce((acc, m) => { 
    m.genres.forEach(g => {
      acc[g] = (acc[g] || 0) + 1;
    });
    return acc; 
  }, {} as Record<string, number>);

  return (
    <ScrollArea className="h-screen scrollbar-thin">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2"><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="font-bold text-lg">Studio Stats</h1>
          <div className="w-10" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-[var(--gold)]" /><span className="stat-label">Total Revenue</span></div>
            <p className="stat-value-gold">{formatMoney(state.studio.totalRevenue)}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1"><Film className="w-4 h-4 text-[var(--gold)]" /><span className="stat-label">Movies Released</span></div>
            <p className="stat-value">{releasedMovies.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1"><Star className="w-4 h-4 text-[var(--gold)]" /><span className="stat-label">Avg Critic</span></div>
            <p className="stat-value">{avgCriticScore.toFixed(0)}%</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-[var(--gold)]" /><span className="stat-label">Avg Audience</span></div>
            <p className="stat-value">{avgAudienceScore.toFixed(0)}%</p>
          </div>
        </div>

        <Tabs defaultValue="boxoffice" className="w-full">
          <TabsList className="w-full grid grid-cols-5 bg-[var(--bg-card)] p-1 rounded-xl">
            <TabsTrigger value="boxoffice" className="rounded-lg data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black"><BarChart3 className="w-4 h-4 mr-1" /> Box Office</TabsTrigger>
            <TabsTrigger value="movies" className="rounded-lg data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black"><Film className="w-4 h-4 mr-1" /> Movies</TabsTrigger>
            <TabsTrigger value="genres" className="rounded-lg data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black"><PieChart className="w-4 h-4 mr-1" /> Genres</TabsTrigger>
            <TabsTrigger value="awards" className="rounded-lg data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black"><Trophy className="w-4 h-4 mr-1" /> Awards</TabsTrigger>
            <TabsTrigger value="rivals" className="rounded-lg data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black"><Users className="w-4 h-4 mr-1" /> Rivals</TabsTrigger>
          </TabsList>

          <TabsContent value="boxoffice" className="mt-4 space-y-4">
            {bestMovie && (
              <div className="card p-4">
                <p className="text-sm text-[var(--text-secondary)] mb-2">Best Performer</p>
                <h3 className="font-bold text-lg">{bestMovie.title}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div><p className="text-xs text-[var(--text-muted)]">Total</p><p className="text-[var(--gold)] font-semibold">{formatMoney(bestMovie.boxOffice?.total || 0)}</p></div>
                  <div><p className="text-xs text-[var(--text-muted)]">Opening</p><p className="font-semibold">{formatMoney(bestMovie.boxOffice?.openingWeekend || 0)}</p></div>
                  <div><p className="text-xs text-[var(--text-muted)]">Critics</p><p className="text-green-400 font-semibold">{bestMovie.reviews?.critic}%</p></div>
                </div>
              </div>
            )}
            {releasedMovies.slice(0, 3).map(movie => (
              <div key={movie.id} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{movie.title}</h4>
                  <span className="text-xs text-[var(--gold)]">{formatMoney(movie.boxOffice?.total || 0)}</span>
                </div>
                {movie.boxOffice?.daily && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]"><span>Daily Performance</span><span>60 Days</span></div>
                    <div className="flex items-end gap-0.5 h-20">
                      {movie.boxOffice.daily.slice(0, 30).map((day: DailyBoxOffice, i: number) => {
                        const maxVal = Math.max(...movie.boxOffice!.daily.map((d: DailyBoxOffice) => d.total));
                        const height = (day.total / maxVal) * 100;
                        return <div key={i} className={`flex-1 rounded-sm ${day.weekend ? 'bg-[var(--gold)]' : 'bg-[var(--gold)]/40'}`} style={{ height: `${Math.max(height, 5)}%` }} />;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="movies" className="mt-4 space-y-3">
            {releasedMovies.sort((a, b) => (b.boxOffice?.total || 0) - (a.boxOffice?.total || 0)).map((movie, i) => (
              <div key={movie.id} className="card p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] font-bold">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{movie.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{movie.genres.join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[var(--gold)] font-semibold">{formatMoney(movie.boxOffice?.total || 0)}</p>
                  <p className="text-xs text-[var(--text-muted)]">{movie.reviews?.critic}% critics</p>
                </div>
              </div>
            ))}
            {releasedMovies.length === 0 && <div className="card p-8 text-center"><p className="text-[var(--text-muted)]">No movies released yet</p></div>}
          </TabsContent>

          <TabsContent value="genres" className="mt-4 space-y-3">
            {Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).map(([genre, count]) => (
              <div key={genre} className="card p-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{genre}</p>
                  <div className="progress-track mt-2"><div className="progress-fill bg-[var(--gold)]" style={{ width: `${(count / releasedMovies.length) * 100}%` }} /></div>
                </div>
                <div className="text-right ml-4"><p className="font-bold">{count}</p><p className="text-xs text-[var(--text-muted)]">movies</p></div>
              </div>
            ))}
            {releasedMovies.length === 0 && <div className="card p-8 text-center"><p className="text-[var(--text-muted)]">No genre data yet</p></div>}
          </TabsContent>

          <TabsContent value="awards" className="mt-4 space-y-4">
            {(state.awardHistory?.length || 0) > 0 ? [...state.awardHistory].reverse().map((award, i) => (
              <div key={i} className="card p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h3 className="font-bold text-[var(--gold)]">{award.type === 'nominations' ? 'Nominations' : 'Ceremony'}</h3>
                  <span className="text-xs text-[var(--text-muted)]">Year {award.year}</span>
                </div>
                <div className="space-y-2">
                  {award.results.map((res, j) => (
                    <div key={j} className="flex justify-between items-center text-sm">
                      <span className="text-[var(--text-secondary)]">{res.category}</span>
                      <span className="font-medium">{state.movies.find(m => m.id === res.projectId)?.title || 'Unknown'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-[var(--text-muted)]">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No awards history yet.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="rivals" className="mt-4 space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] px-1">Studio Leaderboard</h3>
              {[...state.rivalStudios, { id: 'player', name: state.studio.name, totalBoxOffice: releasedMovies.reduce((sum, m) => sum + (m.boxOffice?.total || 0), 0), moviesReleased: releasedMovies.length, reputation: state.studio.reputation }]
                .sort((a, b) => b.totalBoxOffice - a.totalBoxOffice)
                .map((studio, i) => (
                  <div key={studio.id} className={`card p-3 flex items-center gap-3 ${studio.id === 'player' ? 'border-[var(--gold)] bg-[var(--gold)]/5' : ''}`}>
                    <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-bold">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{studio.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{studio.moviesReleased} releases • {studio.reputation}% Rep</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[var(--gold)] font-bold text-sm">{formatMoney(studio.totalBoxOffice)}</p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] px-1">Recent Rival Releases</h3>
              {state.rivalMovies.slice(0, 10).map(movie => (
                <div key={movie.id} className="card p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{movie.title}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{movie.studioName} • {movie.genres.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--gold)] font-bold text-sm">{formatMoney(movie.boxOffice)}</p>
                    <p className="text-[10px] text-green-400">{movie.quality.toFixed(0)}% Score</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
