import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { GENRES, BUDGET_TIERS, type Genre, type BudgetTier, type Talent } from '@/types/game';
import { formatMoney, generateMovieTitle, getGenreColor } from '@/lib/gameUtils';
import { ChevronLeft, Check, Film, Camera, Scissors, Music, Briefcase, Sparkles, Palette, Shirt, Play, Globe, Layers, Clock, DollarSign, type LucideIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CreateMovieProps {
  onBack: () => void;
}

export function CreateMovie({ onBack }: CreateMovieProps) {
  const { state, startMovieProduction, hireTalent, createFranchise, createUniverse, getSequelData } = useGame();
  
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [genres, setGenres] = useState<Genre[]>(['Action']);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('mid');
  const [sceneCount, setSceneCount] = useState(200);
  const [scenesPerEpisode, setScenesPerEpisode] = useState(45);
  const [movieType, setMovieType] = useState<'standalone' | 'franchise' | 'sequel' | 'series' | 'special' | 'spinoff' | 'crossover' | 'teamup'>('standalone');
  const [specialType, setSpecialType] = useState<'Christmas' | 'Anniversary' | 'Mini Series' | undefined>();
  const [franchiseId, setFranchiseId] = useState('');
  const [universeId, setUniverseId] = useState('');
  const [sequelTo, setSequelTo] = useState('');
  const [season, setSeason] = useState(1);
  const [episodes, setEpisodes] = useState(10);
  
  const [releaseWeek, setReleaseWeek] = useState(1);
  const [releaseYear, setReleaseYear] = useState(state.currentYear);
  
  const [leadCast, setLeadCast] = useState<string[]>([]);
  const [director, setDirector] = useState('');
  const [writer, setWriter] = useState('');
  const [cinematographer, setCinematographer] = useState('');
  const [editor, setEditor] = useState('');
  const [composer, setComposer] = useState('');
  const [producer, setProducer] = useState('');
  const [vfxSupervisor, setVfxSupervisor] = useState('');
  const [productionDesigner, setProductionDesigner] = useState('');
  const [costumeDesigner, setCostumeDesigner] = useState('');
  
  const [showNewUniverse, setShowNewUniverse] = useState(false);
  const [newUniverseName, setNewUniverseName] = useState('');
  const [showNewFranchise, setShowNewFranchise] = useState(false);
  const [newFranchiseName, setNewFranchiseName] = useState('');
  
  const [characters, setCharacters] = useState<{ name: string, role: 'Hero' | 'Villain' | 'Sidekick' | 'Supporting' | 'Cameo', id?: string, gender?: 'Male' | 'Female' | 'Any' }[]>([
    { name: '', role: 'Hero', gender: 'Any' },
    { name: '', role: 'Villain', gender: 'Any' },
    { name: '', role: 'Sidekick', gender: 'Any' }
  ]);

  // Scene Builder Calculations
  const totalScenes = movieType === 'series' ? (scenesPerEpisode * episodes) : sceneCount;
  const estimatedRuntime = Math.floor((movieType === 'series' ? scenesPerEpisode : sceneCount) * 1.2); // 1.2 minutes per scene
  const filmingWeeks = Math.ceil(totalScenes / 8); // 8 scenes per week
  const productionCostBase = (BUDGET_TIERS[budgetTier].min + BUDGET_TIERS[budgetTier].max) / 2;
  const sceneCostMultiplier = 1 + (totalScenes / 100);
  const estimatedProductionCost = Math.floor(productionCostBase * sceneCostMultiplier);

  const castAndCrew = [
    director, writer, cinematographer, editor, composer, producer, vfxSupervisor, productionDesigner, costumeDesigner, ...leadCast
  ].map(id => state.talents.find(t => t.id === id)).filter(Boolean) as Talent[];
  
  const talentSalaries = castAndCrew.reduce((sum, t) => sum + t.salary, 0);
  const totalEstimatedBudget = estimatedProductionCost + talentSalaries;
  const canAfford = state.studio.cash >= totalEstimatedBudget;

  // Production Timeline Calculation
  // writing: 4 weeks, preProduction: 3 weeks, locations: 2 weeks, filming: filmingWeeks, postProduction: 5 weeks, marketing: 2 weeks buffer
  const totalProductionWeeks = 4 + 3 + 2 + filmingWeeks + 5 + 2;
  const suggestedWeek = ((state.currentWeek + totalProductionWeeks - 1) % 52) + 1;
  const suggestedYear = state.currentYear + Math.floor((state.currentWeek + totalProductionWeeks - 1) / 52);

  const toggleGenre = (g: Genre) => {
    if (genres.includes(g)) {
      if (genres.length > 1) setGenres(genres.filter(item => item !== g));
    } else if (genres.length < 3) {
      setGenres([...genres, g]);
    }
  };



  const handleCreateFranchise = () => {
    if (newFranchiseName.trim()) {
      const id = createFranchise(newFranchiseName.trim());
      setFranchiseId(id);
      setNewFranchiseName('');
      setShowNewFranchise(false);
      toast.success(`Created ${newFranchiseName} franchise!`);
    }
  };

  const handleCreateUniverse = () => {
    if (newUniverseName.trim()) {
      const id = createUniverse(newUniverseName.trim());
      setUniverseId(id);
      setNewUniverseName('');
      setShowNewUniverse(false);
      toast.success(`Created ${newUniverseName} universe!`);
    }
  };

  const handleSequelSelect = (parentId: string) => {
    const data = getSequelData(parentId);
    if (data) {
      setSequelTo(parentId);
      if (data.genres) setGenres(data.genres);
      if (data.director) setDirector(data.director);
      if (data.writer) setWriter(data.writer);
      if (data.leadCast) setLeadCast(data.leadCast.slice(0, 3));
      if (data.franchiseId) setFranchiseId(data.franchiseId || '');
      if (data.universeId) setUniverseId(data.universeId || '');
      if (data.characters) setCharacters(data.characters as { name: string, role: 'Hero' | 'Villain' | 'Sidekick' | 'Supporting' | 'Cameo', id?: string, gender?: 'Male' | 'Female' | 'Any' }[]);
      toast.success('Sequel data loaded!');
    }
  };

  const handleGreenlight = () => {
    if (!canAfford) { toast.error('Insufficient funds!'); return; }
    
    // Hire unhired talent
    castAndCrew.forEach(t => {
      if (!t.hired) hireTalent(t.id);
    });

    startMovieProduction({
      title: title || generateMovieTitle(genres[0]), 
      genres, 
      budgetTier, 
      leadCast, 
      supportingCast: [],
      director, 
      writer, 
      cinematographer, 
      editor, 
      composer, 
      producer, 
      vfxSupervisor, 
      productionDesigner, 
      costumeDesigner,
      sceneCount: totalScenes, 
      scenesPerEpisode: movieType === 'series' ? scenesPerEpisode : undefined,
      runtime: estimatedRuntime,
      filmingWeeks,
      movieType, 
      specialType,
      franchiseId: franchiseId || undefined, 
      universeId: universeId || undefined, 
      sequelTo: sequelTo || undefined,
      characters: characters.filter(c => c.name.trim() !== ''),
      season: movieType === 'series' ? season : undefined,
      episodes: movieType === 'series' ? episodes : undefined,
      releaseWeek,
      releaseYear,
    });
    toast.success('Production greenlit!');
    onBack();
  };

  const formatRuntime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <ScrollArea className="h-screen scrollbar-thin">
      <div className="p-4 space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2"><ChevronLeft className="w-6 h-6" /></button>
          <h1 className="font-bold text-lg">New Production</h1>
          <div className="w-10" />
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${step >= s ? 'bg-[var(--gold)] text-black' : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'}`}>
                {step > s ? <Check className="w-3 h-3" /> : s}
              </div>
              {i < 5 && <div className={`flex-1 h-0.5 mx-1 ${step > s ? 'bg-[var(--gold)]' : 'bg-[var(--bg-hover)]'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--gold)]">Basic Info</h2>
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Project Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={generateMovieTitle(genres[0])} className="input-field" />
              </div>

              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Genres (Select up to 3)</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                  {GENRES.map(g => (
                    <button 
                      key={g} 
                      onClick={() => toggleGenre(g)} 
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${genres.includes(g) ? 'bg-[var(--gold)] text-black' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]/80'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Production Type</label>
                <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'standalone', label: 'Movie', icon: Film }, 
                      { id: 'series', label: 'Series', icon: Play },
                      { id: 'special', label: 'Special', icon: Sparkles },
                      { id: 'sequel', label: 'Sequel', icon: ChevronLeft },
                      { id: 'spinoff', label: 'Spin-Off', icon: Layers },
                      { id: 'teamup', label: 'Team-Up', icon: Globe },
                      { id: 'crossover', label: 'Crossover', icon: Sparkles },
                      { id: 'franchise', label: 'Franchise', icon: Sparkles },
                    ].map(({ id, label, icon: Icon }) => (
                      <button key={id} onClick={() => setMovieType(id as 'standalone' | 'franchise' | 'sequel' | 'series' | 'special' | 'spinoff' | 'crossover' | 'teamup')} className={`p-2 rounded-xl border text-center transition-all ${movieType === id ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}>
                      <Icon className="w-4 h-4 mx-auto mb-1" /><span className="text-[10px] block truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {movieType === 'series' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--text-secondary)] mb-1 block">Season</label>
                    <input type="number" min={1} value={season} onChange={(e) => setSeason(parseInt(e.target.value))} className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-secondary)] mb-1 block">Episodes</label>
                    <input type="number" min={1} max={24} value={episodes} onChange={(e) => setEpisodes(parseInt(e.target.value))} className="input-field" />
                  </div>
                </div>
              )}

              {movieType === 'special' && (
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Special Type</label>
                  <div className="flex gap-2">
                    {['Christmas', 'Anniversary', 'Mini Series'].map(t => (
                      <button key={t} onClick={() => setSpecialType(t as 'Christmas' | 'Anniversary' | 'Mini Series')} className={`flex-1 py-2 rounded-xl border text-xs ${specialType === t ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}>{t}</button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--gold)]">Universe & Franchise</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-[var(--text-secondary)] block font-bold">Universe</label>
                  <div className="relative">
                    <select 
                      key={`universe-select-${universeId}`}
                      value={universeId} 
                      onChange={(e) => setUniverseId(e.target.value)} 
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs appearance-none focus:border-[var(--gold)] outline-none cursor-pointer"
                    >
                      <option value="" className="bg-[var(--bg-secondary)]">None</option>
                      {state.universes.map(u => <option key={u.id} value={u.id} className="bg-[var(--bg-secondary)]">{u.name}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] text-[10px]">▼</div>
                  </div>
                  {showNewUniverse ? (
                    <div className="flex gap-1 animate-in slide-in-from-top-2">
                      <input 
                        type="text" 
                        value={newUniverseName} 
                        onChange={(e) => setNewUniverseName(e.target.value)} 
                        placeholder="Universe Name..." 
                        className="flex-1 bg-black/40 border border-[var(--gold)]/30 rounded-lg px-2 py-1.5 text-[10px] focus:border-[var(--gold)] outline-none"
                        autoFocus
                      />
                      <Button onClick={handleCreateUniverse} size="sm" className="h-8 px-2 bg-[var(--gold)] text-black"><Check className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <Button onClick={() => setShowNewUniverse(true)} variant="outline" size="sm" className="w-full text-[10px] h-8 border-dashed border-[var(--gold)]/30 text-[var(--gold)] hover:bg-[var(--gold)]/10">+ New Universe</Button>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[var(--text-secondary)] block font-bold">Franchise</label>
                  <div className="relative">
                    <select 
                      key={`franchise-select-${franchiseId}`}
                      value={franchiseId} 
                      onChange={(e) => setFranchiseId(e.target.value)} 
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs appearance-none focus:border-[var(--gold)] outline-none cursor-pointer"
                    >
                      <option value="" className="bg-[var(--bg-secondary)]">None</option>
                      {state.franchises.map(f => <option key={f.id} value={f.id} className="bg-[var(--bg-secondary)]">{f.name}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] text-[10px]">▼</div>
                  </div>
                  {showNewFranchise ? (
                    <div className="flex gap-1 animate-in slide-in-from-top-2">
                      <input 
                        type="text" 
                        value={newFranchiseName} 
                        onChange={(e) => setNewFranchiseName(e.target.value)} 
                        placeholder="Franchise Name..." 
                        className="flex-1 bg-black/40 border border-[var(--gold)]/30 rounded-lg px-2 py-1.5 text-[10px] focus:border-[var(--gold)] outline-none"
                        autoFocus
                      />
                      <Button onClick={handleCreateFranchise} size="sm" className="h-8 px-2 bg-[var(--gold)] text-black"><Check className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <Button onClick={() => setShowNewFranchise(true)} variant="outline" size="sm" className="w-full text-[10px] h-8 border-dashed border-[var(--gold)]/30 text-[var(--gold)] hover:bg-[var(--gold)]/10">+ New Franchise</Button>
                  )}
                </div>
              </div>

              {movieType === 'sequel' && (
                <div className="card p-3">
                  <p className="text-xs text-[var(--text-secondary)] mb-2">Select Parent Movie</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {state.movies.filter(m => m.phase === 'released').map(m => (
                      <button key={m.id} onClick={() => handleSequelSelect(m.id)} className={`w-full p-2 rounded-lg text-left text-xs ${sequelTo === m.id ? 'bg-[var(--gold)]/20 border border-[var(--gold)]' : 'bg-[var(--bg-secondary)]'}`}>{m.title}</button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <Button onClick={() => setStep(2)} className="w-full btn-primary">Next: Cast & Characters</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--gold)]">Character Casting & Assignment</h2>
                <Button 
                  onClick={() => {
                    setCharacters([...characters, { name: '', role: 'Supporting', gender: 'Any' }]);
                    setLeadCast([...leadCast, '']);
                  }} 
                  variant="ghost" 
                  size="sm" 
                  className="text-[10px] h-7 text-[var(--gold)]"
                >
                  + Add Role
                </Button>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">Assign actors to specific character roles. You can filter actors by gender for each role.</p>
              
              <div className="space-y-4">
                {characters.map((char, i) => (
                  <div key={i} className="bg-black/20 rounded-2xl border border-[var(--border)] overflow-hidden">
                    <div className="p-3 bg-white/5 border-b border-[var(--border)] flex items-center gap-3">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={char.name} 
                          onChange={(e) => {
                            const newChars = [...characters];
                            newChars[i] = { ...newChars[i], name: e.target.value, id: undefined };
                            setCharacters(newChars);
                          }} 
                          placeholder="Character Name..." 
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-black placeholder:text-white/20" 
                        />
                      </div>
                      <div className="flex gap-1">
                        <select 
                          className="bg-black/40 text-[9px] rounded-lg px-2 py-1 border border-[var(--border)] font-bold uppercase outline-none focus:border-[var(--gold)]"
                          value={char.role}
                          onChange={(e) => {
                            const newChars = [...characters];
                            newChars[i].role = e.target.value as 'Hero' | 'Villain' | 'Sidekick' | 'Supporting' | 'Cameo';
                            setCharacters(newChars);
                          }}
                        >
                          <option value="Hero">Hero</option>
                          <option value="Villain">Villain</option>
                          <option value="Sidekick">Sidekick</option>
                          <option value="Supporting">Support</option>
                          <option value="Cameo">Cameo</option>
                        </select>
                        <select 
                          className="bg-black/40 text-[9px] rounded-lg px-2 py-1 border border-[var(--border)] font-bold uppercase outline-none focus:border-[var(--gold)]"
                          value={char.gender}
                          onChange={(e) => {
                            const newChars = [...characters];
                            newChars[i].gender = e.target.value as 'Male' | 'Female' | 'Any';
                            setCharacters(newChars);
                          }}
                        >
                          <option value="Any">Any</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-red-500/50 hover:text-red-500"
                        onClick={() => {
                          if (characters.length > 1) {
                            setCharacters(characters.filter((_, idx) => idx !== i));
                            setLeadCast(leadCast.filter((_, idx) => idx !== i));
                          }
                        }}
                      >
                        ×
                      </Button>
                    </div>

                    <div className="p-3 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] text-[var(--text-muted)] uppercase font-black tracking-widest">Assign Actor</label>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => {
                                const newChars = [...characters];
                                newChars[i].gender = 'Male';
                                setCharacters(newChars);
                              }}
                              className={`text-[8px] px-1 rounded border ${char.gender === 'Male' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-white/10 text-white/40'}`}
                            >
                              M
                            </button>
                            <button 
                              onClick={() => {
                                const newChars = [...characters];
                                newChars[i].gender = 'Female';
                                setCharacters(newChars);
                              }}
                              className={`text-[8px] px-1 rounded border ${char.gender === 'Female' ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'border-white/10 text-white/40'}`}
                            >
                              F
                            </button>
                            <button 
                              onClick={() => {
                                const newChars = [...characters];
                                newChars[i].gender = 'Any';
                                setCharacters(newChars);
                              }}
                              className={`text-[8px] px-1 rounded border ${char.gender === 'Any' ? 'bg-white/20 border-white text-white' : 'border-white/10 text-white/40'}`}
                            >
                              A
                            </button>
                          </div>
                        </div>
                        <div className="relative">
                          <select 
                            className="w-full bg-black/40 text-xs rounded-xl px-3 py-2 border border-[var(--border)] focus:border-[var(--gold)] outline-none appearance-none"
                            value={leadCast[i] || ''}
                            onChange={(e) => {
                              const newCast = [...leadCast];
                              newCast[i] = e.target.value;
                              setLeadCast(newCast);
                            }}
                          >
                            <option value="">Select Actor...</option>
                            {state.talents
                              .filter(t => t.type === 'actor' && (char.gender === 'Any' || t.gender === char.gender))
                              .sort((a, b) => b.starPower - a.starPower)
                              .map(a => (
                                <option key={a.id} value={a.id} className="bg-[var(--bg-secondary)]">
                                  {a.name} {a.hired ? '✓' : ''} • SP: {a.starPower} • ${formatMoney(a.salary)}
                                </option>
                              ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--gold)]">▼</div>
                        </div>
                      </div>

                      {state.characters.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[9px] text-[var(--text-muted)] uppercase font-black whitespace-nowrap">Or use existing:</span>
                          <div className="relative flex-1">
                            <select 
                              className="w-full bg-black/40 text-[10px] rounded-lg px-2 py-1 border border-[var(--border)] appearance-none outline-none focus:border-[var(--gold)]"
                              onChange={(e) => {
                                const existing = state.characters.find(c => c.id === e.target.value);
                                if (existing) {
                                  const newChars = [...characters];
                                  newChars[i] = { ...newChars[i], name: existing.name, id: existing.id };
                                  setCharacters(newChars);
                                }
                              }}
                            >
                              <option value="">Select Legacy Character...</option>
                              {state.characters
                                .filter(c => !universeId || c.universeId === universeId)
                                .map(c => <option key={c.id} value={c.id} className="bg-[var(--bg-secondary)]">{c.name}</option>)}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] text-[8px]">▼</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex gap-2">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button>
              <Button onClick={() => setStep(3)} className="flex-1 btn-primary">Next: Crew</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--gold)]">Key Crew</h2>
              <div className="space-y-3">
                <CrewSelect label="Director" icon={Film} value={director} onChange={setDirector} options={state.talents.filter(t => t.type === 'director')} />
                <CrewSelect label="Writer" icon={Sparkles} value={writer} onChange={setWriter} options={state.talents.filter(t => t.type === 'writer')} />
                <CrewSelect label="Cinematographer" icon={Camera} value={cinematographer} onChange={setCinematographer} options={state.talents.filter(t => t.type === 'cinematographer')} />
                <CrewSelect label="Editor" icon={Scissors} value={editor} onChange={setEditor} options={state.talents.filter(t => t.type === 'editor')} />
                <CrewSelect label="Composer" icon={Music} value={composer} onChange={setComposer} options={state.talents.filter(t => t.type === 'composer')} />
                <CrewSelect label="Producer" icon={Briefcase} value={producer} onChange={setProducer} options={state.talents.filter(t => t.type === 'producer')} />
                <CrewSelect label="VFX Supervisor" icon={Sparkles} value={vfxSupervisor} onChange={setVfxSupervisor} options={state.talents.filter(t => t.type === 'vfx')} />
                <CrewSelect label="Production Designer" icon={Palette} value={productionDesigner} onChange={setProductionDesigner} options={state.talents.filter(t => t.type === 'productionDesigner')} />
                <CrewSelect label="Costume Designer" icon={Shirt} value={costumeDesigner} onChange={setCostumeDesigner} options={state.talents.filter(t => t.type === 'costumeDesigner')} />
              </div>
            </section>

            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">Back</Button>
              <Button onClick={() => setStep(4)} className="flex-1 btn-primary">Next: Budget</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--gold)]">Budget Tier</h2>
              <div className="grid grid-cols-1 gap-3">
                {(Object.keys(BUDGET_TIERS) as BudgetTier[]).map(tier => {
                  const info = BUDGET_TIERS[tier];
                  const canAffordTier = state.studio.cash >= info.min;
                  return (
                    <button 
                      key={tier} 
                      onClick={() => canAffordTier && setBudgetTier(tier)} 
                      disabled={!canAffordTier} 
                      className={`p-4 rounded-xl border text-left transition-all ${budgetTier === tier ? 'border-[var(--gold)] bg-[var(--gold)]/10' : canAffordTier ? 'border-[var(--border)] hover:border-[var(--gold)]/50' : 'border-[var(--border)] opacity-50'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-bold capitalize text-lg">{info.label}</p>
                        {budgetTier === tier && <Check className="w-5 h-5 text-[var(--gold)]" />}
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">{formatMoney(info.min)} - {formatMoney(info.max)}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="flex gap-2">
              <Button onClick={() => setStep(3)} variant="outline" className="flex-1">Back</Button>
              <Button onClick={() => setStep(5)} className="flex-1 btn-primary">Next: Scene Builder</Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)]">
                  <Layers className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--gold)]">Step 5 — Scene Builder</h2>
              </div>
              
              <div className="card p-6 space-y-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="text-sm font-bold block">{movieType === 'series' ? 'Scenes per Episode' : 'Scene Counter'}</label>
                      <p className="text-[10px] text-[var(--text-muted)]">Determines length and complexity</p>
                    </div>
                    <span className="text-3xl font-black text-[var(--gold)] tabular-nums">{movieType === 'series' ? scenesPerEpisode : sceneCount}</span>
                  </div>
                  
                  <div className="relative h-12 flex items-center">
                    <input 
                      type="range" 
                      min={10} 
                      max={movieType === 'series' ? 150 : 400} 
                      step={1} 
                      value={movieType === 'series' ? scenesPerEpisode : sceneCount} 
                      onChange={(e) => movieType === 'series' ? setScenesPerEpisode(parseInt(e.target.value)) : setSceneCount(parseInt(e.target.value))} 
                      className="w-full h-2 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--gold)]"
                    />
                  </div>
                  
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">
                    <span>{movieType === 'series' ? 'Short (10)' : 'Short (10)'}</span>
                    <span>{movieType === 'series' ? 'Standard (45)' : 'Standard (200)'}</span>
                    <span>{movieType === 'series' ? 'Max (150)' : 'Epic (400)'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border)] flex flex-col items-center text-center">
                    <Clock className="w-5 h-5 text-[var(--gold)] mb-2" />
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest mb-1">{movieType === 'series' ? 'Runtime per Ep' : 'Estimated Runtime'}</span>
                    <p className="text-xl font-black text-white">{formatRuntime(estimatedRuntime)}</p>
                  </div>
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border)] flex flex-col items-center text-center">
                    <Film className="w-5 h-5 text-[var(--gold)] mb-2" />
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest mb-1">Filming Duration</span>
                    <p className="text-xl font-black text-white">{filmingWeeks} Weeks</p>
                  </div>
                </div>

                <div className="bg-[var(--gold)]/5 p-5 rounded-2xl border-2 border-dashed border-[var(--gold)]/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[var(--gold)]" />
                      <span className="text-xs uppercase font-black tracking-widest text-[var(--gold)]">Production Cost</span>
                    </div>
                    <span className="text-2xl font-black text-[var(--gold)]">{formatMoney(estimatedProductionCost)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--gold)]" style={{ width: `${((movieType === 'series' ? scenesPerEpisode : sceneCount) / (movieType === 'series' ? 150 : 400)) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-[var(--gold)]/60 mt-3 text-center font-medium">
                    Cost scales with {budgetTier} tier and {totalScenes} total scenes
                  </p>
                </div>
              </div>
            </section>

            <div className="flex gap-3">
              <Button onClick={() => setStep(4)} variant="outline" className="flex-1 h-12 rounded-xl border-[var(--border)]">Back</Button>
              <Button 
                onClick={() => {
                  setReleaseWeek(suggestedWeek);
                  setReleaseYear(suggestedYear);
                  setStep(6);
                }} 
                className="flex-1 btn-primary h-12 rounded-xl text-lg font-bold"
              >
                Next: Review
              </Button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-fade-in">
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--gold)]">Final Review</h2>
              
              <div className="card p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-2xl">{title || generateMovieTitle(genres[0])}</h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {genres.map(g => (
                      <span key={g} className="px-2 py-0.5 rounded-full text-[10px] font-bold border" style={{ borderColor: getGenreColor(g), color: getGenreColor(g), backgroundColor: `${getGenreColor(g)}10` }}>{g}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <ReviewItem label="Type" value={movieType} />
                  <ReviewItem label="Budget Tier" value={budgetTier} />
                  <ReviewItem label="Total Scenes" value={totalScenes} />
                  <ReviewItem label={movieType === 'series' ? 'Runtime per Ep' : 'Runtime'} value={formatRuntime(estimatedRuntime)} />
                  <ReviewItem label="Filming" value={`${filmingWeeks} Weeks`} />
                  <ReviewItem label="Universe" value={state.universes.find(u => u.id === universeId)?.name || 'None'} />
                </div>

                <div className="pt-4 border-t border-[var(--border)] space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--gold)]">Release Date Selection</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Release Week</label>
                      <select 
                        value={releaseWeek} 
                        onChange={(e) => setReleaseWeek(Number(e.target.value))}
                        className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-2 text-sm focus:outline-none focus:border-[var(--gold)]"
                      >
                        {Array.from({ length: 52 }, (_, i) => i + 1).map(w => (
                          <option key={w} value={w}>Week {w}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Release Year</label>
                      <select 
                        value={releaseYear} 
                        onChange={(e) => setReleaseYear(Number(e.target.value))}
                        className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-2 text-sm focus:outline-none focus:border-[var(--gold)]"
                      >
                        {[state.currentYear, state.currentYear + 1, state.currentYear + 2, state.currentYear + 3].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] italic">
                    * Suggested release: Week {suggestedWeek}, {suggestedYear} (based on {totalProductionWeeks} weeks production)
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">Total Estimated Budget</p>
                      <p className={`text-2xl font-bold ${canAfford ? 'text-[var(--gold)]' : 'text-red-500'}`}>{formatMoney(totalEstimatedBudget)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--text-muted)]">Studio Cash</p>
                      <p className="font-bold">{formatMoney(state.studio.cash)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {!canAfford && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">!</div>
                  <p className="text-red-400 text-xs">Insufficient funds to greenlight this production. You need an additional {formatMoney(totalEstimatedBudget - state.studio.cash)}.</p>
                </div>
              )}
            </section>

            <div className="flex gap-2">
              <Button onClick={() => setStep(5)} variant="outline" className="flex-1">Back</Button>
              <Button onClick={handleGreenlight} disabled={!canAfford} className="flex-1 btn-primary flex items-center justify-center gap-2 h-12 text-lg"><Film className="w-5 h-5" /> Greenlight</Button>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function ReviewItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div>
      <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">{label}</p>
      <p className="font-semibold capitalize">{value}</p>
    </div>
  );
}

function CrewSelect({ label, icon: Icon, value, onChange, options }: { label: string; icon: LucideIcon; value: string; onChange: (v: string) => void; options: Talent[] }) {
  const selected = options.find(o => o.id === value);
  return (
    <div className="card p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)]"><Icon className="w-5 h-5" /></div>
        <div>
          <p className="font-medium text-sm">{label}</p>
          <p className="text-[10px] text-[var(--text-muted)]">{selected ? selected.name : 'Tap to assign'}</p>
          {selected && (
            <div className="flex gap-2 mt-0.5">
              <span className="text-[8px] text-[var(--gold)]">SP: {selected.starPower}</span>
              <span className="text-[8px] text-[var(--text-muted)]">${formatMoney(selected.salary)}</span>
            </div>
          )}
        </div>
      </div>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-2 py-1 text-xs outline-none focus:border-[var(--gold)]"
      >
        <option value="">Select...</option>
        {options
          .sort((a, b) => b.starPower - a.starPower)
          .map(o => (
            <option key={o.id} value={o.id}>
              {o.name} {o.hired ? '✓' : ''} • SP: {o.starPower} • ${formatMoney(o.salary)}
            </option>
          ))}
      </select>
    </div>
  );
}
