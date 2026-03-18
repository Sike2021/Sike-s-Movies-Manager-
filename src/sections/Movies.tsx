import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { formatMoney, getPhaseColor } from '@/lib/gameUtils';
import { ChevronLeft, Plus, Search, Film, Globe, DollarSign, Calendar, Tv, Mic, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Movie, type ProductionPhase, type Continent, type ContinentRelease, type ReleaseStrategy } from '@/types/game';

const CONTINENTS: Continent[] = ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania'];

const STRATEGIES: { id: ReleaseStrategy; name: string; offset: number; desc: string }[] = [
  { id: 'express', name: 'Express', offset: 4, desc: '1 Month: Fast cash, -15% hype' },
  { id: 'standard', name: 'Standard', offset: 12, desc: '3 Months: 100% efficiency' },
  { id: 'tentpole', name: 'Tentpole', offset: 24, desc: '6 Months: +20% reach' },
];

const WEIGHTS: Record<Continent, number> = {
  'North America': 0.4,
  'Asia': 0.3,
  'Europe': 0.15,
  'South America': 0.1,
  'Africa': 0.025,
  'Oceania': 0.025
};

type Screen = 'dashboard' | 'movies' | 'talent' | 'stats' | 'settings' | 'create-movie' | 'simulation';

interface MoviesProps {
  onNavigate: (screen: Screen) => void;
}

export function Movies({ onNavigate }: MoviesProps) {
  const { state, extendTheatricalRun, reReleaseMovie, holdMovieRelease, updateReleaseDate, setContinentReleases } = useGame();
  const [activeTab, setActiveTab] = useState('production');
  const [releaseConfigMovie, setReleaseConfigMovie] = useState<Movie | null>(null);
  const [globalReleaseWeek, setGlobalReleaseWeek] = useState(state.currentWeek + 4);
  const [releaseStrategy, setReleaseStrategy] = useState<ReleaseStrategy>('standard');
  const [totalMarketingBudget, setTotalMarketingBudget] = useState<number>(0);
  const [continentConfigs, setContinentConfigs] = useState<Record<Continent, { marketing: number }>>(
    CONTINENTS.reduce((acc, c) => ({ ...acc, [c]: { marketing: 0 } }), {} as Record<Continent, { marketing: number }>)
  );

  const autoFillMarketing = (total: number) => {
    const newConfigs = { ...continentConfigs };
    CONTINENTS.forEach(c => {
      newConfigs[c].marketing = Math.round(total * WEIGHTS[c]);
    });
    setContinentConfigs(newConfigs);
  };

  const handleOpenReleaseConfig = useCallback((movie: Movie) => {
    setReleaseConfigMovie(movie);
    
    if (movie.releaseWeek && movie.releaseYear) {
      // Calculate total weeks from current date to pre-set release date
      const totalWeeks = (movie.releaseYear - state.currentYear) * 52 + (movie.releaseWeek - state.currentWeek);
      setGlobalReleaseWeek(state.currentWeek + totalWeeks);
      setReleaseStrategy('standard');
    } else {
      const defaultStrategy = 'standard';
      setReleaseStrategy(defaultStrategy);
      const strategy = STRATEGIES.find(s => s.id === defaultStrategy)!;
      setGlobalReleaseWeek(state.currentWeek + strategy.offset);
    }
    
    const defaultMarketing = Math.round(movie.budget * 0.1);
    setTotalMarketingBudget(defaultMarketing);
    
    // Auto-fill continent configs
    const newConfigs = CONTINENTS.reduce((acc, c) => ({ 
      ...acc, 
      [c]: { marketing: Math.round(defaultMarketing * WEIGHTS[c]) } 
    }), {} as Record<Continent, { marketing: number }>);
    setContinentConfigs(newConfigs);
  }, [state.currentWeek, state.currentYear]);

  // Auto-open release gate for movies ready for distribution
  useEffect(() => {
    const readyMovie = state.movies.find(m => m.phase === 'postProduction' && m.progress >= 100 && !m.continentReleases);
    if (readyMovie && (!releaseConfigMovie || releaseConfigMovie.id !== readyMovie.id)) {
      const timer = setTimeout(() => {
        handleOpenReleaseConfig(readyMovie);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state.movies, state.currentWeek, releaseConfigMovie, handleOpenReleaseConfig]);

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
    setContinentReleases(releaseConfigMovie.id, releases, releaseStrategy);
    setReleaseConfigMovie(null);
    toast.success(`${releaseConfigMovie.title} greenlit for ${releaseStrategy} release!`);
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
                        
                        <button 
                          onClick={() => handleOpenReleaseConfig(movie)}
                          className="w-full bg-[var(--gold)] text-black py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[var(--gold)]/20"
                        >
                          <Globe className="w-4 h-4" /> Configure Global Release
                        </button>
                        <p className="text-[9px] text-[var(--text-muted)] text-center italic">Set timing, marketing budget, and continental strategy.</p>
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
            <Tabs defaultValue="released-movies" className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-black/20 p-1 rounded-xl mb-4">
                <TabsTrigger value="released-movies" className="text-[10px] rounded-lg data-[state=active]:bg-white/10">🎬 Movies</TabsTrigger>
                <TabsTrigger value="released-series" className="text-[10px] rounded-lg data-[state=active]:bg-white/10">📺 Series</TabsTrigger>
                <TabsTrigger value="released-specials" className="text-[10px] rounded-lg data-[state=active]:bg-white/10">🎤 Specials</TabsTrigger>
              </TabsList>

              <TabsContent value="released-movies" className="grid grid-cols-2 gap-3">
                {released.filter(m => ['standalone', 'franchise', 'sequel', 'spinoff', 'crossover', 'teamup'].includes(m.movieType)).map(movie => (
                  <ReleasedCard key={movie.id} movie={movie} />
                ))}
                {released.filter(m => ['standalone', 'franchise', 'sequel', 'spinoff', 'crossover', 'teamup'].includes(m.movieType)).length === 0 && <div className="col-span-2 py-8 text-center text-[var(--text-muted)] text-sm">No movies released yet</div>}
              </TabsContent>

              <TabsContent value="released-series" className="grid grid-cols-2 gap-3">
                {released.filter(m => m.movieType === 'series').map(movie => (
                  <ReleasedCard key={movie.id} movie={movie} />
                ))}
                {released.filter(m => m.movieType === 'series').length === 0 && <div className="col-span-2 py-8 text-center text-[var(--text-muted)] text-sm">No series released yet</div>}
              </TabsContent>

              <TabsContent value="released-specials" className="grid grid-cols-2 gap-3">
                {released.filter(m => m.movieType === 'special').map(movie => (
                  <ReleasedCard key={movie.id} movie={movie} />
                ))}
                {released.filter(m => m.movieType === 'special').length === 0 && <div className="col-span-2 py-8 text-center text-[var(--text-muted)] text-sm">No specials released yet</div>}
              </TabsContent>
            </Tabs>
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
            
            <div className="p-4 border-b border-[var(--border)] bg-black/40 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Release Window
                  </label>
                  {releaseConfigMovie && (() => {
                    const year = state.currentYear + Math.floor((globalReleaseWeek - 1) / 52);
                    const normalizedWeek = ((globalReleaseWeek - 1) % 52) + 1;
                    const isPlannedDate = releaseConfigMovie.releaseWeek === normalizedWeek && releaseConfigMovie.releaseYear === year;
                    
                    return (
                      <div className="flex flex-col items-end gap-1">
                        <div className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${isPlannedDate ? 'bg-[var(--gold)]/20 border-[var(--gold)] text-[var(--gold)]' : 'bg-black/40 border-[var(--border)] text-[var(--text-muted)]'}`}>
                          Target: Week {normalizedWeek}, Year {year}
                        </div>
                        {isPlannedDate ? (
                          <p className="text-[8px] text-[var(--gold)] font-bold uppercase tracking-tighter">Planned Release</p>
                        ) : releaseConfigMovie.releaseWeek ? (
                          <button 
                            onClick={() => {
                              const totalWeeks = (releaseConfigMovie.releaseYear! - state.currentYear) * 52 + (releaseConfigMovie.releaseWeek! - state.currentWeek);
                              setGlobalReleaseWeek(state.currentWeek + totalWeeks);
                              setReleaseStrategy('standard');
                            }}
                            className="text-[8px] text-[var(--gold)] underline font-bold uppercase tracking-widest hover:text-[var(--gold)]/80"
                          >
                            Reset to Planned
                          </button>
                        ) : null}
                      </div>
                    );
                  })()}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {STRATEGIES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setReleaseStrategy(s.id);
                        setGlobalReleaseWeek(state.currentWeek + s.offset);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all ${releaseStrategy === s.id ? 'bg-[var(--gold)] text-black border-[var(--gold)]' : 'bg-black/40 border-[var(--border)] text-[var(--text-muted)]'}`}
                    >
                      <p className="text-[10px] font-black uppercase">{s.name}</p>
                      <p className="text-[8px] opacity-70">{s.offset / 4} Month</p>
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-[var(--text-muted)] italic text-center">
                  {STRATEGIES.find(s => s.id === releaseStrategy)?.desc}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Total Marketing Budget
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)]" />
                    <input 
                      type="number"
                      placeholder="Enter total budget..."
                      value={totalMarketingBudget || ''}
                      onChange={(e) => setTotalMarketingBudget(parseInt(e.target.value) || 0)}
                      className="w-full bg-black/60 border border-[var(--border)] rounded-xl pl-8 pr-3 py-2.5 text-sm font-bold outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                  <button 
                    onClick={() => autoFillMarketing(totalMarketingBudget)}
                    className="bg-[var(--gold)]/20 text-[var(--gold)] px-4 rounded-xl text-[10px] font-black uppercase border border-[var(--gold)]/30 hover:bg-[var(--gold)]/30 transition-all"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Continent Marketing</h3>
                  <div className="group relative">
                    <div className="text-[10px] text-[var(--gold)] cursor-help border-b border-dotted border-[var(--gold)]">Market Bonuses</div>
                    <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-black/90 border border-[var(--border)] rounded-lg text-[8px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <p><span className="text-[var(--gold)]">NA:</span> Opening Weekend Boost</p>
                      <p><span className="text-[var(--gold)]">Asia:</span> Longevity Multiplier</p>
                      <p><span className="text-[var(--gold)]">Europe:</span> Critical Reception</p>
                      <p><span className="text-[var(--gold)]">SA:</span> Viral Potential</p>
                      <p><span className="text-[var(--gold)]">AF/OC:</span> Passive Income</p>
                    </div>
                  </div>
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

function ReleasedCard({ movie }: { movie: Movie }) {
  const hasAwards = movie.awards && movie.awards.length > 0;
  
  const getIcon = () => {
    if (['standalone', 'franchise', 'sequel', 'spinoff', 'crossover', 'teamup'].includes(movie.movieType)) return <Film className="w-3 h-3" />;
    if (movie.movieType === 'series') return <Tv className="w-3 h-3" />;
    return <Mic className="w-3 h-3" />;
  };

  const posterUrl = `https://picsum.photos/seed/${movie.id}/300/450`;

  return (
    <div className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-[var(--bg-card)] border border-white/5 shadow-lg transition-transform hover:scale-[1.02]">
      {/* Background Image */}
      <img 
        src={posterUrl} 
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
        referrerPolicy="no-referrer"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Award Badge */}
      {hasAwards && (
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[var(--gold)] flex items-center justify-center shadow-lg z-10">
          <Trophy className="w-4 h-4 text-black" />
        </div>
      )}

      {/* Type Icon */}
      <div className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white z-10">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-3 space-y-1">
        <h4 className="font-bold text-sm leading-tight line-clamp-2 drop-shadow-md">{movie.title}</h4>
        
        <div className="flex flex-col gap-0.5">
          {['standalone', 'franchise', 'sequel', 'spinoff', 'crossover', 'teamup'].includes(movie.movieType) && (
            <>
              <p className="text-[10px] text-[var(--gold)] font-bold">{formatMoney(movie.boxOffice?.total || 0)}</p>
              <p className="text-[9px] text-green-400 font-medium">{movie.reviews?.critic}% Rating</p>
            </>
          )}
          {movie.movieType === 'series' && (
            <>
              <p className="text-[10px] text-blue-400 font-bold">{movie.season || 1} Seasons</p>
              <p className="text-[9px] text-[var(--text-muted)]">Avg: {Math.round((movie.boxOffice?.total || 0) / 1000000)}M Viewers</p>
            </>
          )}
          {movie.movieType === 'special' && (
            <p className="text-[10px] text-purple-400 font-bold">{movie.genres[0] || 'Documentary'}</p>
          )}
        </div>
      </div>
    </div>
  );
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
