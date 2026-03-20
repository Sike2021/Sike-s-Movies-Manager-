import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { GameState, Movie, Talent, Genre, ProductionPhase, BudgetTier, Franchise, Universe, DailyBoxOffice, Notification, MarketTrend, GameEvent, ContinentRelease, Character, RivalMovie, AwardType, ReleaseStrategy, AwardNominee, Difficulty } from '@/types/game';
import { GENRES, BUDGET_TIERS, PHASE_DURATIONS } from '@/types/game';
import { generateTalentPool, generateMovieTitle, generateFranchiseColors, generateRivalMovie, formatMoney } from '@/lib/gameUtils';

interface GameContextType {
  state: GameState;
  startMovieProduction: (config: MovieConfig) => void;
  hireTalent: (talentId: string) => void;
  fireTalent: (talentId: string) => void;
  simulateTime: (weeks: number) => void;
  upgradeFacility: (facility: 'soundStages' | 'postProduction' | 'marketing') => void;
  createFranchise: (name: string) => string;
  createUniverse: (name: string) => string;
  setupGame: (studioName: string, startingCash: number) => void;
  resetGame: () => void;
  getSequelData: (parentId: string) => Partial<MovieConfig> | null;
  extendTheatricalRun: (movieId: string) => void;
  reReleaseMovie: (movieId: string) => void;
  holdMovieRelease: (movieId: string, hold: boolean) => void;
  updateReleaseDate: (movieId: string, week: number, year: number) => void;
  setContinentReleases: (movieId: string, releases: ContinentRelease[], strategy: ReleaseStrategy) => void;
  clearSimulationResult: () => void;
  sellToStreaming: (movieId: string, platform: string, amount: number) => void;
  releaseOnOwnPlatform: (movieId: string) => void;
  setDifficulty: (difficulty: Difficulty) => void;
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
  characters: { name: string, role: 'Hero' | 'Villain' | 'Sidekick' | 'Supporting' | 'Cameo', id?: string, gender?: 'Male' | 'Female' | 'Any', actorId?: string }[];
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
  | { type: 'ADD_RIVAL_MOVIE'; movie: RivalMovie }
  | { type: 'CLEAR_SIMULATION_RESULT' }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'RESET_GAME' }
  | { type: 'SELL_TO_STREAMING'; movieId: string; amount: number; platform: string }
  | { type: 'RELEASE_ON_OWN_PLATFORM'; movieId: string };

const initialState: GameState = {
  studio: { name: 'Sike Entertainment', owner: 'Sikandar', level: 1, reputation: 50, cash: 50000000, totalRevenue: 0, facilities: { soundStages: 2, postProduction: 2, marketing: 2 }, totalAwardsWon: 0, totalStreamingRevenue: 0 },
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
  difficulty: 'easy',
  notifications: [],
  awardHistory: [],
};

function calculateDailyBoxOffice(movie: Movie, marketTrends: MarketTrend[], events: GameEvent[], currentWeek: number, dayReleased: number): DailyBoxOffice {
  const avgQuality = Object.values(movie.quality).reduce((a, b) => a + b, 0) / 9;
  const audienceScore = movie.reviews?.audience || 50;
  
  const genrePopularity = movie.genres.reduce((sum, g) => {
    const trend = marketTrends.find(t => t.genre === g);
    return sum + (trend ? trend.popularity : 100);
  }, 0) / (movie.genres.length || 1);
  
  const trendMultiplier = genrePopularity / 100;
  const activeEvent = events.find(e => e.week === currentWeek);
  const eventMultiplier = activeEvent ? activeEvent.multiplier : 1;

  const qualityMultiplier = 1 + (avgQuality / 150) + (audienceScore / 200);
  const reReleaseMultiplier = movie.isReRelease ? 0.15 : 1;
  const awardMultiplier = 1 + (movie.awards.length * 0.1); 
  const studioMultiplier = 1 + (movie.studioReputationAtRelease ? movie.studioReputationAtRelease / 200 : 0.5);
  
  // Base opening target (total potential)
  const baseOpeningTarget = movie.budget * 0.4 * qualityMultiplier * trendMultiplier * eventMultiplier * reReleaseMultiplier * awardMultiplier * studioMultiplier;
  
  // Day-based drop-off curve (More realistic)
  let dayMultiplier = 1;
  if (dayReleased === 1) dayMultiplier = 1.0;
  else if (dayReleased <= 3) dayMultiplier = 0.95; // Weekend hold
  else if (dayReleased <= 7) {
    // Weekday drop
    dayMultiplier = 0.5 * Math.pow(0.9, dayReleased - 3);
  } else {
    // Weekly drop-off
    const week = Math.ceil(dayReleased / 7);
    dayMultiplier = 0.3 * Math.pow(0.7, week - 1);
  }

  const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
  
  const releaseDate = new Date(movie.releaseDate || new Date());
  const currentDate = new Date(releaseDate);
  currentDate.setDate(currentDate.getDate() + dayReleased - 1);
  const dayOfWeek = currentDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  if (isWeekend) dayMultiplier *= 1.8;

  let dailyTotal = (baseOpeningTarget / 3.5) * dayMultiplier * randomFactor;
  
  // Growth Cap: Daily collection cannot grow more than 1.5x of opening day (Day 1)
  const openingDayOneEstimate = (baseOpeningTarget / 3.5);
  dailyTotal = Math.min(dailyTotal, openingDayOneEstimate * 1.5);

  return { 
    day: dayReleased, 
    date: currentDate, 
    domestic: Math.round(dailyTotal * 0.45), 
    international: Math.round(dailyTotal * 0.55), 
    total: Math.round(dailyTotal), 
    weekend: isWeekend 
  };
}

function calculateBoxOffice(): Movie['boxOffice'] {
  // This is now just for initialization
  return { 
    domestic: 0, 
    international: 0, 
    total: 0, 
    daily: [], 
    openingWeekend: 0 
  };
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
      let simulationResult: GameState['lastSimulationResult'] = undefined;
      
      for (let i = 0; i < action.days; i++) {
        const newDate = new Date(currentState.currentDate);
        newDate.setDate(newDate.getDate() + 1);
        const daysSinceStart = Math.floor((newDate.getTime() - new Date(2024, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
        const newWeek = Math.floor(daysSinceStart / 7) + 1;
        const newYear = 2024 + Math.floor((newWeek - 1) / 52);
        
        // Award System Logic
        let awardEvent: NonNullable<GameState['lastSimulationResult']>['awards'] = undefined;
        const isFeb5 = newDate.getMonth() === 1 && newDate.getDate() === 5;
        const isFeb11 = newDate.getMonth() === 1 && newDate.getDate() === 11;

        if (isFeb5) {
          // Nominations
          const playerMovies = currentState.movies.filter(m => m.releaseYear === newYear && m.phase === 'released');
          const rivalMovies = currentState.rivalMovies.filter(m => m.releaseYear === newYear);
          
          const allEligible = [
            ...playerMovies.map(m => ({ id: m.id, title: m.title, reviews: m.reviews, boxOffice: m.boxOffice?.total || 0, movieType: m.movieType, isRival: false })),
            ...rivalMovies.map(m => ({ id: m.id, title: m.title, reviews: { critic: m.quality, audience: m.quality }, boxOffice: m.boxOffice, movieType: 'standalone', isRival: true }))
          ];

          const nominees: AwardNominee[] = [];
          const categories = [
            'Best Movie', 'Best Lead Actor', 'Best Lead Actress', 'Best Director', 
            'Best Villain', 'Best Series', 'Best Supporting Actor', 'Best Special', 
            'Best VFX', 'Best Composer', 'Best Screenplay', 'Best Cinematography',
            'Best Animated Feature', 'Best International Film'
          ];

          categories.forEach(cat => {
            let eligible = allEligible;
            if (cat === 'Best Series') eligible = allEligible.filter(m => m.movieType === 'series');
            if (cat === 'Best Special') eligible = allEligible.filter(m => m.movieType === 'special');
            if (cat === 'Best Movie') eligible = allEligible.filter(m => m.movieType === 'standalone' || m.movieType === 'franchise' || m.movieType === 'sequel');

            if (eligible.length > 0) {
              const pool = [...eligible].sort((a, b) => {
                const scoreA = (a.reviews?.critic || 50) + (a.boxOffice / 10000000);
                const scoreB = (b.reviews?.critic || 50) + (b.boxOffice / 10000000);
                return scoreB - scoreA;
              }).slice(0, 5);

              pool.forEach(p => {
                nominees.push({
                  id: `nom-${cat}-${p.id}-${Date.now()}`,
                  category: cat,
                  projectId: p.id,
                  score: (p.reviews?.critic || 50) + (p.boxOffice / 10000000)
                });
              });
            }
          });
          awardEvent = { type: 'nominations', nominees };
        }

        if (isFeb11) {
          // Ceremony (Winners)
          const playerMovies = currentState.movies.filter(m => m.releaseYear === newYear && m.phase === 'released');
          const rivalMovies = currentState.rivalMovies.filter(m => m.releaseYear === newYear);
          
          const allEligible = [
            ...playerMovies.map(m => ({ id: m.id, title: m.title, reviews: m.reviews, boxOffice: m.boxOffice?.total || 0, movieType: m.movieType, isRival: false })),
            ...rivalMovies.map(m => ({ id: m.id, title: m.title, reviews: { critic: m.quality, audience: m.quality }, boxOffice: m.boxOffice, movieType: 'standalone', isRival: true }))
          ];

          const winners: AwardNominee[] = [];
          const categories = [
            'Best Movie', 'Best Lead Actor', 'Best Lead Actress', 'Best Director', 
            'Best Villain', 'Best Series', 'Best Supporting Actor', 'Best Special', 
            'Best VFX', 'Best Composer', 'Best Screenplay', 'Best Cinematography',
            'Best Animated Feature', 'Best International Film'
          ];

          categories.forEach(cat => {
            let eligible = allEligible;
            if (cat === 'Best Series') eligible = allEligible.filter(m => m.movieType === 'series');
            if (cat === 'Best Special') eligible = allEligible.filter(m => m.movieType === 'special');
            if (cat === 'Best Movie') eligible = allEligible.filter(m => m.movieType === 'standalone' || m.movieType === 'franchise' || m.movieType === 'sequel');

            if (eligible.length > 0) {
              const winner = [...eligible].sort((a, b) => {
                const scoreA = (a.reviews?.critic || 0) + (a.boxOffice / 10000000) + Math.random() * 10;
                const scoreB = (b.reviews?.critic || 0) + (b.boxOffice / 10000000) + Math.random() * 10;
                return scoreB - scoreA;
              })[0];

              winners.push({
                id: `win-${cat}-${winner.id}-${Date.now()}`,
                category: cat,
                projectId: winner.id,
                score: (winner.reviews?.critic || 0) + (winner.boxOffice / 10000000),
                winner: true
              });
            }
          });
          awardEvent = { type: 'ceremony', winners };
        }

        let reputationBoost = 0;
        let awardsWonThisTick = 0;
        let dailyStreamingRevenueTotal = 0;

        // Track which talents are busy in this tick
        const busyTalentIds = new Set<string>();

        const updatedMovies = currentState.movies.map((movie) => {
          const updatedMovie = { ...movie };

          if (awardEvent?.type === 'ceremony') {
            const isWinner = awardEvent.winners?.some((w: AwardNominee) => w.projectId === movie.id);
            if (isWinner) {
              awardsWonThisTick++;
              updatedMovie.awards = [...updatedMovie.awards, 'Oscar' as AwardType];
            }
          }

          if (updatedMovie.phase === 'released') {
            // 1. Handle Theatrical Box Office
            if (updatedMovie.releaseWindow !== 'streaming_exclusive' && !updatedMovie.isSoldToStreaming) {
              const daysReleased = (updatedMovie.boxOffice?.daily?.length || 0) + 1;
              const maxDays = 70; // Hard cap at 10 weeks (70 days)
              
              if (daysReleased <= maxDays) {
                const dailyBO = calculateDailyBoxOffice(updatedMovie, currentState.marketTrends, currentState.events, currentState.currentWeek, daysReleased);
                dailyBO.date = new Date(newDate);
                
                const currentBoxOffice = updatedMovie.boxOffice || { domestic: 0, international: 0, total: 0, daily: [], openingWeekend: 0 };
                const updatedDaily = [...currentBoxOffice.daily, dailyBO];
                const newTotal = currentBoxOffice.total + dailyBO.total;
                const newDomestic = currentBoxOffice.domestic + dailyBO.domestic;
                const newInternational = currentBoxOffice.international + dailyBO.international;
                
                let openingWeekend = currentBoxOffice.openingWeekend;
                if (daysReleased <= 3) {
                  openingWeekend += dailyBO.total;
                }

                updatedMovie.boxOffice = {
                  ...currentBoxOffice,
                  total: newTotal,
                  domestic: newDomestic,
                  international: newInternational,
                  daily: updatedDaily,
                  openingWeekend
                };
              }
            }

            // 2. Handle Streaming Revenue (Hybrid or Exclusive)
            if (updatedMovie.releaseWindow === 'hybrid' || updatedMovie.releaseWindow === 'streaming_exclusive') {
              const baseViews = (updatedMovie.budget / 5000) * (updatedMovie.quality.marketing / 50);
              const randomFactor = 0.8 + Math.random() * 0.4;
              const dailyViews = baseViews * (updatedMovie.reviews?.audience || 50) / 100 * randomFactor;
              const dailyRev = dailyViews * 0.05; // $0.05 per view
              
              updatedMovie.streamingViews = (updatedMovie.streamingViews || 0) + dailyViews;
              updatedMovie.streamingRevenue = (updatedMovie.streamingRevenue || 0) + dailyRev;
              dailyStreamingRevenueTotal += dailyRev;
            }

            return updatedMovie;
          }
          
          // If held, don't progress beyond marketing 100%
          if (updatedMovie.isHeld && updatedMovie.phase === 'marketing' && updatedMovie.progress >= 100) {
            return updatedMovie;
          }

          // If post-production is done but no release date is set, stay at 100%
          if (updatedMovie.phase === 'postProduction' && updatedMovie.progress >= 100 && (!updatedMovie.releaseWeek || !updatedMovie.releaseYear)) {
            return updatedMovie;
          }

          // Check if talents are busy with OTHER movies during filming
          if (updatedMovie.phase === 'filming') {
            const movieTalents = [updatedMovie.director, updatedMovie.writer, updatedMovie.cinematographer, updatedMovie.editor, updatedMovie.composer, updatedMovie.producer, updatedMovie.vfxSupervisor, updatedMovie.productionDesigner, updatedMovie.costumeDesigner, ...updatedMovie.leadCast, ...updatedMovie.supportingCast].filter(Boolean) as string[];
            
            const isAnyTalentBusyElsewhere = movieTalents.some(talentId => busyTalentIds.has(talentId));

            if (isAnyTalentBusyElsewhere) {
              // Filming is delayed because someone is busy with a movie that has higher priority (earlier in the list)
              return updatedMovie;
            }

            // If not busy elsewhere, mark them as busy for this movie
            movieTalents.forEach(id => busyTalentIds.add(id));
          }

          const phaseDuration = updatedMovie.phase === 'filming' ? updatedMovie.filmingWeeks * 7 : PHASE_DURATIONS[updatedMovie.phase];
          const newDaysInPhase = updatedMovie.daysInPhase + 1;
          let newProgress = Math.min(100, (newDaysInPhase / phaseDuration) * 100);
          
          // Special handling for marketing to ensure it hits 100% at release
          if (updatedMovie.phase === 'marketing' && updatedMovie.releaseWeek && updatedMovie.releaseYear) {
            const isReleaseDay = (newYear > updatedMovie.releaseYear || (newYear === updatedMovie.releaseYear && newWeek >= updatedMovie.releaseWeek));
            if (isReleaseDay) newProgress = 100;
            else newProgress = Math.min(99, newProgress); // Stay at 99 until release
          }
          
          if (newProgress >= 100) {
            const phases: ProductionPhase[] = ['writing', 'preProduction', 'locations', 'filming', 'postProduction', 'marketing', 'released'];
            const currentIndex = phases.indexOf(updatedMovie.phase);
            const nextPhase = phases[currentIndex + 1];
            
            if (updatedMovie.phase === 'postProduction' && newProgress >= 100) {
              if (!updatedMovie.releaseWeek) {
                currentState.notifications.push({
                  id: `post-done-${updatedMovie.id}`,
                  type: 'success',
                  title: 'Post-Production Complete',
                  message: `${updatedMovie.title} is ready for release! Set your global distribution strategy.`,
                  date: newDate,
                  read: false
                });
              }
            }

            if (nextPhase === 'released') {
              const isReadyToRelease = updatedMovie.releaseWeek && updatedMovie.releaseYear && (newYear > updatedMovie.releaseYear || (newYear === updatedMovie.releaseYear && newWeek >= updatedMovie.releaseWeek));
              
              if (!isReadyToRelease) {
                return { ...updatedMovie, progress: 100, daysInPhase: newDaysInPhase };
              }
              
              if (updatedMovie.isHeld) {
                return { ...updatedMovie, progress: 100, daysInPhase: newDaysInPhase };
              }

              const boxOffice = calculateBoxOffice();
              const reviews = calculateReviews(updatedMovie as Movie);
              const movieWithReviews = { ...updatedMovie, reviews };
              const awards = calculateAwards(movieWithReviews as Movie);
              
              reputationBoost += awards.length * 2;
              
              return { 
                ...updatedMovie, 
                phase: 'released' as const, 
                progress: 100, 
                releaseDate: newDate, 
                boxOffice, 
                reviews, 
                awards, 
                studioReputationAtRelease: currentState.studio.reputation,
                streamingRevenue: 0,
                streamingViews: 0,
                isSoldToStreaming: false
              };
            }
            return { ...updatedMovie, phase: nextPhase as ProductionPhase, progress: 0, daysInPhase: 0 };
          }
          return { ...updatedMovie, progress: newProgress, daysInPhase: newDaysInPhase };
        });

        // Rival Studio Logic: Check for releases every week (Sunday)
        const newRivalMovies = [...currentState.rivalMovies];
        let newRivalStudios = [...currentState.rivalStudios];
        
        if (newDate.getDay() === 0) { // Sunday
          newRivalStudios = newRivalStudios.map(studio => {
            const weeksLeft = 52 - (newWeek % 52 || 52);
            const neededForMin = Math.max(0, 3 - studio.moviesReleased);
            const canReleaseMore = studio.moviesReleased < 20;
            
            const difficultyMultiplier = currentState.difficulty === 'hard' ? 1.5 : 0.8;
            let releaseChance = (0.1 + (studio.reputation / 1000)) * difficultyMultiplier; 
            if (neededForMin > 0 && weeksLeft <= neededForMin) releaseChance = 0.8; 
            if (!canReleaseMore) releaseChance = 0;

            if (Math.random() < releaseChance) {
              const rivalMovie = generateRivalMovie(newWeek, newYear);
              // Adjust quality based on difficulty
              if (currentState.difficulty === 'hard') {
                rivalMovie.quality = Math.min(100, rivalMovie.quality + 10);
                rivalMovie.boxOffice *= 1.3;
              } else {
                rivalMovie.quality = Math.max(20, rivalMovie.quality - 10);
                rivalMovie.boxOffice *= 0.8;
              }
              
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
        const totalDailyRevenue = dailyStreamingRevenueTotal + streamingRevenue;

        // Simulation Result tracking (only for the last day of simulation or if awards happened)
        if (newDate.getDay() === 0 || awardEvent) { // Sunday or Awards
          if (awardEvent) {
            currentState.awardHistory.push({
              year: newYear,
              type: awardEvent.type,
              results: awardEvent.nominees || awardEvent.winners || []
            });
          }
          
          const newsPool = [
            "New Movie Announced",
            "Actor Gains Popularity",
            "Studio Reputation Rising",
            "Market Trends Shifting",
            "Streaming Viewership Up",
            "Critics Praise Recent Release",
            "Box Office Surprise Hit"
          ];
          
          // Weekly Revenue calculation
          const topMovies = updatedMovies
            .filter(m => m.phase === 'released' && m.boxOffice)
            .map(m => {
              const daily = m.boxOffice?.daily || [];
              // Get last 7 days of revenue
              const weeklyRevenue = daily.slice(-7).reduce((sum, d) => sum + d.total, 0);
              return { id: m.id, title: m.title, weeklyRevenue: weeklyRevenue };
            })
            .filter(m => m.weeklyRevenue > 1000)
            .sort((a, b) => b.weeklyRevenue - a.weeklyRevenue)
            .slice(0, 5);

          simulationResult = {
            date: newDate,
            topMovies,
            news: [newsPool[Math.floor(Math.random() * newsPool.length)]],
            awards: awardEvent
          };
        }

        const updatedTalents = currentState.talents.map(t => ({
          ...t,
          isBusy: busyTalentIds.has(t.id)
        }));

        currentState = { 
          ...currentState, 
          currentDate: newDate, 
          currentWeek: newWeek, 
          currentYear: newYear, 
          movies: updatedMovies,
          talents: updatedTalents,
          rivalMovies: newRivalMovies.slice(-100),
          rivalStudios: newRivalStudios,
          lastSimulationResult: simulationResult || currentState.lastSimulationResult,
          studio: { 
            ...currentState.studio, 
            cash: currentState.studio.cash + totalDailyRevenue, 
            totalRevenue: currentState.studio.totalRevenue + totalDailyRevenue,
            totalStreamingRevenue: currentState.studio.totalStreamingRevenue + dailyStreamingRevenueTotal,
            reputation: Math.min(100, currentState.studio.reputation + reputationBoost),
            totalAwardsWon: currentState.studio.totalAwardsWon + awardsWonThisTick
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
      
      // Add new characters to memory or update existing ones with actors
      action.newCharacters.forEach(char => {
        const existingCharIndex = updatedCharacters.findIndex(c => c.id === char.id || (c.name === char.name && c.universeId === finalMovie.universeId));
        if (existingCharIndex >= 0) {
          // Update existing character with new actor if applicable
          updatedCharacters[existingCharIndex] = { 
            ...updatedCharacters[existingCharIndex], 
            actorId: char.actorId || updatedCharacters[existingCharIndex].actorId,
            fame: Math.max(updatedCharacters[existingCharIndex].fame, char.fame)
          };
        } else {
          updatedCharacters.push({ 
            ...char, 
            universeId: finalMovie.universeId,
            id: char.id || `char-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
          });
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
    case 'CLEAR_SIMULATION_RESULT':
      return { ...state, lastSimulationResult: undefined };
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.difficulty };
    case 'LOAD_GAME':
      return { ...initialState, ...action.state };
    case 'RESET_GAME':
      return { ...initialState, talents: generateTalentPool() };
    case 'SELL_TO_STREAMING':
      return {
        ...state,
        studio: {
          ...state.studio,
          cash: state.studio.cash + action.amount,
          totalRevenue: state.studio.totalRevenue + action.amount,
          totalStreamingRevenue: state.studio.totalStreamingRevenue + action.amount
        },
        movies: state.movies.map(m => m.id === action.movieId ? {
          ...m,
          isSoldToStreaming: true,
          streamingPlatform: action.platform,
          streamingRevenue: (m.streamingRevenue || 0) + action.amount,
          phase: 'released'
        } : m)
      };
    case 'RELEASE_ON_OWN_PLATFORM':
      return {
        ...state,
        movies: state.movies.map(m => m.id === action.movieId ? {
          ...m,
          releaseWindow: 'streaming_exclusive',
          phase: 'released',
          releaseDate: state.currentDate,
          releaseWeek: state.currentWeek,
          releaseYear: state.currentYear
        } : m)
      };
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
    
    // Load game on mount
    const saved = localStorage.getItem('sike_entertainment_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        parsed.currentDate = new Date(parsed.currentDate);
        parsed.movies = parsed.movies.map((m: Movie) => ({
          ...m,
          releaseDate: m.releaseDate ? new Date(m.releaseDate) : undefined,
          boxOffice: m.boxOffice ? {
            ...m.boxOffice,
            daily: m.boxOffice.daily.map((d: DailyBoxOffice) => ({ ...d, date: new Date(d.date) }))
          } : undefined,
          streamingRevenue: m.streamingRevenue || 0,
          isSoldToStreaming: m.isSoldToStreaming || false,
          streamingViews: m.streamingViews || 0
        }));
        dispatch({ type: 'LOAD_GAME', state: parsed });
      } catch (e) {
        console.error("Failed to load game", e);
      }
    }
  }, []);

  // Save game on state change
  useEffect(() => {
    if (state !== initialState) {
      localStorage.setItem('sike_entertainment_save', JSON.stringify(state));
    }
  }, [state]);

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
    const newCharacters: Character[] = config.characters.map((char, index) => ({
      id: char.id || `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: char.name,
      role: char.role,
      gender: char.gender,
      universeId: config.universeId,
      actorId: char.actorId || config.leadCast[index],
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
      streamingRevenue: 0,
      isSoldToStreaming: false,
      streamingViews: 0
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
  const simulateTime = useCallback((weeks: number) => {
    dispatch({ type: 'TICK', days: weeks * 7 });
  }, []);
  const resetGame = useCallback(() => {
    if (window.confirm('Are you sure you want to start a new game? All progress will be lost.')) {
      localStorage.removeItem('sike_entertainment_save');
      dispatch({ type: 'RESET_GAME' });
    }
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
      const boxOffice = calculateBoxOffice();
      dispatch({ type: 'RE_RELEASE_MOVIE', movieId, boxOffice });
      dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `rerelease-${Date.now()}`, type: 'success', title: 'Re-Release', message: `${movie.title} is back in theaters!`, date: state.currentDate, read: false } });
    }
  }, [state.movies, state.currentDate]);

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

  const clearSimulationResult = useCallback(() => dispatch({ type: 'CLEAR_SIMULATION_RESULT' }), []);

  const sellToStreaming = useCallback((movieId: string, platform: string, amount: number) => {
    dispatch({ type: 'SELL_TO_STREAMING', movieId, platform, amount });
    dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `stream-${Date.now()}`, type: 'success', title: 'Movie Sold', message: `Sold to ${platform} for ${formatMoney(amount)}`, date: state.currentDate, read: false } });
  }, [state.currentDate]);

  const releaseOnOwnPlatform = useCallback((movieId: string) => {
    dispatch({ type: 'RELEASE_ON_OWN_PLATFORM', movieId });
    dispatch({ type: 'ADD_NOTIFICATION', notification: { id: `own-stream-${Date.now()}`, type: 'success', title: 'Streaming Release', message: 'Released on your own platform!', date: state.currentDate, read: false } });
  }, [state.currentDate]);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', difficulty });
  }, []);

  return (
    <GameContext.Provider value={{ 
      state, 
      startMovieProduction, 
      hireTalent, 
      fireTalent, 
      simulateTime, 
      upgradeFacility, 
      createFranchise, 
      createUniverse, 
      setupGame,
      resetGame,
      getSequelData, 
      extendTheatricalRun, 
      reReleaseMovie, 
      holdMovieRelease, 
      updateReleaseDate,
      setContinentReleases,
      clearSimulationResult,
      sellToStreaming,
      releaseOnOwnPlatform,
      setDifficulty
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
