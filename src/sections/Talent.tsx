import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { formatMoney } from '@/lib/gameUtils';
import { ChevronLeft, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Screen = 'dashboard' | 'movies' | 'talent' | 'stats' | 'settings' | 'create-movie' | 'simulation';

interface TalentProps {
  onNavigate: (screen: Screen) => void;
}

export function Talent({ onNavigate }: TalentProps) {
  const { state, hireTalent, fireTalent } = useGame();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'skill' | 'fame' | 'salary'>('skill');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');

  const hiredTalent = state.talents.filter(t => t.hired);

  const filterTalent = (list: typeof state.talents) => {
    return list
      .filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGender = genderFilter === 'All' || t.gender === genderFilter;
        return matchesSearch && matchesGender;
      })
      .sort((a, b) => b[sortBy] - a[sortBy]);
  };

  const handleHire = (talent: typeof state.talents[0]) => {
    if (state.studio.cash < talent.salary) { toast.error('Insufficient funds!'); return; }
    hireTalent(talent.id);
    toast.success(`Hired ${talent.name}!`);
  };

  const handleFire = (talent: typeof state.talents[0]) => {
    fireTalent(talent.id);
    toast.success(`Released ${talent.name}`);
  };

  return (
    <ScrollArea className="h-screen scrollbar-thin">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2"><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="font-bold text-lg">Talent Roster</h1>
          <div className="w-10" />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input type="text" placeholder="Search talent..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['skill', 'fame', 'salary'] as const).map((sort) => (
            <button key={sort} onClick={() => setSortBy(sort)} className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all shrink-0 ${sortBy === sort ? 'bg-[var(--gold)] text-black' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>
              {sort}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pb-2">
          {(['All', 'Male', 'Female'] as const).map((gender) => (
            <button key={gender} onClick={() => setGenderFilter(gender)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${genderFilter === gender ? 'bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>
              {gender}
            </button>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-[var(--bg-card)] p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black">All ({state.talents.length})</TabsTrigger>
            <TabsTrigger value="hired" className="rounded-lg data-[state=active]:bg-[var(--gold)] data-[state=active]:text-black">Hired ({hiredTalent.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-3">
            {filterTalent(state.talents).map(talent => <TalentCard key={talent.id} talent={talent} isHired={talent.hired} onHire={() => handleHire(talent)} onFire={() => handleFire(talent)} canAfford={state.studio.cash >= talent.salary} />)}
          </TabsContent>

          <TabsContent value="hired" className="mt-4 space-y-3">
            {filterTalent(hiredTalent).map(talent => <TalentCard key={talent.id} talent={talent} isHired={true} onFire={() => handleFire(talent)} />)}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}

interface TalentCardProps {
  talent: { id: string; name: string; type: string; skill: number; fame: number; salary: number; bio: string };
  isHired: boolean;
  onHire?: () => void;
  onFire: () => void;
  canAfford?: boolean;
}

function TalentCard({ talent, isHired, onHire, onFire, canAfford }: TalentCardProps) {
  return (
    <div className="talent-card">
      <div className="talent-avatar">{talent.name.charAt(0)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{talent.name}</h3>
            <p className="text-xs text-[var(--text-muted)] capitalize">{talent.type}</p>
          </div>
          <div className="text-right">
            <p className="text-[var(--gold)] font-semibold">{formatMoney(talent.salary)}</p>
            <p className="text-xs text-[var(--text-muted)]">/film</p>
          </div>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1"><span className="text-[var(--text-muted)]">Skill</span><span>{talent.skill}</span></div>
            <div className="progress-track"><div className="progress-fill bg-[var(--gold)]" style={{ width: `${talent.skill}%` }} /></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1"><span className="text-[var(--text-muted)]">Fame</span><span>{talent.fame}</span></div>
            <div className="progress-track"><div className="progress-fill bg-purple-500" style={{ width: `${talent.fame}%` }} /></div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="flex-1 border-[var(--border)] text-[var(--text-secondary)]">Profile</Button>
          {isHired ? <Button variant="destructive" size="sm" className="flex-1" onClick={onFire}>Release</Button> : <Button size="sm" className="flex-1 bg-[var(--gold)] text-black hover:brightness-110" onClick={onHire} disabled={!canAfford}>{canAfford ? 'Hire' : 'Too Expensive'}</Button>}
        </div>
      </div>
    </div>
  );
}
