import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/gameUtils';
import { Sparkles, DollarSign, Building2, ChevronRight } from 'lucide-react';

interface SetupScreenProps {
  onComplete: () => void;
}

export function SetupScreen({ onComplete }: SetupScreenProps) {
  const { setupGame } = useGame();
  const [studioName, setStudioName] = useState('SigNify By Sike');
  const [startingCash, setStartingCash] = useState(100000000); // Default 100M

  const handleStart = () => {
    if (studioName.trim()) {
      setupGame(studioName.trim(), startingCash);
      onComplete();
    }
  };

  const cashOptions = [
    { label: '50M', value: 50000000 },
    { label: '100M', value: 100000000 },
    { label: '250M', value: 250000000 },
    { label: '500M', value: 500000000 },
    { label: '1B', value: 1000000000 },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-[var(--gold)]/10 rounded-3xl flex items-center justify-center mx-auto border border-[var(--gold)]/20">
            <Sparkles className="w-10 h-10 text-[var(--gold)]" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">STUDIO TYCOON</h1>
          <p className="text-[var(--text-muted)] text-sm">Build your cinematic empire from the ground up.</p>
        </div>

        <div className="card p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] flex items-center gap-2">
              <Building2 className="w-3 h-3" /> Studio Name
            </label>
            <input 
              type="text" 
              value={studioName} 
              onChange={(e) => setStudioName(e.target.value)}
              className="w-full bg-black/40 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:border-[var(--gold)] outline-none transition-all"
              placeholder="Enter studio name..."
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] flex items-center gap-2">
              <DollarSign className="w-3 h-3" /> Starting Capital
            </label>
            <div className="grid grid-cols-3 gap-2">
              {cashOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStartingCash(opt.value)}
                  className={`py-2 rounded-xl border text-[10px] font-bold transition-all ${startingCash === opt.value ? 'bg-[var(--gold)] text-black border-[var(--gold)]' : 'bg-black/20 border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--gold)]/50'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-center text-[var(--text-muted)] italic">
              Selected: {formatMoney(startingCash)}
            </p>
          </div>

          <Button 
            onClick={handleStart} 
            disabled={!studioName.trim()}
            className="w-full h-14 rounded-2xl bg-[var(--gold)] text-black font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            START CAREER <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-center">
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
            Version 2.0 • Production Engine Enhanced
          </p>
        </div>
      </div>
    </div>
  );
}
