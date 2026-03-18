import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, TrendingUp, DollarSign, BarChart3, Info, Globe } from 'lucide-react';
import { 
  type BoxOfficeMovie, 
  simulateDay, 
  simulateWeek, 
  getMovieReport,
  sellToStreaming,
  calculateStreamingSalePrice
} from '@/lib/boxOfficeSystem';
import { formatMoney } from '@/lib/gameUtils';

const INITIAL_MOVIES: BoxOfficeMovie[] = [
  {
    id: '1',
    title: 'The Great Heist',
    releaseDate: new Date(),
    releaseType: 'auto',
    budget: 50000000,
    opening: 10000000,
    rating: 8.5,
    hype: 0.8,
    wordOfMouth: 1.0,
    competition: 0.2,
    totalCollection: 0,
    dailyCollection: [],
    weeklyCollection: [],
    currentDay: 0,
    currentWeek: 0,
    status: 'Running'
  },
  {
    id: '2',
    title: 'Love in Paris',
    releaseDate: new Date(),
    releaseType: 'weekly',
    budget: 20000000,
    opening: 5000000,
    rating: 6.2,
    hype: 0.5,
    wordOfMouth: 1.0,
    competition: 0.1,
    totalCollection: 0,
    dailyCollection: [],
    weeklyCollection: [],
    currentDay: 0,
    currentWeek: 0,
    status: 'Running'
  },
  {
    id: '3',
    title: 'Space Wars: Episode IX',
    releaseDate: new Date(),
    releaseType: 'daily',
    budget: 150000000,
    opening: 40000000,
    rating: 4.5,
    hype: 0.95,
    wordOfMouth: 1.0,
    competition: 0.4,
    totalCollection: 0,
    dailyCollection: [],
    weeklyCollection: [],
    currentDay: 0,
    currentWeek: 0,
    status: 'Running'
  }
];

export default function BoxOfficeSimulator() {
  const [movies, setMovies] = useState<BoxOfficeMovie[]>(INITIAL_MOVIES);
  const [simulationDay, setSimulationDay] = useState(0);

  const handleSimulateDay = () => {
    const updatedMovies = movies.map(movie => {
      if (movie.releaseType === 'weekly') {
        if (simulationDay % 7 === 0) {
          return simulateWeek(movie);
        }
        return movie;
      }
      return simulateDay(movie);
    });
    setMovies(updatedMovies);
    setSimulationDay(prev => prev + 1);
  };

  const handleSimulateWeek = () => {
    let currentMovies = [...movies];
    for (let i = 0; i < 7; i++) {
      currentMovies = currentMovies.map(movie => {
        if (movie.releaseType === 'weekly') {
          if ((simulationDay + i) % 7 === 0) {
            return simulateWeek(movie);
          }
          return movie;
        }
        return simulateDay(movie);
      });
    }
    setMovies(currentMovies);
    setSimulationDay(prev => prev + 7);
  };

  const handleReset = () => {
    setMovies(INITIAL_MOVIES);
    setSimulationDay(0);
  };

  const handleSellToStreaming = (id: string) => {
    setMovies(prev => prev.map(m => m.id === id ? sellToStreaming(m) : m));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Box Office Simulator</h1>
          <p className="text-[var(--text-muted)]">Sike Entertainment v0.0.7.0 Standalone Module</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <div className="px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-white/5 font-mono text-sm">
            Day {simulationDay}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={handleSimulateDay}
          className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[var(--primary)] text-white font-bold hover:opacity-90 transition-opacity shadow-lg"
        >
          <Play className="w-5 h-5" />
          Simulate 1 Day
        </button>
        <button 
          onClick={handleSimulateWeek}
          className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/15 transition-colors border border-white/5"
        >
          <TrendingUp className="w-5 h-5" />
          Simulate 1 Week
        </button>
        <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[var(--bg-card)] border border-white/5 text-[var(--text-muted)]">
          <Info className="w-5 h-5" />
          <span className="text-xs">Auto/Daily updates WOM daily. Weekly updates by drop rate.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {movies.map(movie => {
            const report = getMovieReport(movie);
            const isBlockbuster = report.status === 'Blockbuster';
            const isFlop = report.status === 'Flop';
            const isHit = report.status === 'Hit';
            
            return (
              <motion.div 
                key={movie.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-2xl bg-[var(--bg-card)] border border-white/5 shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{movie.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        movie.releaseType === 'auto' ? 'bg-blue-500/20 text-blue-400' :
                        movie.releaseType === 'weekly' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {movie.releaseType}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">Budget: {formatMoney(movie.budget)} • Rating: {movie.rating}/10</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isBlockbuster ? 'bg-[var(--gold)] text-black' :
                    isHit ? 'bg-green-500/20 text-green-400' :
                    isFlop ? 'bg-red-500/20 text-red-400' :
                    'bg-white/10 text-white'
                  }`}>
                    {report.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <DollarSign className="w-3 h-3" />
                      Total Collection
                    </div>
                    <p className="text-2xl font-bold text-[var(--gold)]">{formatMoney(movie.totalCollection)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <BarChart3 className="w-3 h-3" />
                      Last {movie.releaseType === 'weekly' ? 'Week' : 'Day'}
                    </div>
                    <p className="text-2xl font-bold">{formatMoney(report.lastCollection)}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <TrendingUp className="w-3 h-3" />
                      Word of Mouth
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{movie.wordOfMouth.toFixed(2)}x</p>
                      <div className="h-2 w-24 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500" 
                          style={{ width: `${((movie.wordOfMouth - 0.5) / 1.5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Chart Placeholder */}
                <div className="h-12 flex items-end gap-1 px-2 py-1 bg-white/5 rounded-lg overflow-hidden">
                  {(movie.releaseType === 'weekly' ? movie.weeklyCollection : movie.dailyCollection).slice(-20).map((val, i) => {
                    const max = Math.max(...(movie.releaseType === 'weekly' ? movie.weeklyCollection : movie.dailyCollection), 1);
                    const height = (val / max) * 100;
                    return (
                      <div 
                        key={i} 
                        className="flex-1 bg-[var(--primary)] opacity-60 rounded-t-sm" 
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>

                {movie.status === 'Completed' && !movie.isSoldToStreaming && (
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-1">
                      <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Streaming Offer</p>
                      <p className="text-sm font-bold text-blue-400">{formatMoney(calculateStreamingSalePrice(movie))}</p>
                    </div>
                    <button 
                      onClick={() => handleSellToStreaming(movie.id)}
                      className="px-4 py-2 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                    >
                      Sell to Streaming
                    </button>
                  </div>
                )}

                {movie.isSoldToStreaming && (
                  <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-blue-400">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Sold to Streaming for {formatMoney(movie.streamingSalePrice || 0)}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
