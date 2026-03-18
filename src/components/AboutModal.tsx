import { Trophy, X, Github, Globe, User, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { state } = useGame();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-[var(--bg-secondary)] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-bold text-xl">About Game</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto scrollbar-thin">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-[var(--gold)] rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-[var(--gold)]/20 mb-4">
                  <Building2 className="w-10 h-10 text-black" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-[var(--gold)]">Sike Entertainment</h1>
                <p className="text-sm font-mono text-white/40">v0.0.7.0</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4 border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Developer</p>
                    <p className="font-bold">Sikandar Ali (Sike)</p>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4 border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Studio</p>
                    <p className="font-bold">SigNify By Sike</p>
                  </div>
                </div>
              </div>

              {/* Trophy Cabinet */}
              <div className="bg-[var(--gold)]/5 border border-[var(--gold)]/20 p-6 rounded-3xl text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Trophy className="w-16 h-16 text-[var(--gold)] animate-pulse" />
                    <div className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                      ELITE
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-1">Trophy Cabinet</h3>
                  <p className="text-4xl font-black">{state.studio.totalAwardsWon}</p>
                  <p className="text-sm text-white/40">Total Awards Won</p>
                </div>
              </div>

              <div className="flex justify-center gap-6 pt-4">
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="p-6 bg-white/5">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-white text-black font-black rounded-2xl hover:brightness-90 transition-all active:scale-95"
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
