import { useGame } from '@/context/GameContext';
import { formatMoney } from '@/lib/gameUtils';
import { Trophy, TrendingUp, Newspaper, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SimulationPopup() {
  const { state, clearSimulationResult } = useGame();
  const result = state.lastSimulationResult;

  if (!result) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[var(--bg-secondary)] border border-[var(--gold)]/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-[var(--gold)]/10"
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[var(--gold)]/5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--gold)]" />
              <h2 className="font-bold text-lg">Simulation Report</h2>
            </div>
            <button onClick={clearSimulationResult} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
            {/* Box Office Section */}
            <section>
              <h3 className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest mb-3 flex items-center gap-2">
                <TrendingUp className="w-3 h-3" /> Box Office
              </h3>
              <div className="space-y-2">
                {result.topMovies.length > 0 ? result.topMovies.map((m, i) => (
                  <div key={m.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--gold)] font-mono text-sm">#{i+1}</span>
                      <span className="font-medium text-sm truncate max-w-[180px]">{m.title}</span>
                    </div>
                    <span className="text-green-400 font-mono text-sm">+{formatMoney(m.dailyRevenue)}</span>
                  </div>
                )) : (
                  <p className="text-sm text-white/40 italic">No movies currently in theaters.</p>
                )}
              </div>
            </section>

            {/* News Section */}
            <section>
              <h3 className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest mb-3 flex items-center gap-2">
                <Newspaper className="w-3 h-3" /> Industry News
              </h3>
              <div className="bg-white/5 p-4 rounded-xl border-l-2 border-[var(--gold)]">
                {result.news.map((n, i) => (
                  <p key={i} className="text-sm leading-relaxed italic">"{n}"</p>
                ))}
              </div>
            </section>

            {/* Awards Alerts */}
            {result.awards && (
              <section className="animate-pulse">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Trophy className="w-3 h-3" /> Award Alert
                </h3>
                <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl">
                  <p className="text-sm font-bold text-purple-300 mb-2">
                    {result.awards.type === 'nominations' ? '🏆 Nominations Announced!' : '⭐ Awards Ceremony Results!'}
                  </p>
                  <div className="space-y-2">
                    {(result.awards.nominees || result.awards.winners)?.slice(0, 5).map((a, i) => (
                      <div key={i} className="text-xs flex justify-between items-center">
                        <span className="text-white/60">{a.category}</span>
                        <span className="font-bold text-white">
                          {state.movies.find(m => m.id === a.projectId)?.title}
                        </span>
                      </div>
                    ))}
                    {(result.awards.nominees || result.awards.winners || []).length > 5 && (
                      <p className="text-[10px] text-center text-white/40 mt-2">...and more categories</p>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="p-4 bg-white/5">
            <button 
              onClick={clearSimulationResult}
              className="w-full py-3 bg-[var(--gold)] text-black font-bold rounded-xl hover:brightness-110 transition-all active:scale-95"
            >
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
