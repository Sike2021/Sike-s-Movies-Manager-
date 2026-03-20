import { useGame } from '@/context/GameContext';
import { formatMoney } from '@/lib/gameUtils';
import { ChevronLeft, Building2, ArrowUpRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Screen = 'dashboard' | 'movies' | 'talent' | 'stats' | 'settings' | 'create-movie' | 'simulation';

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
  installApp?: () => void;
}

export function Settings({ onNavigate, installApp }: SettingsProps) {
  const { state, upgradeFacility, setDifficulty, resetGame } = useGame();

  const handleUpgrade = (facility: 'soundStages' | 'postProduction' | 'marketing') => {
    const costs = { soundStages: 10000000, postProduction: 7500000, marketing: 5000000 };
    if (state.studio.cash < costs[facility]) { toast.error('Insufficient funds!'); return; }
    upgradeFacility(facility);
    toast.success(`${facility} upgraded!`);
  };

  return (
    <ScrollArea className="h-screen scrollbar-thin">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2"><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="font-bold text-lg">Settings</h1>
          <div className="w-10" />
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-[var(--gold)] flex items-center justify-center">
              <Building2 className="w-7 h-7 text-black" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{state.studio.name}</h2>
              <p className="text-sm text-[var(--text-muted)]">Owned by {state.studio.owner}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3"><p className="text-xs text-[var(--text-muted)]">Level</p><p className="font-bold text-xl">{state.studio.level}</p></div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3"><p className="text-xs text-[var(--text-muted)]">Reputation</p><p className="font-bold text-xl">{state.studio.reputation}%</p></div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Facilities</h3>
          <div className="space-y-3">
            <FacilityCard name="Sound Stages" level={state.studio.facilities.soundStages} cost={10000000} canAfford={state.studio.cash >= 10000000} onUpgrade={() => handleUpgrade('soundStages')} icon="🎬" />
            <FacilityCard name="Post Production" level={state.studio.facilities.postProduction} cost={7500000} canAfford={state.studio.cash >= 7500000} onUpgrade={() => handleUpgrade('postProduction')} icon="🎨" />
            <FacilityCard name="Marketing" level={state.studio.facilities.marketing} cost={5000000} canAfford={state.studio.cash >= 5000000} onUpgrade={() => handleUpgrade('marketing')} icon="📢" />
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-3">Studio Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Total Movies</span><span>{state.movies.length}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Released</span><span>{state.movies.filter(m => m.phase === 'released').length}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">In Production</span><span>{state.movies.filter(m => m.phase !== 'released').length}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Hired Talent</span><span>{state.talents.filter(t => t.hired).length}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Franchises</span><span>{state.franchises.length}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Universes</span><span>{state.universes.length}</span></div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Game Difficulty</h3>
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setDifficulty('easy')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${state.difficulty === 'easy' ? 'bg-green-500 text-black' : 'text-white/40 hover:text-white'}`}
            >
              Easy
            </button>
            <button 
              onClick={() => setDifficulty('normal')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${state.difficulty === 'normal' ? 'bg-blue-500 text-black' : 'text-white/40 hover:text-white'}`}
            >
              Normal
            </button>
            <button 
              onClick={() => setDifficulty('hard')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${state.difficulty === 'hard' ? 'bg-red-500 text-black' : 'text-white/40 hover:text-white'}`}
            >
              Hard
            </button>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-2 px-1">
            {state.difficulty === 'easy' ? 'Rival studios are less aggressive and produce lower quality movies.' : state.difficulty === 'normal' ? 'Standard challenge with balanced rival studios.' : 'Rival studios are more aggressive and produce higher quality movies.'}
          </p>
        </div>

        {installApp && (
          <div className="card p-4 bg-[var(--gold)]/10 border-[var(--gold)]/30">
            <h3 className="font-bold text-[var(--gold)] mb-2">Install App</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">Install Movie Studio Tycoon on your home screen for a better experience.</p>
            <Button onClick={installApp} className="w-full bg-[var(--gold)] text-black font-bold hover:brightness-110">Install Now</Button>
          </div>
        )}

        <div className="pt-4 pb-8">
          <Button 
            variant="ghost" 
            className="w-full text-red-500 hover:bg-red-500/10"
            onClick={() => {
              resetGame();
              onNavigate('setup');
            }}
          >
            Start New Game
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}

function FacilityCard({ name, level, cost, canAfford, onUpgrade, icon }: { name: string; level: number; cost: number; canAfford: boolean; onUpgrade: () => void; icon: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-semibold">{name}</p>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i < level ? 'bg-[var(--gold)]' : 'bg-[var(--bg-hover)]'}`} />)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-semibold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>{formatMoney(cost)}</p>
          <Button onClick={onUpgrade} disabled={!canAfford} size="sm" className="mt-1 bg-[var(--gold)] text-black hover:brightness-110 disabled:opacity-50"><ArrowUpRight className="w-4 h-4 mr-1" /> Upgrade</Button>
        </div>
      </div>
    </div>
  );
}
