export type ReleaseType = "daily" | "weekly" | "auto";
export type MovieStatus = "Upcoming" | "Running" | "Completed";
export type BoxOfficePerformance = "Blockbuster" | "Hit" | "Average" | "Flop";

export interface BoxOfficeMovie {
  id: string;
  title: string;
  releaseDate: Date;
  releaseType: ReleaseType;
  budget: number;
  opening: number;
  rating: number; // 0-10
  hype: number; // 0-1
  wordOfMouth: number; // starts at 1.0
  competition: number; // 0-1
  
  // Tracking fields
  totalCollection: number;
  dailyCollection: number[];
  weeklyCollection: number[];
  currentDay: number;
  currentWeek: number;
  status: MovieStatus;
  performance?: BoxOfficePerformance;
  isSoldToStreaming?: boolean;
  streamingSalePrice?: number;
}

/**
 * Calculates the potential streaming sale price.
 * Formula: Budget * (1.1 + (Rating / 20) + (Hype / 5))
 * This ensures it's always higher than budget (min 1.1x).
 */
export function calculateStreamingSalePrice(movie: BoxOfficeMovie): number {
  const multiplier = 1.1 + (movie.rating / 20) + (movie.hype / 5);
  return Math.floor(movie.budget * multiplier);
}

/**
 * Sells the movie to a streaming service.
 */
export function sellToStreaming(movie: BoxOfficeMovie): BoxOfficeMovie {
  if (movie.isSoldToStreaming) return movie;
  
  const salePrice = calculateStreamingSalePrice(movie);
  return {
    ...movie,
    isSoldToStreaming: true,
    streamingSalePrice: salePrice,
    totalCollection: movie.totalCollection + salePrice,
    status: "Completed"
  };
}

/**
 * Calculates the base daily collection for a movie.
 */
export function calculateDailyCollection(movie: BoxOfficeMovie): number {
  const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  const collection = movie.opening * movie.wordOfMouth * randomFactor * (1 - movie.competition);
  return Math.max(0, Math.floor(collection));
}

/**
 * Updates the Word of Mouth (WOM) based on the movie's rating.
 */
export function updateWordOfMouth(movie: BoxOfficeMovie): number {
  let wom = movie.wordOfMouth;
  if (movie.rating > 7) wom += 0.05;
  if (movie.rating < 5) wom -= 0.05;
  
  // Clamp between 0.5 and 2.0
  return Math.min(2.0, Math.max(0.5, wom));
}

/**
 * Updates the performance status based on budget vs total collection.
 */
export function updatePerformanceStatus(movie: BoxOfficeMovie): BoxOfficePerformance {
  const ratio = movie.totalCollection / movie.budget;
  if (ratio >= 3) return "Blockbuster";
  if (ratio >= 2) return "Hit";
  if (ratio >= 1) return "Average";
  return "Flop";
}

/**
 * Simulates a single day for a movie.
 */
export function simulateDay(movie: BoxOfficeMovie): BoxOfficeMovie {
  if (movie.status !== "Running") return movie;
  if (movie.releaseType === "weekly") return movie; // Weekly movies are handled by simulateWeek
  
  // 10-week limit (70 days)
  if (movie.currentWeek >= 10) {
    return { ...movie, status: "Completed" };
  }

  const updatedMovie = { ...movie };
  let dailyAmount = calculateDailyCollection(updatedMovie);

  // Auto Mode Logic: Realistic weekly pattern
  if (updatedMovie.releaseType === "auto") {
    const dayOfWeek = updatedMovie.currentDay % 7;
    // 0: Mon, 1: Tue, 2: Wed, 3: Thu, 4: Fri, 5: Sat, 6: Sun (assuming start on Monday)
    let multiplier = 0.6; // Weekdays
    if (dayOfWeek === 4) multiplier = 1.2; // Friday
    if (dayOfWeek === 5) multiplier = 1.5; // Saturday
    if (dayOfWeek === 6) multiplier = 1.3; // Sunday
    
    dailyAmount = Math.floor(dailyAmount * multiplier);
  }

  updatedMovie.dailyCollection.push(dailyAmount);
  updatedMovie.totalCollection += dailyAmount;
  updatedMovie.wordOfMouth = updateWordOfMouth(updatedMovie);
  updatedMovie.currentDay += 1;
  
  // If a week has passed, update currentWeek
  if (updatedMovie.currentDay % 7 === 0) {
    updatedMovie.currentWeek += 1;
  }

  updatedMovie.performance = updatePerformanceStatus(updatedMovie);
  
  return updatedMovie;
}

/**
 * Simulates a single week for a movie.
 */
export function simulateWeek(movie: BoxOfficeMovie): BoxOfficeMovie {
  if (movie.status !== "Running") return movie;
  if (movie.releaseType !== "weekly") return movie;
  
  // 10-week limit
  if (movie.currentWeek >= 10) {
    return { ...movie, status: "Completed" };
  }

  const updatedMovie = { ...movie };
  const weekIndex = updatedMovie.currentWeek;
  
  // Drop rates logic
  let dropRate = 0.15; // Week 4+
  if (weekIndex === 0) dropRate = 1.0; // Week 1
  else if (weekIndex === 1) dropRate = 0.5; // Week 2
  else if (weekIndex === 2) dropRate = 0.3; // Week 3

  const lastWeekCollection = updatedMovie.weeklyCollection.length > 0 
    ? updatedMovie.weeklyCollection[updatedMovie.weeklyCollection.length - 1] 
    : updatedMovie.opening;

  const weekCollection = Math.floor(lastWeekCollection * dropRate);
  
  updatedMovie.weeklyCollection.push(weekCollection);
  updatedMovie.totalCollection += weekCollection;
  updatedMovie.currentWeek += 1;
  updatedMovie.currentDay += 7;
  
  updatedMovie.performance = updatePerformanceStatus(updatedMovie);

  return updatedMovie;
}

/**
 * Standalone Runner: Simulates all movies for a given number of days.
 */
export function simulateAllMovies(movies: BoxOfficeMovie[], days: number): BoxOfficeMovie[] {
  let currentMovies = [...movies];

  for (let d = 0; d < days; d++) {
    currentMovies = currentMovies.map(movie => {
      if (movie.status !== "Running") return movie;

      if (movie.releaseType === "weekly") {
        // Only simulate week if 7 days have passed since last week simulation
        // In a simple loop, we can just check if d is a multiple of 7
        if (d % 7 === 0) {
          return simulateWeek(movie);
        }
        return movie;
      } else {
        return simulateDay(movie);
      }
    });
  }

  return currentMovies;
}

/**
 * Formats the output for a movie.
 */
export function getMovieReport(movie: BoxOfficeMovie) {
  const lastCollection = movie.releaseType === "weekly" 
    ? (movie.weeklyCollection[movie.weeklyCollection.length - 1] || 0)
    : (movie.dailyCollection[movie.dailyCollection.length - 1] || 0);

  return {
    title: movie.title,
    totalCollection: movie.totalCollection,
    status: movie.performance || "N/A",
    lastCollection: lastCollection
  };
}
