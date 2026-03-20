import { useGame } from '@/context/GameContext';
import { formatMoney } from '@/lib/gameUtils';
import { Clapperboard, Film, UserPlus, Play, Settings, ChevronRight, Star, Info, FastForward, BarChart3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { AboutModal } from '@/components/AboutModal';

type Screen = 'setup' | 'dashboard' | 'movies' | 'talent' | 'stats' | 'settings' | 'create-movie' | 'simulation' | 'box-office';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { state, simulateTime } = useGame();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const activeMovies = state.movies.filter(m => m.phase !== 'released');
  
  const getReputationStars = () => {
    const stars = Math.ceil(state.studio.reputation / 20);
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < stars ? 'text-[var(--gold)] fill-[var(--gold)]' : 'text-[var(--text-muted)]'}`} />
    ));
  };

  return (
    <ScrollArea className="h-screen scrollbar-thin">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--gold)] flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{state.studio.name}</h1>
              <div className="flex items-center gap-1">{getReputationStars()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsAboutOpen(true)} className="p-2 rounded-xl bg-[var(--bg-card)] hover:bg-white/5 transition-colors">
              <Info className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            <button onClick={() => onNavigate('settings')} className="p-2 rounded-xl bg-[var(--bg-card)] hover:bg-white/5 transition-colors">
              <Settings className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="stat-card">
            <div className="stat-label">Year</div>
            <div className="stat-value-gold">{state.currentYear}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Week</div>
            <div className="stat-value-gold">{state.currentWeek % 52 || 52}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Cash</div>
            <div className="text-xl font-bold text-green-400">{formatMoney(state.studio.cash)}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onNavigate('create-movie')} className="quick-action">
              <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] mb-3">
                <Film className="w-6 h-6" />
              </div>
              <p className="font-semibold">Create Movie</p>
              <p className="text-xs text-[var(--text-muted)]">Start production</p>
            </button>
            <button onClick={() => onNavigate('create-movie')} className="quick-action">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-3">
                <Play className="w-6 h-6" />
              </div>
              <p className="font-semibold">Create Series</p>
              <p className="text-xs text-[var(--text-muted)]">TV production</p>
            </button>
            <button onClick={() => onNavigate('talent')} className="quick-action">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3">
                <UserPlus className="w-6 h-6" />
              </div>
              <p className="font-semibold">Hire Actors</p>
              <p className="text-xs text-[var(--text-muted)]">Expand roster</p>
            </button>
            <button onClick={() => onNavigate('simulation')} className="quick-action border-[var(--gold)]">
              <div className="w-12 h-12 rounded-xl bg-[var(--gold)] flex items-center justify-center text-black mb-3">
                <Play className="w-6 h-6" />
              </div>
              <p className="font-semibold">Simulate</p>
              <p className="text-xs text-[var(--text-muted)]">Run timeline</p>
            </button>
            <button onClick={() => simulateTime(1)} className="quick-action bg-[var(--gold)]/5 border-dashed border-[var(--gold)]/30">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[var(--gold)] mb-3">
                <FastForward className="w-6 h-6" />
              </div>
              <p className="font-semibold">Skip Week</p>
              <p className="text-xs text-[var(--text-muted)]">+7 Days</p>
            </button>
            <button onClick={() => onNavigate('box-office')} className="quick-action bg-blue-500/5 border-dashed border-blue-500/30">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                <BarChart3 className="w-6 h-6" />
              </div>
              <p className="font-semibold">B.O. Sim</p>
              <p className="text-xs text-[var(--text-muted)]">Standalone</p>
            </button>
          </div>
        </div>

        {/* Active Productions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Active Productions</h2>
            <button onClick={() => onNavigate('movies')} className="text-xs text-[var(--gold)] flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {activeMovies.slice(0, 3).map(movie => (
              <div key={movie.id} className="card p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--gold)]/20 to-purple-500/20 flex items-center justify-center text-xl">
                  {movie.genres[0] === 'Action' ? '💥' : movie.genres[0] === 'Comedy' ? '😂' : movie.genres[0] === 'Horror' ? '👻' : movie.genres[0] === 'Sci-Fi' ? '🚀' : movie.genres[0] === 'Romance' ? '💕' : movie.genres[0] === 'Superhero' ? '🦸' : '🎬'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{movie.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{movie.genres.join(', ')} • {movie.phase}</p>
                  <div className="progress-track mt-2">
                    <div className="progress-fill bg-[var(--gold)]" style={{ width: `${movie.progress}%` }} />
                  </div>
                </div>
                <span className="text-xs font-medium text-[var(--gold)]">{Math.round(movie.progress)}%</span>
              </div>
            ))}
            {activeMovies.length === 0 && (
              <div className="card p-6 text-center">
                <p className="text-[var(--text-muted)]">No active productions</p>
                <button onClick={() => onNavigate('create-movie')} className="btn-primary mt-3 text-sm">Create Movie</button>
              </div>
            )}
          </div>
        </div>

        {/* Feed */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Feed</h2>
          <div className="space-y-2">
            {state.notifications.slice(0, 5).map(note => (
              <div key={note.id} className="card p-3 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${note.type === 'success' ? 'bg-green-500/20 text-green-400' : note.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {note.type === 'success' ? '✓' : note.type === 'warning' ? '!' : 'i'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{note.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{note.message}</p>
                </div>
              </div>
            ))}
            {state.notifications.length === 0 && <p className="text-center text-[var(--text-muted)] text-sm py-4">No notifications yet</p>}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
