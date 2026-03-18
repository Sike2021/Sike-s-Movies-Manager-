import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { GameState, Movie, Talent, Genre, ProductionPhase, BudgetTier, Franchise, Universe, DailyBoxOffice, Notification, MarketTrend, GameEvent, Continent, ContinentRelease, Character, RivalMovie, AwardType, ReleaseStrategy } from '@/types/game';
import { GENRES, BUDGET_TIERS, PHASE_DURATIONS } from '@/types/game';
import { generateTalentPool, generateMovieTitle, generateFranchiseColors, generateRivalMovie, formatMoney } from '@/lib/gameUtils';

interface GameContextType {
  state: GameState;
  startMovieProduction: (config: MovieConfig) => void;
  hireTalent: (talentId: string) => void;
  fireTalent: (talentId: string) => void;
  setGameSpeed: (speed: number) => void;
  simulateTime: (weeks: number) => void;
  upgradeFacility: (facility: 'soundStages' | 'postProduction' | 'marketing') => void;
  createFranchise: (name: string) => string;
  createUniverse: (name: string) => string;
  setupGame: (studioName: string, startingCash: number) => void;
  getSequelData: (parentId: string) => Partial<MovieConfig> | null;
  extendTheatricalRun: (movieId: string) => void;
  reReleaseMovie: (movieId: string) => void;
  holdMovieRelease: (movieId: string, hold: boolean) => void;
  updateReleaseDate: (movieId: string, week: number, year: number) => void;
  setContinentReleases: (movieId: string, releases: ContinentRelease[], strategy: ReleaseStrategy) => void;
}

interface MovieConfig {
  title: string;
  genres: Genre[];
  budgetTier: BudgetTier;
  leadCast: string[];
  supportingCast: string[];
  director?: string;
  writer?: string;
  cinematographer?: string;
  editor?: string;
  composer?: string;
  producer?: string;
  vfxSupervisor?: string;
  productionDesigner?: string;
  costumeDesigner?: string;
  sceneCount: number;
  runtime: number;
  filmingWeeks: number;
  movieType: 'standalone' | 'franchise' | 'sequel' | 'teamup' | 'series' | 'special' | 'spinoff' | 'crossover';
  specialType?: 'Christmas' | 'Anniversary' | 'Mini Series';
  franchiseId?: string;
  universeId?: string;
  sequelTo?: string;
  characters: { name: string, role: 'Hero' | 'Villain' | 'Sidekick' | 'Supporting' | 'Cameo', id?: string, gender?: 'Male' | 'Female' | 'Any' }[];
  season?: number;
  episodes?: number;
  scenesPerEpisode?: number;
  releaseWeek?: number;
  releaseYear?: number;
}

type GameAction =
  | { type: 'SETUP_GAME'; studioName: string; startingCash: number }
  | { type: 'TICK'; days: number }
  | { type: 'START_MOVIE'; movie: Movie; newCharacters: Character[] }
  | { type: 'HIRE_TALENT'; talentId: string; cost: number }
  | { type: 'FIRE_TALENT'; talentId: string }
  | { type: 'SET_GAME_SPEED'; speed: number }
  | { type: 'UPDATE_MARKET_TRENDS' }
  | { type: 'ADD_NOTIFICATION'; notification: Notification }
  | { type: 'ADD_REVENUE'; amount: number }
  | { type: 'UPDATE_REPUTATION'; amount: number }
  | { type: 'UPGRADE_FACILITY'; facility: 'soundStages' | 'postProduction' | 'marketing'; cost: number }
  | { type: 'MARK_MOVIE_NOTIFIED'; movieId: string }
  | { type: 'CREATE_FRANCHISE'; franchise: Franchise }
  | { type: 'CREATE_UNIVERSE'; universe: Universe }
  | { type: 'EXTEND_THEATRICAL_RUN'; movieId: string; cost: number }
  | { type: 'RE_RELEASE_MOVIE'; movieId: string; boxOffice: Movie['boxOffice'] }
  | { type: 'HOLD_MOVIE_RELEASE'; movieId: string; hold: boolean }
  | { type: 'UPDATE_RELEASE_DATE'; movieId: string; week: number; year: number }
  | { type: 'SET_CONTINENT_RELEASES'; movieId: string; releases: ContinentRelease[]; strategy: ReleaseStrategy }
  | { type: 'ADD_RIVAL_MOVIE'; movie: RivalMovie };

const initialState: GameState = {
  studio: { name: 'SigNify By Sike', owner: 'Sikandar', level: 1, reputation: 50, cash: 50000000, totalRevenue: 0, facilities: { soundStages: 2, postProduction: 2, marketing: 2 } },
  movies: [],
  talents: generateTalentPool(),
  characters: [],
  franchises: [],
  universes: [],
  marketTrends: GENRES.map(genre => ({ genre, popularity: 80 + Math.random() * 40, trend: (Math.random() > 0.5 ? 'rising' : 'falling') as 'rising' | 'falling' | 'stable' })),
  events: [
    { id: 'holiday', name: 'Holiday Season', description: '+25% Box Office', week: 52, multiplier: 1.25 },
    { id: 'summer', name: 'Summer Blockbuster', description: '+20% Action/Superhero', week: 26, multiplier: 1.2 },
    { id: 'cannes', name: 'Cannes Festival', description: 'Prestige + Awards', week: 20, multiplier: 1.1 },
  ],
  rivalStudios: [
    { id: 'neflex', name: 'Neflex', reputation: 80, totalBoxOffice: 0, moviesReleased: 0 },
    { id: 'sonye', name: 'Sonye', reputation: 75, totalBoxOffice: 0, moviesReleased: 0 },
    { id: 'amazing', name: 'Amazing Studio', reputation: 70, totalBoxOffice: 0, moviesReleased: 0 },
    { id: 'dinsiy', name: 'Dinsiy WC', reputation: 90, totalBoxOffice: 0, moviesReleased: 0 },
    { id: 'paramountain', name: 'Paramountain', reputation: 65, totalBoxOffice: 0, moviesReleased: 0 },
    { id: 'warner', name: 'Warner Sister', reputation: 70, totalBoxOffice: 0, moviesReleased: 0 },
    { id: 'universal', name: 'Universal Studio', reputation: 75, totalBoxOffice: 0, moviesReleased: 0 },
    { id: 'a24', name: 'A24 Indie', reputation: 85, totalBoxOffice: 0, moviesReleased: 0 },
    { id: 'lionsgate', name: 'Lions Gate', reputation: 60, totalBoxOffice: 0, moviesReleased: 0 },
    { id: 'mgm', name: 'MGM Lion', reputation: 65, totalBoxOffice: 0, moviesReleased: 0 },
    { id: 'blumhouse', name: 'Blumhouse Horror', reputation: 70, totalBoxOffice: 0, moviesReleased: 0 },
  ],
  rivalMovies: [],
  currentDate: new Date(2024, 0, 1),
  currentWeek: 1,
  currentYear: 2024,
  gameSpeed: 0,
  notifications: [],
};

function calculateBoxOffice(movie: Movie, marketTrends: MarketTrend[], events: GameEvent[], currentWeek: number): Movie['boxOffice'] {
  const avgQuality = Object.values(movie.quality).reduce((a, b) => a + b, 0) / 9;
  
  // Calculate trend multiplier based on all genres
  const genrePopularity = movie.genres.reduce((sum, g) => {
    const trend = marketTrends.find(t => t.genre === g);
    return sum + (trend ? trend.popularity : 100);
  }, 0) / (movie.genres.length || 1);
  
  const trendMultiplier = genrePopularity / 100;
  
  const activeEvent = events.find(e => e.week === currentWeek);
  const eventMultiplier = activeEvent ? activeEvent.multiplier : 1;

  const qualityMultiplier = 1 + (avgQuality / 150);
  const reReleaseMultiplier = movie.isReRelease ? 0.15 : 1;
  const awardMultiplier = 1 + (movie.awards.length * 0.1); 
  const studioMultiplier = 1 + (movie.studioReputationAtRelease ? movie.studioReputationAtRelease / 200 : 0.5); // Reputation boost
  
  const baseRevenue = movie.budget * 2.5 * qualityMultiplier * trendMultiplier * eventMultiplier * reReleaseMultiplier * awardMultiplier * studioMultiplier * (0.8 + Math.random() * 0.4);
  const domestic = baseRevenue * 0.4;
  const international = baseRevenue * 0.6;
  const total = domestic + international;
  
  const daily: DailyBoxOffice[] = [];
  const releaseDate = new Date(movie.releaseDate || new Date());
  
  for (let day = 1; day <= 140; day++) {
    const currentDate = new Date(releaseDate);
    currentDate.setDate(currentDate.getDate() + day - 1);
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    let dayMultiplier = day <= 3 ? 3 : day <= 7 ? 1.8 : day <= 14 ? 0.9 : day <= 21 ? 0.5 : day <= 70 ? 0.25 : 0.1;
    if (isWeekend) dayMultiplier *= 1.6;
    
    const dayRevenue = (total / 30) * dayMultiplier;
    daily.push({ day, date: currentDate, domestic: Math.round(dayRevenue * 0.4), international: Math.round(dayRevenue * 0.6), total: Math.round(dayRevenue), weekend: isWeekend });
  }
  
  return { domestic: Math.round(domestic), international: Math.round(international), total: Math.round(total), daily, openingWeekend: Math.round(daily.slice(0, 3).reduce((s, d) => s + d.total, 0)) };
}

function calculateContinentBoxOffice(movie: Movie, continent: Continent, marketingBudget: number, marketTrends: MarketTrend[], events: GameEvent[], currentWeek: number): ContinentRelease['boxOffice'] {
  const avgQuality = Object.values(movie.quality).reduce((a, b) => a + b, 0) / 9;
  
  const genrePopularity = movie.genres.reduce((sum, g) => {
    const trend = marketTrends.find(t => t.genre === g);
    return sum + (trend ? trend.popularity : 100);
  }, 0) / (movie.genres.length || 1);
  
  const trendMultiplier = genrePopularity / 100;
  const activeEvent = events.find(e => e.week === currentWeek);
  const eventMultiplier = activeEvent ? activeEvent.multiplier : 1;

  const qualityMultiplier = 1 + (avgQuality / 150);
  
  // Strategy multipliers
  let strategyMultiplier = 1;
  if (movie.releaseStrategy === 'express') strategyMultiplier = 0.85; // -15% hype
  if (movie.releaseStrategy === 'tentpole') strategyMultiplier = 1.2; // +20% reach

  // Marketing boost: more budget = more revenue, but with diminishing returns
  const marketingMultiplier = (0.5 + Math.min(1.5, (marketingBudget / (movie.budget * 0.1 + 1000000)))) * strategyMultiplier; 
  
  // Continent-specific bonuses
  let continentBonus = 1;
  if (continent === 'South America') continentBonus = 1.15; // Viral potential boost to base revenue
  if (continent === 'Africa' || continent === 'Oceania') continentBonus = 1.1; // Passive income boost

  const awardMultiplier = 1 + (movie.awards.length * 0.1); 
  const studioMultiplier = 1 + (movie.studioReputationAtRelease ? movie.studioReputationAtRelease / 200 : 0.5);
  
  const continentMultipliers: Record<Continent, number> = {
    'North America': 1.2,
    'Europe': 1.0,
    'Asia': 1.3,
    'South America': 0.6,
    'Africa': 0.3,
    'Oceania': 0.2
  };
  
  const baseRevenue = movie.budget * 0.8 * qualityMultiplier * trendMultiplier * eventMultiplier * marketingMultiplier * awardMultiplier * studioMultiplier * continentMultipliers[continent] * continentBonus * (0.8 + Math.random() * 0.4);
  
  const daily: DailyBoxOffice[] = [];
  
  // Longevity bonus for Asia
  let dropRate = 1;
  if (continent === 'Asia') dropRate = 0.85; // Slower drop off

  // Opening weekend boost for North America
  let openingBoost = 1;
  if (continent === 'North America') openingBoost = 1.4;

  for (let day = 1; day <= 140; day++) {
    let dayMultiplier = day <= 3 ? 3 * openingBoost : day <= 7 ? 1.8 : day <= 14 ? 0.9 : day <= 21 ? 0.5 : day <= 70 ? 0.25 : 0.1;
    
    // Apply drop rate for days after opening weekend
    if (day > 3) {
      dayMultiplier *= Math.pow(dropRate, Math.floor((day - 3) / 7));
    }

    const dayRevenue = (baseRevenue / 30) * dayMultiplier;
    daily.push({ day, date: new Date(), domestic: Math.round(dayRevenue * 0.5), international: Math.round(dayRevenue * 0.5), total: Math.round(dayRevenue), weekend: false });
  }
  
  return { total: Math.round(baseRevenue), daily };
}

function calculateReviews(movie: Movie): Movie['reviews'] {
  const q = movie.quality;
  
  // Europe bonus for reviews
  let reviewBonus = 0;
  if (movie.continentReleases) {
    const europeRelease = movie.continentReleases.find(r => r.continent === 'Europe');
    if (europeRelease && europeRelease.marketingBudget > 0) {
      reviewBonus = Math.min(10, (europeRelease.marketingBudget / (movie.budget * 0.05 + 500000)) * 5);
    }
  }

  const criticScore = Math.min(100, q.script * 0.2 + q.acting * 0.2 + q.direction * 0.15 + q.cinematography * 0.1 + q.editing * 0.1 + q.music * 0.05 + q.production * 0.1 + q.marketing * 0.05 + q.vfx * 0.05 + reviewBonus + (Math.random() * 10 - 5));
  const audienceScore = Math.min(100, q.acting * 0.25 + q.script * 0.15 + q.production * 0.2 + q.direction * 0.1 + q.music * 0.1 + q.vfx * 0.1 + q.cinematography * 0.05 + q.editing * 0.05 + (Math.random() * 15 - 7.5));
  return { critic: Math.round(criticScore), audience: Math.round(audienceScore) };
}

function calculateAwards(movie: Movie): AwardType[] {
  const awards: AwardType[] = [];
  const reviews = movie.reviews;
  if (!reviews) return [];

  // Logic for different award types
  // Oscars: High critic score, usually for Drama/History/Biopic
  const isPrestige = movie.genres.some(g => ['Drama', 'History', 'Biopic', 'War'].includes(g));
  if (reviews.critic >= 90 && (isPrestige || Math.random() > 0.7)) awards.push('Oscar');
  
  // Emmys: For series
  if (movie.movieType === 'series' && reviews.critic >= 85) awards.push('Emmy');
  
  // Golden Globes: Mix of critic and audience appeal
  if (reviews.critic >= 82 && reviews.audience >= 80) awards.push('Golden Globe');
  
  // Critics Choice: Purely critic based
  if (reviews.critic >= 80) awards.push('Critics Choice');

  return awards;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SETUP_GAME':
      return {
        ...state,
        studio: {
          ...state.studio,
          name: action.studioName,
          cash: action.startingCash,
          totalRevenue: 0,
          reputation: 50,
          level: 1
        }
      };
    case 'TICK': {
      let currentState = { ...state };
      for (let i = 0; i < action.days; i++) {
        const newDate = new Date(currentState.currentDate);
        newDate.setDate(newDate.getDate() + 1);
        const daysSinceStart = Math.floor((newDate.getTime() - new Date(2024, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
        const newWeek = Math.floor(daysSinceStart / 7) + 1;
        const newYear = 2024 + Math.floor((newWeek - 1) / 52);
        
        let reputationBoost = 0;
        const updatedMovies = currentState.movies.map(movie => {
          if (movie.phase === 'released') {
            // Update continent-specific box office if applicable
            if (movie.continentReleases) {
              let movieUpdated = false;
              const updatedReleases = movie.continentReleases.map(release => {
                if (!release.released) {
                  const isReady = release.releaseWeek && release.releaseYear && (newYear > release.releaseYear || (newYear === release.releaseYear && newWeek >= release.releaseWeek));
                  if (isReady) {
                    const boxOffice = calculateContinentBoxOffice(movie, release.continent, release.marketingBudget, currentState.marketTrends, currentState.events, currentState.currentWeek);
                    movieUpdated = true;
                    return { ...release, released: true, boxOffice };
                  }
                }
                return release;
              });

              if (movieUpdated) {
                const totalBoxOffice = updatedReleases.reduce((sum, r) => sum + r.boxOffice.total, 0);
                return { 
                  ...movie, 
                  continentReleases: updatedReleases,
                  boxOffice: {
                    domestic: totalBoxOffice * 0.4,
                    international: totalBoxOffice * 0.6,
                    total: totalBoxOffice,
                    daily: [], // Aggregate daily if needed, but keeping it simple for now
                    openingWeekend: totalBoxOffice * 0.2
                  }
                };
              }
            }
            
            const daysReleased = movie.boxOffice?.daily.length || 0;
            const maxDays = movie.theatricalWeeks * 7;
            if (daysReleased > maxDays) return movie;
            return movie;
          }
          
          // If held, don't progress beyond marketing 100%
          if (movie.isHeld && movie.phase === 'marketing' && movie.progress >= 100) {
            return movie;
          }

          // NEW: If post-production is done but no release date is set, stay at 100%
          if (movie.phase === 'postProduction' && movie.progress >= 100 && (!movie.releaseWeek || !movie.releaseYear)) {
            return movie;
          }

          const phaseDuration = movie.phase === 'filming' ? movie.filmingWeeks * 7 : PHASE_DURATIONS[movie.phase];
          const newDaysInPhase = movie.daysInPhase + 1;
          let newProgress = Math.min(100, (newDaysInPhase / phaseDuration) * 100);
          
          // Special handling for marketing to ensure it hits 100% at release
          if (movie.phase === 'marketing' && movie.releaseWeek && movie.releaseYear) {
            const isReleaseDay = (newYear > movie.releaseYear || (newYear === movie.releaseYear && newWeek >= movie.releaseWeek));
            if (isReleaseDay) newProgress = 100;
            else newProgress = Math.min(99, newProgress); // Stay at 99 until release
          }
          
          if (newProgress >= 100) {
            const phases: ProductionPhase[] = ['writing', 'preProduction', 'locations', 'filming', 'postProduction', 'marketing', 'released'];
            const currentIndex = phases.indexOf(movie.phase);
            const nextPhase = phases[currentIndex + 1];
            
            if (movie.phase === 'postProduction' && newProgress >= 100) {
              // Only notify once
              if (!movie.releaseWeek) {
                currentState.notifications.push({
                  id: `post-done-${movie.id}`,
                  type: 'success',
                  title: 'Post-Production Complete',
                  message: `${movie.title} is ready for release! Set your global distribution strategy.`,
                  date: newDate,
                  read: false
                });
              }
            }

            if (nextPhase === 'released') {
              // Check if it's the right week/year to release (Legacy or first continent)
              const hasContinentReleases = movie.continentReleases && movie.continentReleases.length > 0;
              const isReadyToRelease = hasContinentReleases 
                ? movie.continentReleases?.some(r => r.releaseWeek && r.releaseYear && (newYear > r.releaseYear || (newYear === r.releaseYear && newWeek >= r.releaseWeek)))
                : movie.releaseWeek && movie.releaseYear && (newYear > movie.releaseYear || (newYear === movie.releaseYear && newWeek >= movie.releaseWeek));
              
              if (!isReadyToRelease) {
                return { ...movie, progress: 100, daysInPhase: newDaysInPhase };
              }
              
              if (movie.isHeld) {
                return { ...movie, progress: 100, daysInPhase: newDaysInPhase };
              }

              let boxOffice: Movie['boxOffice'];
              let continentReleases = movie.continentReleases;

              if (hasContinentReleases) {
                continentReleases = movie.continentReleases!.map(r => {
                  const isReady = r.releaseWeek && r.releaseYear && (newYear > r.releaseYear || (newYear === r.releaseYear && newWeek >= r.releaseWeek));
                  if (isReady && !r.released) {
                    const bo = calculateContinentBoxOffice(movie, r.continent, r.marketingBudget, currentState.marketTrends, currentState.events, currentState.currentWeek);
                    return { ...r, released: true, boxOffice: bo };
                  }
                  return r;
                });
                const total = continentReleases.reduce((sum, r) => sum + (r.boxOffice?.total || 0), 0);
                boxOffice = {
                  domestic: total * 0.4,
                  international: total * 0.6,
                  total: total,
                  daily: [],
                  openingWeekend: total * 0.2
                };
              } else {
                boxOffice = calculateBoxOffice(movie, currentState.marketTrends, currentState.events, currentState.currentWeek);
              }

              const reviews = calculateReviews(movie);
              const movieWithReviews = { ...movie, reviews };
              const awards = calculateAwards(movieWithReviews as Movie);
              
              // Awards impact reputation immediately
              reputationBoost += awards.length * 2;
              
              return { ...movie, phase: 'released' as const, progress: 100, releaseDate: newDate, boxOffice, reviews, awards, studioReputationAtRelease: currentState.studio.reputation, continentReleases };
            }
            return { ...movie, phase: nextPhase as ProductionPhase, progress: 0, daysInPhase: 0 };
          }
          return { ...movie, progress: newProgress, daysInPhase: newDaysInPhase };
        });

        // Rival Studio Logic: Check for releases every week (Sunday)
        const newRivalMovies = [...currentState.rivalMovies];
        let newRivalStudios = [...currentState.rivalStudios];
        
        if (newDate.getDay() === 0) { // Sunday
          newRivalStudios = newRivalStudios.map(studio => {
            const weeksLeft = 52 - (newWeek % 52 || 52);
            const neededForMin = Math.max(0, 3 - studio.moviesReleased);
            const canReleaseMore = studio.moviesReleased < 20;
            
            let releaseChance = 0.1 + (studio.reputation / 1000); 
            if (neededForMin > 0 && weeksLeft <= neededForMin) releaseChance = 0.8; 
            if (!canReleaseMore) releaseChance = 0;

            if (Math.random() < releaseChance) {
              const rivalMovie = generateRivalMovie(newWeek, newYear);
              rivalMovie.studioName = studio.name;
              rivalMovie.id = `rival-${Date.now()}-${studio.id}-${Math.random().toString(36).slice(2, 11)}`;
              
              newRivalMovies.push(rivalMovie);
              
              if (rivalMovie.quality > 85 || rivalMovie.boxOffice > 300000000) {
                currentState.notifications.push({
                  id: `rival-note-${rivalMovie.id}`,
                  type: 'info',
                  title: 'Rival Blockbuster!',
                  message: `${studio.name} released "${rivalMovie.title}". It's a massive hit!`,
                  date: newDate,
                  read: false
                });
              }

              return { ...studio, moviesReleased: studio.moviesReleased + 1, totalBoxOffice: studio.totalBoxOffice + rivalMovie.boxOffice };
            }
            return studio;
          });
          
          if (newWeek % 52 === 1 && newDate.getMonth() === 0 && newDate.getDate() <= 7) {
            newRivalStudios = newRivalStudios.map(s => ({ ...s, moviesReleased: 0 }));
          }
        }
        
        const streamingRevenue = updatedMovies.filter(m => m.phase === 'released' && m.boxOffice).reduce((sum, m) => sum + (m.boxOffice!.total * 0.0005), 0);
        
        currentState = { 
          ...currentState, 
          currentDate: newDate, 
          currentWeek: newWeek, 
          currentYear: newYear, 
          movies: updatedMovies,
          rivalMovies: newRivalMovies.slice(-100),
          rivalStudios: newRivalStudios,
          studio: { 
            ...currentState.studio, 
            cash: currentState.studio.cash + streamingRevenue, 
            totalRevenue: currentState.studio.totalRevenue + streamingRevenue,
            reputation: Math.min(100, currentState.studio.reputation + reputationBoost)
          } 
        };
      }
      return currentState;
    }
    case 'START_MOVIE': {
      const updatedMovies = [...state.movies];
      const updatedCharacters = [...state.characters];
      let updatedFranchises = [...state.franchises];
      let updatedUniverses = [...state.universes];

      const finalMovie = { ...action.movie };
      
      // If it's a new franchise movie but no franchiseId is set, create one
      if (finalMovie.movieType === 'franchise' && !finalMovie.franchiseId) {
        const existingFranchise = updatedFranchises.find(f => f.name === `${finalMovie.title} Franchise`);
        if (!existingFranchise) {
          const newFranchiseId = `franchise-${Date.now()}`;
          const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#E5E4E2', '#B87333'];
          const newFranchise: Franchise = {
            id: newFranchiseId,
            name: `${finalMovie.title} Franchise`,
            movies: [finalMovie.id],
            characters: [],
            totalBoxOffice: 0,
            active: true,
            color: colors[updatedFranchises.length % colors.length]
          };
          updatedFranchises.push(newFranchise);
          finalMovie.franchiseId = newFranchiseId;
        } else {
          finalMovie.franchiseId = existingFranchise.id;
          updatedFranchises = updatedFranchises.map(f => f.id === existingFranchise.id ? { ...f, movies: [...f.movies, finalMovie.id] } : f);
        }
      }
      
      updatedMovies.push(finalMovie);
      
      // Add new characters to memory
      action.newCharacters.forEach(char => {
        if (!updatedCharacters.find(c => c.id === char.id)) {
          updatedCharacters.push({ ...char, universeId: finalMovie.universeId });
        }
      });

      // Update Universe if applicable
      if (finalMovie.universeId) {
        updatedUniverses = updatedUniverses.map(u => 
          u.id === finalMovie.universeId 
            ? { ...u, productions: [...u.productions, finalMovie.id] }
            : u
        );
      }

      // Update Franchise if applicable
      if (finalMovie.franchiseId) {
        updatedFranchises = updatedFranchises.map(f => 
          f.id === finalMovie.franchiseId 
            ? { ...f, movies: Array.from(new Set([...f.movies, finalMovie.id])) }
            : f
        );
      }

      return { 
        ...state, 
        movies: updatedMovies, 
        characters: updatedCharacters,
        universes: updatedUniverses,
        franchises: updatedFranchises,
        studio: { ...state.studio, cash: state.studio.cash - finalMovie.budget } 
      };
    }
    case 'HIRE_TALENT':
      return { ...state, studio: { ...state.studio, cash: state.studio.cash - action.cost }, talents: state.talents.map(t => t.id === action.talentId ? { ...t, hired: true } : t) };
    case 'FIRE_TALENT':
      return { ...state, talents: state.talents.map(t => t.id === action.talentId ? { ...t, hired: false } : t) };
    case 'SET_GAME_SPEED':
      return { ...state, gameSpeed: action.speed };
    case 'UPDATE_MARKET_TRENDS':
      return { ...state, marketTrends: state.marketTrends.map(t => { const change = (Math.random() - 0.5) * 20; return { ...t, popularity: Math.max(20, Math.min(200, t.popularity + change)), trend: change > 0 ? 'rising' : change < 0 ? 'falling' : 'stable' }; }) };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications].slice(0, 50) };
    case 'ADD_REVENUE':
      return { ...state, studio: { ...state.studio, cash: state.studio.cash + action.amount, totalRevenue: state.studio.totalRevenue + action.amount } };
    case 'UPDATE_REPUTATION':
      return { ...state, studio: { ...state.studio, reputation: Math.max(0, Math.min(100, state.studio.reputation + action.amount)) } };
    case 'UPGRADE_FACILITY':
      return {
        ...state,
        studio: {
          ...state.studio,
          cash: state.studio.cash - action.cost,
          reputation: Math.min(100, state.studio.reputation + 2),
          facilities: {
            ...state.studio.facilities,
            [action.facility]: state.studio.facilities[action.facility] + 1
          }
        }
      };
    case 'MARK_MOVIE_NOTIFIED':
      return {
        ...state,
        movies: state.movies.map(m => m.id === action.movieId ? { ...m, awards: [...m.awards, 'notified'] } : m)
      };
    case 'CREATE_FRANCHISE':
      return { ...state, franchises: [...state.franchises, action.franchise] };
    case 'CREATE_UNIVERSE':
      return { ...state, universes: [...state.universes, action.universe] };
    case 'EXTEND_THEATRICAL_RUN':
      return {
        ...state,
        studio: { ...state.studio, cash: state.studio.cash - action.cost },
        movies: state.movies.map(m => m.id === action.movieId ? { ...m, theatricalWeeks: m.theatricalWeeks + 1 } : m)
      };
    case 'RE_RELEASE_MOVIE':
      return {
        ...state,
        movies: state.movies.map(m => m.id === action.movieId ? { ...m, phase: 'released', isReRelease: true, boxOffice: action.boxOffice, releaseDate: state.currentDate } : m)
      };
    case 'HOLD_MOVIE_RELEASE':
      return {
        ...state,
        movies: state.movies.map(m => m.id === action.movieId ? { ...m, isHeld: action.hold } : m)
      };
    case 'UPDATE_RELEASE_DATE':
      return {
        ...state,
        movies: state.movies.map(m => m.id === action.movieId ? { ...m, releaseWeek: action.week, releaseYear: action.year } : m)
      };
    case 'SET_CONTINENT_RELEASES': {
      const totalMarketing = action.releases.reduce((sum, r) => sum + r.marketingBudget, 0);
      return {
        ...state,
        studio: { ...state.studio, cash: state.studio.cash - totalMarketing },
        movies: state.movies.map(m => m.id === action.movieId ? { ...m, continentReleases: action.releases, phase: 'marketing', releaseStrategy: action.strategy } : m)
      };
    }
    case 'ADD_RIVAL_MOVIE':
      return { ...state, rivalMovies: [action.movie, ...state.rivalMovies].slice(0, 100) };
    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const lastTick = useRef(0);

  useEffect(() => {
    lastTick.current = Date.now();
  }, []);

  useEffect(() => {
    if (state.gameSpeed === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTick.current;
      const daysToAdvance = Math.floor(elapsed / (1000 / state.gameSpeed));
      if (daysToAdvance > 0) {
        dispatch({ type: 'TICK', days: daysToAdvance });
        lastTick.current = now;
      }
    }, 100);
    return () => clearInterval(interval);
  }, [state.gameSpeed]);

  useEffect(() => {
    state.movies.forEach(movie => {
      if (movie.phase === 'released' && movie.boxOffice && !movie.awards.includes('notified')) {
        dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `release-${movie.id}`, type: 'success', title: `${movie.title} Released!`, message: `Opening: $${(movie.boxOffice.openingWeekend / 1000000).toFixed(1)}M | Critics: ${movie.reviews?.critic}%`, date: state.currentDate, read: false } });
        dispatch({ type: 'ADD_REVENUE', amount: movie.boxOffice.total * 0.5 });
        dispatch({ type: 'UPDATE_REPUTATION', amount: ((movie.reviews?.critic || 50) - 50) / 5 });
        dispatch({ type: 'MARK_MOVIE_NOTIFIED', movieId: movie.id });
      }
    });
  }, [state.movies, state.currentDate]);

  const startMovieProduction = useCallback((config: MovieConfig) => {
    const budgetRange = BUDGET_TIERS[config.budgetTier];
    const baseBudget = Math.floor(budgetRange.min + Math.random() * (budgetRange.max - budgetRange.min));
    const getTalent = (id?: string) => state.talents.find(t => t.id === id);
    
    const cast = config.leadCast.map(id => getTalent(id)).filter(Boolean) as Talent[];
    const crewIds = [config.director, config.writer, config.cinematographer, config.editor, config.composer, config.producer, config.vfxSupervisor, config.productionDesigner, config.costumeDesigner];
    const crew = crewIds.map(id => getTalent(id)).filter(Boolean) as Talent[];
    
    const talentSalaries = [...cast, ...crew].reduce((sum, t) => sum + t.salary, 0);
    const totalBudget = baseBudget + talentSalaries;

    if (state.studio.cash < totalBudget) {
      dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `fail-${Date.now()}`, type: 'error', title: 'Production Failed', message: `Insufficient funds to start ${config.title || 'movie'}`, date: state.currentDate, read: false } });
      return;
    }
    
    const newMovieId = `movie-${Date.now()}`;
    const newCharacters: Character[] = config.characters.map(char => ({
      id: char.id || `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: char.name,
      role: char.role,
      gender: char.gender,
      universeId: config.universeId,
      fame: 0
    }));

    const newMovie: Movie = {
      id: newMovieId,
      title: config.title || generateMovieTitle(config.genres[0]),
      genres: config.genres,
      budgetTier: config.budgetTier,
      budget: totalBudget,
      phase: 'writing',
      progress: 0,
      daysInPhase: 0,
      leadCast: config.leadCast,
      supportingCast: config.supportingCast || [],
      director: config.director,
      writer: config.writer,
      cinematographer: config.cinematographer,
      editor: config.editor,
      composer: config.composer,
      producer: config.producer,
      vfxSupervisor: config.vfxSupervisor,
      productionDesigner: config.productionDesigner,
      costumeDesigner: config.costumeDesigner,
      quality: {
        script: Math.min(100, (getTalent(config.writer)?.skill || 50) + Math.random() * 20),
        acting: Math.min(100, cast.reduce((s, t) => s + t.skill, 0) / (cast.length || 1) + Math.random() * 15),
        direction: Math.min(100, (getTalent(config.director)?.skill || 50) + Math.random() * 20),
        cinematography: Math.min(100, (getTalent(config.cinematographer)?.skill || 50) + Math.random() * 15),
        editing: Math.min(100, (getTalent(config.editor)?.skill || 50) + Math.random() * 15),
        music: Math.min(100, (getTalent(config.composer)?.skill || 50) + Math.random() * 15),
        production: Math.min(100, (getTalent(config.producer)?.skill || 50) + Math.random() * 15),
        marketing: 30 + (state.studio.facilities.marketing * 5),
        vfx: Math.min(100, (getTalent(config.vfxSupervisor)?.skill || 50) + Math.random() * 15),
      },
      releaseWindow: 'theatrical',
      movieType: config.movieType,
      specialType: config.specialType,
      franchiseId: config.franchiseId,
      universeId: config.universeId,
      sequelTo: config.sequelTo,
      characters: newCharacters.map(c => c.id),
      awards: [],
      sceneCount: config.sceneCount || 200,
      scenesPerEpisode: config.scenesPerEpisode,
      runtime: config.runtime || 90,
      filmingWeeks: config.filmingWeeks || 8,
      season: config.season,
      episodes: config.episodes,
      releaseWeek: config.releaseWeek,
      releaseYear: config.releaseYear,
      theatricalWeeks: 10,
    };
    
    dispatch({ type: 'START_MOVIE', movie: newMovie, newCharacters });
    dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `start-${newMovie.id}`, type: 'info', title: 'Production Started', message: `${newMovie.title} has entered writing stage. Total Budget: ${Math.round(totalBudget/1000000)}M`, date: state.currentDate, read: false } });
  }, [state.talents, state.currentDate, state.studio.cash, state.studio.facilities.marketing]);

  const setupGame = useCallback((studioName: string, startingCash: number) => {
    dispatch({ type: 'SETUP_GAME', studioName, startingCash });
  }, []);

  const hireTalent = useCallback((talentId: string) => {
    const talent = state.talents.find(t => t.id === talentId);
    if (talent) {
      dispatch({ type: 'HIRE_TALENT', talentId, cost: talent.salary });
    }
  }, [state.talents]);
  const fireTalent = useCallback((talentId: string) => dispatch({ type: 'FIRE_TALENT', talentId }), []);
  const setGameSpeed = useCallback((speed: number) => dispatch({ type: 'SET_GAME_SPEED', speed }), []);
  const simulateTime = useCallback((weeks: number) => {
    dispatch({ type: 'SET_GAME_SPEED', speed: 0 });
    dispatch({ type: 'TICK', days: weeks * 7 });
  }, []);

  const upgradeFacility = useCallback((facility: 'soundStages' | 'postProduction' | 'marketing') => {
    const costs = { soundStages: 10000000, postProduction: 7500000, marketing: 5000000 };
    if (state.studio.cash >= costs[facility]) {
      dispatch({ type: 'UPGRADE_FACILITY', facility, cost: costs[facility] });
      dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `upgrade-${Date.now()}`, type: 'success', title: 'Facility Upgraded', message: `${facility} upgraded to level ${state.studio.facilities[facility] + 1}`, date: state.currentDate, read: false } });
    }
  }, [state.studio.cash, state.studio.facilities, state.currentDate]);

  const createFranchise = useCallback((name: string): string => {
    const id = `franchise-${Date.now()}`;
    const colors = generateFranchiseColors();
    dispatch({ type: 'CREATE_FRANCHISE', franchise: { id, name, movies: [], characters: [], totalBoxOffice: 0, active: true, color: colors[state.franchises.length % colors.length] } });
    dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `franchise-${id}`, type: 'success', title: 'Franchise Created', message: `${name} franchise established`, date: state.currentDate, read: false } });
    return id;
  }, [state.franchises.length, state.currentDate]);

  const createUniverse = useCallback((name: string): string => {
    const id = `universe-${Date.now()}`;
    dispatch({ type: 'CREATE_UNIVERSE', universe: { id, name, franchises: [], productions: [], totalBoxOffice: 0 } });
    dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `universe-${id}`, type: 'success', title: 'Universe Created', message: `${name} universe established`, date: state.currentDate, read: false } });
    return id;
  }, [state.currentDate]);

  const getSequelData = useCallback((parentId: string): Partial<MovieConfig> | null => {
    const parent = state.movies.find(m => m.id === parentId);
    if (!parent) return null;
    
    // Get characters from parent
    const parentCharacters = state.characters.filter(c => parent.characters.includes(c.id));

    return { 
      genres: parent.genres, 
      director: parent.director, 
      writer: parent.writer, 
      leadCast: parent.leadCast.slice(0, 3), 
      supportingCast: parent.supportingCast.slice(0, 2),
      franchiseId: parent.franchiseId, 
      universeId: parent.universeId, 
      sequelTo: parentId, 
      movieType: 'sequel',
      characters: parentCharacters.map(c => ({ name: c.name, role: c.role, id: c.id, gender: c.gender })),
      episodes: parent.episodes
    };
  }, [state.movies, state.characters]);

  const extendTheatricalRun = useCallback((movieId: string) => {
    const movie = state.movies.find(m => m.id === movieId);
    if (!movie) return;
    
    const cost = Math.round(movie.budget * 0.01);
    if (state.studio.cash < cost) {
      dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `extend-fail-${Date.now()}`, type: 'error', title: 'Insufficient Funds', message: `Not enough cash to extend ${movie.title}`, date: state.currentDate, read: false } });
      return;
    }

    dispatch({ type: 'EXTEND_THEATRICAL_RUN', movieId, cost });
    dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `extend-${Date.now()}`, type: 'info', title: 'Run Extended', message: `Theatrical run extended by 1 week for ${formatMoney(cost)}`, date: state.currentDate, read: false } });
  }, [state.movies, state.studio.cash, state.currentDate]);

  const reReleaseMovie = useCallback((movieId: string) => {
    const movie = state.movies.find(m => m.id === movieId);
    if (movie) {
      const boxOffice = calculateBoxOffice({ ...movie, isReRelease: true }, state.marketTrends, state.events, state.currentWeek);
      dispatch({ type: 'RE_RELEASE_MOVIE', movieId, boxOffice });
      dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `rerelease-${Date.now()}`, type: 'success', title: 'Re-Release', message: `${movie.title} is back in theaters!`, date: state.currentDate, read: false } });
    }
  }, [state.movies, state.marketTrends, state.events, state.currentWeek, state.currentDate]);

  const holdMovieRelease = useCallback((movieId: string, hold: boolean) => {
    dispatch({ type: 'HOLD_MOVIE_RELEASE', movieId, hold });
    dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `hold-${Date.now()}`, type: 'info', title: hold ? 'Release Held' : 'Release Resumed', message: hold ? 'Movie will not release until you resume.' : 'Movie will release on schedule.', date: state.currentDate, read: false } });
  }, [state.currentDate]);

  const updateReleaseDate = useCallback((movieId: string, week: number, year: number) => {
    // Ensure week is between 1 and 52
    const normalizedWeek = ((week - 1) % 52) + 1;
    const addedYears = Math.floor((week - 1) / 52);
    const finalYear = year + addedYears;

    dispatch({ type: 'UPDATE_RELEASE_DATE', movieId, week: normalizedWeek, year: finalYear });
    dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `date-${Date.now()}`, type: 'info', title: 'Release Date Updated', message: `New release date: Week ${normalizedWeek}, ${finalYear}`, date: state.currentDate, read: false } });
  }, [state.currentDate]);

  const setContinentReleases = useCallback((movieId: string, releases: ContinentRelease[], strategy: ReleaseStrategy) => {
    const totalMarketingCost = releases.reduce((sum, r) => sum + r.marketingBudget, 0);
    if (state.studio.cash < totalMarketingCost) {
      dispatch({ type: 'ADD_NOTIFICATION', notification: { id: Date.now().toString(), type: 'error', title: 'Insufficient Funds', message: 'Not enough cash for marketing campaign.', date: state.currentDate, read: false } });
      return;
    }
    dispatch({ type: 'SET_CONTINENT_RELEASES', movieId, releases, strategy });
    dispatch({ type: 'ADD_REVENUE', amount: -totalMarketingCost });
  }, [state.studio.cash, state.currentDate]);

  return (
    <GameContext.Provider value={{ 
      state, 
      startMovieProduction, 
      hireTalent, 
      fireTalent, 
      setGameSpeed, 
      simulateTime, 
      upgradeFacility, 
      createFranchise, 
      createUniverse, 
      setupGame,
      getSequelData, 
      extendTheatricalRun, 
      reReleaseMovie, 
      holdMovieRelease, 
      updateReleaseDate,
      setContinentReleases
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
