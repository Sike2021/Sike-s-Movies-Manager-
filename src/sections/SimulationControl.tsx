import { useGame } from '@/context/GameContext';
import { formatDate } from '@/lib/gameUtils';
import { ChevronLeft, FastForward } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SimulationControlProps {
  onBack: () => void;
}

export function SimulationControl({ onBack }: SimulationControlProps) {
  const { state, simulateTime } = useGame();
  const upcomingEvents = state.events.filter(e => e.week > state.currentWeek).slice(0, 5);

  return (
    <ScrollArea className="h-screen scrollbar-thin">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2"><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="font-bold text-lg">Simulation Control</h1>
          <div className="w-10" />
        </div>

        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-1">Current Date</p>
          <p className="text-2xl font-bold">{formatDate(state.currentDate)}</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="text-sm text-[var(--text-secondary)]">Year {state.currentYear}</span>
            <span className="text-sm text-[var(--text-secondary)]">Week {state.currentWeek % 52 || 52}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button 
              onClick={() => simulateTime(1)}
              className="py-3 bg-[var(--gold)] text-black font-bold rounded-xl hover:brightness-110 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
            >
              <FastForward className="w-4 h-4" />
              1 Week
            </button>
            <button 
              onClick={() => simulateTime(2)}
              className="py-3 bg-[var(--gold)]/80 text-black font-bold rounded-xl hover:brightness-110 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
            >
              <FastForward className="w-4 h-4" />
              2 Weeks
            </button>
            <button 
              onClick={() => simulateTime(4)}
              className="py-3 bg-[var(--gold)]/60 text-black font-bold rounded-xl hover:brightness-110 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
            >
              <FastForward className="w-4 h-4" />
              1 Month
            </button>
            <button 
              onClick={() => simulateTime(12)}
              className="py-3 bg-[var(--gold)]/40 text-black font-bold rounded-xl hover:brightness-110 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
            >
              <FastForward className="w-4 h-4" />
              3 Months
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Active Productions</h3>
          <div className="space-y-2">
            {state.movies.filter(m => m.phase !== 'released').map(movie => (
              <div key={movie.id} className="card p-3 flex items-center justify-between">
                <div><p className="font-medium">{movie.title}</p><p className="text-xs text-[var(--text-muted)]">{movie.phase} • {Math.round(movie.progress)}%</p></div>
                <div className="w-20"><div className="progress-track"><div className="progress-fill bg-[var(--gold)]" style={{ width: `${movie.progress}%` }} /></div></div>
              </div>
            ))}
            {state.movies.filter(m => m.phase !== 'released').length === 0 && <p className="text-center text-[var(--text-muted)] py-4">No active productions</p>}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Upcoming Events</h3>
          <div className="space-y-2">
            {upcomingEvents.map(event => (
              <div key={event.id} className="card p-3">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium">{event.name}</p><p className="text-xs text-[var(--text-muted)]">{event.description}</p></div>
                  <span className="text-xs text-[var(--gold)]">Week {event.week}</span>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && <p className="text-center text-[var(--text-muted)] py-4">No upcoming events</p>}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Market Trends</h3>
          <div className="space-y-2">
            {state.marketTrends.sort((a, b) => b.popularity - a.popularity).slice(0, 5).map(trend => (
              <div key={trend.genre} className="card p-3 flex items-center justify-between">
                <span className="font-medium">{trend.genre}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${trend.trend === 'rising' ? 'text-green-400' : trend.trend === 'falling' ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>{trend.trend === 'rising' ? '↑' : trend.trend === 'falling' ? '↓' : '→'}</span>
                  <div className="w-16 h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden"><div className="h-full bg-[var(--gold)]" style={{ width: `${Math.min(100, trend.popularity)}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
