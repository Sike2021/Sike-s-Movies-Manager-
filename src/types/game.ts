export type Genre = 
  | 'Action' | 'Comedy' | 'Drama' | 'Horror' | 'Sci-Fi' | 'Romance' 
  | 'Thriller' | 'Animation' | 'Mystery' | 'Fantasy' | 'Documentary' | 'Superhero'
  | 'Western' | 'Musical' | 'War' | 'Crime' | 'Family' | 'Noir'
  | 'Adventure' | 'Biography' | 'History' | 'Psychological' | 'Slasher' | 'Supernatural'
  | 'Cyberpunk' | 'Steampunk' | 'Dystopian' | 'Satire' | 'Parody' | 'Mockumentary'
  | 'Experimental' | 'Short' | 'Anthology' | 'Biopic' | 'Period Piece' | 'Coming of Age';

export type ProductionPhase = 'writing' | 'preProduction' | 'locations' | 'filming' | 'postProduction' | 'marketing' | 'released';
export type BudgetTier = 'micro' | 'indie' | 'mid' | 'blockbuster' | 'epic';
export type TalentType = 'actor' | 'director' | 'writer' | 'cinematographer' | 'editor' | 'composer' | 'producer' | 'vfx' | 'productionDesigner' | 'costumeDesigner';
export type AwardType = 'Oscar' | 'Emmy' | 'Golden Globe' | 'Critics Choice' | 'BAFTA' | 'SAG' | 'Cannes' | 'Sundance' | 'notified';
export type Difficulty = 'easy' | 'hard';
export type Continent = 'North America' | 'South America' | 'Europe' | 'Asia' | 'Africa' | 'Oceania';
export type ReleaseStrategy = 'express' | 'standard' | 'tentpole';
export type ReleaseWindow = 'theatrical' | 'streaming_exclusive' | 'hybrid';

export interface AwardResult {
  year: number;
  type: 'nominations' | 'ceremony';
  results: AwardNominee[];
}

export interface ContinentRelease {
  continent: Continent;
  releaseWeek?: number;
  releaseYear?: number;
  marketingBudget: number;
  boxOffice: {
    total: number;
    daily: DailyBoxOffice[];
  };
  released: boolean;
}

export interface Talent {
  id: string;
  name: string;
  type: TalentType;
  gender: 'Male' | 'Female' | 'Non-binary';
  age: number;
  salary: number;
  skill: number;
  fame: number;
  starPower: number;
  genreAffinity: Partial<Record<Genre, number>>;
  hired: boolean;
  bio: string;
}

export interface Character {
  id: string;
  name: string;
  role: 'Hero' | 'Villain' | 'Sidekick' | 'Supporting' | 'Cameo';
  gender?: 'Male' | 'Female' | 'Any';
  universeId?: string;
  actorId?: string;
  fame: number;
  description?: string;
}

export interface DailyBoxOffice {
  day: number;
  date: Date;
  domestic: number;
  international: number;
  total: number;
  weekend: boolean;
}

export interface Franchise {
  id: string;
  name: string;
  movies: string[];
  characters: string[];
  totalBoxOffice: number;
  active: boolean;
  color: string;
}

export interface Universe {
  id: string;
  name: string;
  franchises: string[];
  productions: string[];
  totalBoxOffice: number;
}

export interface Movie {
  id: string;
  title: string;
  genres: Genre[];
  budgetTier: BudgetTier;
  budget: number;
  phase: ProductionPhase;
  progress: number;
  daysInPhase: number;
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
  quality: {
    script: number;
    acting: number;
    direction: number;
    cinematography: number;
    editing: number;
    music: number;
    production: number;
    marketing: number;
    vfx: number;
  };
  releaseDate?: Date;
  releaseWeek?: number;
  releaseYear?: number;
  releaseWindow: ReleaseWindow;
  boxOffice?: {
    domestic: number;
    international: number;
    total: number;
    daily: DailyBoxOffice[];
    openingWeekend: number;
  };
  streamingRevenue: number;
  isSoldToStreaming: boolean;
  streamingPlatform?: string;
  streamingViews: number;
  reviews?: { critic: number; audience: number };
  movieType: 'standalone' | 'franchise' | 'sequel' | 'teamup' | 'series' | 'special' | 'spinoff' | 'crossover';
  specialType?: 'Christmas' | 'Anniversary' | 'Mini Series';
  franchiseId?: string;
  universeId?: string;
  sequelTo?: string;
  characters: string[]; // Character IDs
  awards: AwardType[];
  sceneCount: number;
  scenesPerEpisode?: number;
  runtime: number; // in minutes
  filmingWeeks: number;
  season?: number;
  episodes?: number;
  theatricalWeeks: number;
  isReRelease?: boolean;
  isHeld?: boolean;
  studioReputationAtRelease?: number;
  continentReleases?: ContinentRelease[];
  releaseStrategy?: ReleaseStrategy;
}

export interface RivalStudio {
  id: string;
  name: string;
  reputation: number;
  totalBoxOffice: number;
  moviesReleased: number;
}

export interface RivalMovie {
  id: string;
  title: string;
  studioName: string;
  genres: Genre[];
  releaseWeek: number;
  releaseYear: number;
  boxOffice: number;
  quality: number;
}

export interface Studio {
  name: string;
  owner: string;
  level: number;
  reputation: number;
  cash: number;
  totalRevenue: number;
  totalStreamingRevenue: number;
  facilities: { soundStages: number; postProduction: number; marketing: number };
  totalAwardsWon: number;
}

export interface MarketTrend {
  genre: Genre;
  popularity: number;
  trend: 'rising' | 'stable' | 'falling';
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  week: number;
  multiplier: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  date: Date;
  read: boolean;
}

export interface AwardNominee {
  id: string;
  category: string;
  projectId: string; // Movie or Series ID
  talentId?: string;
  score: number;
  winner?: boolean;
}

export interface SimulationResult {
  date: Date;
  topMovies: { id: string; title: string; weeklyRevenue: number }[];
  news: string[];
  awards?: {
    type: 'nominations' | 'ceremony';
    nominees?: AwardNominee[];
    winners?: AwardNominee[];
  };
}

export interface GameState {
  studio: Studio;
  movies: Movie[];
  talents: Talent[];
  characters: Character[];
  franchises: Franchise[];
  universes: Universe[];
  marketTrends: MarketTrend[];
  events: GameEvent[];
  rivalStudios: RivalStudio[];
  rivalMovies: RivalMovie[];
  currentDate: Date;
  currentWeek: number;
  currentYear: number;
  gameSpeed: number;
  difficulty: Difficulty;
  notifications: Notification[];
  lastSimulationResult?: SimulationResult;
  awardHistory: AwardResult[];
}

export const GENRES: Genre[] = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 
  'Thriller', 'Animation', 'Mystery', 'Fantasy', 'Documentary', 
  'Superhero', 'Western', 'Musical', 'War', 'Crime', 'Family', 'Noir',
  'Adventure', 'Biography', 'History', 'Psychological', 'Slasher', 'Supernatural',
  'Cyberpunk', 'Steampunk', 'Dystopian', 'Satire', 'Parody', 'Mockumentary',
  'Experimental', 'Short', 'Anthology', 'Biopic', 'Period Piece', 'Coming of Age'
];

export const BUDGET_TIERS: Record<BudgetTier, { label: string; min: number; max: number }> = {
  micro: { label: 'Micro', min: 100000, max: 1000000 },
  indie: { label: 'Indie', min: 1000000, max: 10000000 },
  mid: { label: 'Mid', min: 10000000, max: 50000000 },
  blockbuster: { label: 'Blockbuster', min: 50000000, max: 200000000 },
  epic: { label: 'Epic', min: 200000000, max: 500000000 },
};

export const PHASE_DURATIONS: Record<ProductionPhase, number> = {
  writing: 28, preProduction: 21, locations: 14, filming: 42, postProduction: 35, marketing: 14, released: 0,
};
