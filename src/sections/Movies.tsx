import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { formatMoney, getPhaseColor } from '@/lib/gameUtils';
import { ChevronLeft, Plus, Search, Film, Globe, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Movie, type ProductionPhase, type Continent, type ContinentRelease } from '@/types/game';

const CONTINENTS: Continent[] = ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania'];

type Screen = 'dashboard' | 'movies' | 'talent' | 'stats' | 'settings' | 'create-movie' | 'simulation';

interface MoviesProps {
  onNavigate: (screen: Screen) => void;
}

export function Movies({ onNavigate }: MoviesProps) {
  const { state, extendTheatricalRun, reReleaseMovie, holdMovieRelease, updateReleaseDate, setContinentReleases } = useGame();
  const [activeTab, setActiveTab] = useState('production');
  const [releaseConfigMovie, setReleaseConfigMovie] = useState<Movie | null>(null);
  const [globalReleaseWeek, setGlobalReleaseWeek] = useState(state.currentWeek + 4);

  // Auto-open release gate for movies ready for distribution
  useEffect(() => {
    const readyMovie = state.movies.find(m => m.phase === 'postProduction' && m.progress >= 100 && (!m.releaseWeek || !m.releaseYear) && !m.continentReleases);
    if (readyMovie && releaseConfigMovie?.id !== readyMovie.id) {
      const timer = setTimeout(() => {
        setReleaseConfigMovie(readyMovie);
        setGlobalReleaseWeek(state.currentWeek + 4);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state.movies, state.currentWeek, releaseConfigMovie?.id]);
  const [continentConfigs, setContinentConfigs] = useState<Record<Continent, { marketing: number }>>(
    CONTINENTS.reduce((acc, c) => ({ ...acc, [c]: { marketing: 5000000 } }), {} as Record<Continent, { marketing: number }>)
  );

  const handleOpenReleaseConfig = (movie: Movie) => {
    setReleaseConfigMovie(movie);
    setGlobalReleaseWeek(state.currentWeek + 4);
  };

  const inProduction = state.movies.filter(m => m.phase !== 'released');
  const released = state.movies.filter(m => m.phase === 'released');

  const handleConfirmRelease = () => {
    if (!releaseConfigMovie) return;
    
    const year = state.currentYear + Math.floor((globalReleaseWeek - 1) / 52);
    const normalizedWeek = ((globalReleaseWeek - 1) % 52) + 1;

    const releases: ContinentRelease[] = CONTINENTS.map(c => {
      const config = continentConfigs[c];
      
      return {
        continent: c,
        releaseWeek: normalizedWeek,
        releaseYear: year,
        marketingBudget: parseInt(config.marketing.toString()),
        boxOffice: { total: 0, daily: [] },
        released: false
      };
    });
    setContinentReleases(releaseConfigMovie.id, releases);
    setReleaseConfigMovie(null);
  };
  
  const getStatusBadge = (phase: ProductionPhase) => {
    switch(phase) {
      case 'writing': return <span className="bg-purple-500/20 text-purple-500 text-[8px] px-1.5 py-0.5 rounded-full border border-purple-500/30 uppercase font-black">Writing</span>;
      case 'preProduction': return <span className="badge-preprod">Pre</span>;
      case 'locations': return <span className="bg-blue-500/20 text-blue-500 text-[8px] px-1.5 py-0.5 rounded-full border border-blue-500/30 uppercase font-black">Locs</span>;
      case 'filming': return <span className="badge-film">Film</span>;
      case 'postProduction': return <span className="badge-editing">Post</span>;
      case 'marketing': return <span className="badge-mkt">Mkt</span>;
      default: return <span className="badge-active">OUT</span>;
    }
  };

  return (
    <ScrollArea className="h-screen scrollbar-thin">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">Movies Menu</h1>
          <button className="p-2"><Search className="w-5 h-5" /></button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-[var(--bg-card)] p-1 rounded-xl">
            <TabsTrigger value="my-movies" className="rounded-lg data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black">My Movies</TabsTrigger>
            <TabsTrigger value="production" className="rounded-lg data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black">In Production</TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="my-movies" className="mt-4 space-y-3">
            {state.movies.map(movie => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                showBoxOffice={movie.phase === 'released'} 
                onExtend={extendTheatricalRun} 
                onReRelease={reReleaseMovie}
                onHold={holdMovieRelease}
                onUpdateDate={updateReleaseDate}
              />
            ))}
            {state.movies.length === 0 && <EmptyState />}
          </TabsContent>

          <TabsContent value="production" className="mt-4 space-y-3">
            {inProduction.map(movie => (
              <div key={movie.id} className="movie-card p-4">
                <div className="flex items-start gap-4">
                  <div className="movie-poster text-4xl">{getGenreEmoji(movie.genres[0])}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{movie.title}</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {movie.genres.map(g => (
                            <span key={g} className="text-[8px] px-1.5 py-0.5 rounded-full border border-[var(--gold)]/30 text-[var(--gold)]">{g}</span>
                          ))}
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">Budget: {formatMoney(movie.budget)} • {movie.phase} {movie.episodes ? `• ${movie.episodes} Eps` : ''}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(movie.phase)}
                        {movie.phase === 'marketing' && (
                          <button 
                            onClick={() => holdMovieRelease(movie.id, !movie.isHeld)}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${movie.isHeld ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-[var(--text-muted)] text-[var(--text-muted)]'}`}
                          >
                            {movie.isHeld ? 'HELD' : 'HOLD'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[var(--text-muted)]">Progress</span>
                        <span className="text-[var(--gold)]">{Math.round(movie.progress)}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${movie.progress}%`, backgroundColor: getPhaseColor(movie.phase) }} />
                      </div>
                    </div>

                    {/* Release Date Selection for Ready Movies */}
                    {movie.phase === 'postProduction' && movie.progress >= 100 && !movie.continentReleases && (
                      <div className="mt-4 p-3 bg-[var(--gold)]/10 rounded-xl border border-[var(--gold)]/30 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
                          <p className="text-[10px] font-bold text-[var(--gold)] uppercase tracking-widest">Ready for Distribution</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          <button 
                            onClick={() => handleOpenReleaseConfig(movie)}
                            className="w-full bg-[var(--gold)] text-black py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[var(--gold)]/20"
                          >
                            <Globe className="w-4 h-4" /> Strategic Global Release
                          </button>
                          
                          <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-[var(--gold)]/20">
                            <div className="flex-1">
                              <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold mb-1">Release Date</p>
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  <select 
                                    className="bg-transparent border-none focus:ring-0 text-xs font-bold p-0 outline-none appearance-none pr-4 cursor-pointer"
                                    id={`release-week-${movie.id}`}
                                    defaultValue={movie.releaseWeek || (state.currentWeek + 2 > 52 ? (state.currentWeek + 2) % 52 : state.currentWeek + 2)}
                                  >
                                    {Array.from({ length: 52 }, (_, i) => (
                                      <option key={i + 1} value={i + 1} className="bg-[var(--bg-secondary)]">Wk {i + 1}</option>
                                    ))}
                                  </select>
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] text-[8px]">▼</div>
                                </div>
                                <div className="relative">
                                  <select 
                                    className="bg-transparent border-none focus:ring-0 text-xs font-bold p-0 outline-none appearance-none pr-4 cursor-pointer"
                                    id={`release-year-${movie.id}`}
                                    defaultValue={movie.releaseYear || (state.currentWeek + 2 > 52 ? state.currentYear + 1 : state.currentYear)}
                                  >
                                    {Array.from({ length: 5 }, (_, i) => (
                                      <option key={state.currentYear + i} value={state.currentYear + i} className="bg-[var(--bg-secondary)]">{state.currentYear + i}</option>
                                    ))}
                                  </select>
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] text-[8px]">▼</div>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                const weekSelect = document.getElementById(`release-week-${movie.id}`) as HTMLSelectElement;
                                const yearSelect = document.getElementById(`release-year-${movie.id}`) as HTMLSelectElement;
                                const weekVal = parseInt(weekSelect.value);
                                const yearVal = parseInt(yearSelect.value);
                                if (isNaN(weekVal) || isNaN(yearVal)) return;
                                updateReleaseDate(movie.id, weekVal, yearVal);
                                toast.success('Release date scheduled!');
                              }}
                              className="bg-[var(--gold)]/20 text-[var(--gold)] px-4 py-2 rounded-lg text-[10px] font-black uppercase border border-[var(--gold)]/30 hover:bg-[var(--gold)]/30 transition-all"
                            >
                              Set Date
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => {
                              const weekSelect = document.getElementById(`release-week-${movie.id}`) as HTMLSelectElement;
                              const yearSelect = document.getElementById(`release-year-${movie.id}`) as HTMLSelectElement;
                              const weekVal = parseInt(weekSelect.value);
                              const yearVal = parseInt(yearSelect.value);
                              
                              const releases: ContinentRelease[] = CONTINENTS.map(c => ({
                                continent: c,
                                releaseWeek: weekVal,
                                releaseYear: yearVal,
                                marketingBudget: Math.round(movie.budget * 0.05), // Default 5% marketing
                                boxOffice: { total: 0, daily: [] },
                                released: false
                              }));
                              setContinentReleases(movie.id, releases);
                              toast.success('Movie sent to distribution!');
                            }}
                            className="w-full bg-blue-500/20 text-blue-400 py-2 rounded-xl text-[10px] font-black uppercase border border-blue-500/30 hover:bg-blue-500/30 transition-all"
                          >
                            Quick Release (5% Marketing)
                          </button>
                        </div>
                      </div>
                    )}

                    {movie.phase === 'marketing' && (
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="text-[10px] text-[var(--text-muted)]">
                          Release: Week {movie.releaseWeek}, {movie.releaseYear}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const newWeek = movie.releaseWeek === 52 ? 1 : movie.releaseWeek! + 1;
                              const newYear = movie.releaseWeek === 52 ? movie.releaseYear! + 1 : movie.releaseYear!;
                              updateReleaseDate(movie.id, newWeek, newYear);
                            }}
                            className="text-[10px] bg-[var(--bg-secondary)] px-2 py-1 rounded border border-[var(--border)]"
                          >
                            Delay 1w
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {inProduction.length === 0 && <EmptyState />}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-3">
            {released.map(movie => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                showBoxOffice 
                onExtend={extendTheatricalRun} 
                onReRelease={reReleaseMovie}
                onHold={holdMovieRelease}
                onUpdateDate={updateReleaseDate}
              />
            ))}
            {released.length === 0 && <EmptyState />}
          </TabsContent>
        </Tabs>

        <button onClick={() => onNavigate('create-movie')} className="btn-primary w-full flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> Create Movie
        </button>
      </div>

      {/* Global Release Configuration Modal */}
      {releaseConfigMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] w-full max-w-lg rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">Global Release Strategy</h2>
                <p className="text-xs text-[var(--text-muted)]">{releaseConfigMovie.title}</p>
              </div>
              <button onClick={() => setReleaseConfigMovie(null)} className="p-2 text-[var(--text-muted)]">×</button>
            </div>
            
            <div className="p-4 border-b border-[var(--border)] bg-black/40">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Global Release Date
                </label>
                <div className="relative">
                  <select 
                    key={`release-week-${globalReleaseWeek}`}
                    value={globalReleaseWeek}
                    onChange={(e) => setGlobalReleaseWeek(parseInt(e.target.value))}
                    className="w-full bg-black/60 border border-[var(--border)] rounded-xl px-4 py-3 text-sm appearance-none outline-none focus:border-[var(--gold)] cursor-pointer font-bold"
                  >
                    {Array.from({ length: 104 }, (_, i) => {
                      const weekNum = state.currentWeek + i + 1;
                      const yearOffset = Math.floor((weekNum - 1) / 52);
                      const displayWeek = ((weekNum - 1) % 52) + 1;
                      const displayYear = state.currentYear + yearOffset;
                      return (
                        <option key={weekNum} value={weekNum} className="bg-[var(--bg-secondary)]">
                          Week {displayWeek}, {displayYear}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--gold)]">▼</div>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] italic">This date will apply to all continents simultaneously.</p>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Continent Marketing</h3>
                  <button 
                    onClick={() => {
                      const avg = Math.round(state.studio.cash * 0.02);
                      setContinentConfigs(CONTINENTS.reduce((acc, c) => ({ ...acc, [c]: { marketing: avg } }), {} as Record<Continent, { marketing: number }>));
                    }}
                    className="text-[10px] text-[var(--gold)] hover:underline"
                  >
                    Auto-fill (2% each)
                  </button>
                </div>
                {CONTINENTS.map(continent => (
                  <div key={continent} className="p-4 bg-black/20 rounded-2xl border border-[var(--border)] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-[var(--gold)]" />
                      </div>
                      <span className="font-bold text-sm">{continent}</span>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)]" />
                        <input 
                          type="number"
                          step="100000"
                          value={continentConfigs[continent].marketing}
                          onChange={(e) => setContinentConfigs({
                            ...continentConfigs,
                            [continent]: { ...continentConfigs[continent], marketing: parseInt(e.target.value) || 0 }
                          })}
                          className="w-full bg-black/40 border border-[var(--border)] rounded-xl pl-8 pr-3 py-2 text-xs font-bold focus:border-[var(--gold)] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-[var(--border)] bg-black/20">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs">
                  <p className="text-[var(--text-muted)]">Total Marketing Cost</p>
                  <p className={`font-bold ${state.studio.cash < CONTINENTS.reduce((s, c) => s + continentConfigs[c].marketing, 0) ? 'text-red-500' : 'text-[var(--gold)]'}`}>
                    {formatMoney(CONTINENTS.reduce((s, c) => s + continentConfigs[c].marketing, 0))}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-[var(--text-muted)]">Available Cash</p>
                  <p className="font-bold">{formatMoney(state.studio.cash)}</p>
                </div>
              </div>
              <button 
                onClick={handleConfirmRelease}
                disabled={state.studio.cash < CONTINENTS.reduce((s, c) => s + continentConfigs[c].marketing, 0)}
                className="w-full btn-primary py-3 rounded-xl font-bold disabled:opacity-50"
              >
                Confirm Global Strategy
              </button>
            </div>
          </div>
        </div>
      )}
    </ScrollArea>
  );
}

function getGenreEmoji(genre: string) {
  const emojis: Record<string, string> = { Action: '💥', Comedy: '😂', Horror: '👻', 'Sci-Fi': '🚀', Romance: '💕', Superhero: '🦸', Fantasy: '🐉', Mystery: '🔍', Animation: '🎨', Thriller: '🔪', Drama: '🎭', Documentary: '📹', Western: '🤠', Musical: '🎵', War: '⚔️', Crime: '🔫', Family: '👨‍👩‍👧‍👦', Noir: '🌃' };
  return emojis[genre] || '🎬';
}

function MovieCard({ movie, showBoxOffice, onExtend, onReRelease, onHold, onUpdateDate }: { 
  movie: Movie; 
  showBoxOffice?: boolean; 
  onExtend?: (id: string) => void; 
  onReRelease?: (id: string) => void;
  onHold?: (id: string, hold: boolean) => void;
  onUpdateDate?: (id: string, week: number, year: number) => void;
}) {
  const daysReleased = movie.releaseDate ? Math.floor((new Date().getTime() - new Date(movie.releaseDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const weeksReleased = Math.floor(daysReleased / 7);
  const isTheatrical = movie.phase === 'released' && weeksReleased < movie.theatricalWeeks;
  const canReRelease = movie.phase === 'released' && weeksReleased >= movie.theatricalWeeks;

  return (
    <div className="movie-card p-4">
      <div className="flex items-start gap-4">
        <div className="movie-poster text-4xl">{getGenreEmoji(movie.genres[0])}</div>
        <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{movie.title}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {movie.genres.map(g => (
                    <span key={g} className="text-[8px] px-1.5 py-0.5 rounded-full border border-[var(--gold)]/30 text-[var(--gold)]">{g}</span>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">{movie.movieType} {movie.episodes ? `• ${movie.episodes} Episodes` : ''}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {movie.isReRelease && <span className="text-[10px] bg-[var(--gold)]/20 text-[var(--gold)] px-2 py-0.5 rounded-full border border-[var(--gold)]/30">RE-RELEASE</span>}
                {movie.phase !== 'released' && movie.phase === 'marketing' && (
                  <button 
                    onClick={() => onHold?.(movie.id, !movie.isHeld)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${movie.isHeld ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-[var(--text-muted)] text-[var(--text-muted)]'}`}
                  >
                    {movie.isHeld ? 'HELD' : 'HOLD'}
                  </button>
                )}
              </div>
            </div>
          
          {showBoxOffice && movie.boxOffice && (
            <div className="mt-2 space-y-3">
              <div className="flex items-center gap-4">
                <div><p className="text-xs text-[var(--text-muted)]">Box Office</p><p className="text-[var(--gold)] font-semibold">{formatMoney(movie.boxOffice.total)}</p></div>
                <div><p className="text-xs text-[var(--text-muted)]">Critics</p><p className="text-green-400 font-semibold">{movie.reviews?.critic}%</p></div>
              </div>
              
              <div className="flex items-center gap-2">
                {isTheatrical && (
                  <button 
                    onClick={() => onExtend?.(movie.id)}
                    className="flex-1 py-1.5 rounded-lg bg-[var(--gold)] text-black text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Extend Run ({formatMoney(movie.budget * 0.01)})
                  </button>
                )}
                {canReRelease && (
                  <button 
                    onClick={() => onReRelease?.(movie.id)}
                    className="flex-1 py-1.5 rounded-lg border border-[var(--gold)] text-[var(--gold)] text-xs font-bold hover:bg-[var(--gold)]/10 transition-colors"
                  >
                    Re-Release
                  </button>
                )}
                {isTheatrical && (
                  <div className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[10px] flex items-center gap-1">
                    <span>{movie.theatricalWeeks - weeksReleased}w left</span>
                  </div>
                )}
              </div>
              
              {movie.phase !== 'released' && movie.phase === 'marketing' && (
                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                  <span>Release: Week {movie.releaseWeek}, {movie.releaseYear}</span>
                  <button 
                    onClick={() => {
                      const currentWeek = movie.releaseWeek || 0;
                      const currentYear = movie.releaseYear || 0;
                      const newWeek = currentWeek === 52 ? 1 : currentWeek + 1;
                      const newYear = currentWeek === 52 ? currentYear + 1 : currentYear;
                      onUpdateDate?.(movie.id, newWeek, newYear);
                    }}
                    className="bg-[var(--bg-secondary)] px-2 py-1 rounded border border-[var(--border)]"
                  >
                    Delay 1w
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-8 text-center">
      <Film className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
      <p className="text-[var(--text-muted)]">No movies yet</p>
    </div>
  );
}
