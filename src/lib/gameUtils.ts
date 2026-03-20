import type { Talent, Genre, TalentType, ProductionPhase, RivalMovie } from '@/types/game';

const firstNames = ['James','Emma','Michael','Sophia','William','Olivia','Benjamin','Ava','Daniel','Isabella','Matthew','Mia','David','Charlotte','Joseph','Amelia','Andrew','Harper','Ryan','Evelyn','John','Abigail','Christopher','Emily','Nicholas','Elizabeth','Robert','Sofia','Joshua','Avery','Tyler','Ella','Alexander','Scarlett','Ethan','Grace','Jacob','Chloe','Lucas','Victoria','Mason','Riley','Logan','Aria','Jackson','Lily','Aiden','Aubrey','Caleb','Zoey'];
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts'];

const movieNouns: Record<Genre, string[]> = {
  Action: ['Warrior','Mission','Strike','Force','Revenge','Battle','Storm','Shadow','Protocol','Fallout'],
  Comedy: ['Party','Vacation','Mishap','Adventure','Trouble','Wedding','Family','Neighbors','Reunion','Night'],
  Drama: ['Promise','Choice','Journey','Legacy','Dream','Truth','Honor','Redemption','Sacrifice','Bond'],
  Horror: ['Nightmare','Curse','Whisper','Darkness','Terror','Haunting','Evil','Dread','Apparition','Shriek'],
  'Sci-Fi': ['Horizon','Nebula','Protocol','Genesis','Paradox','Vector','Cipher','Omega','Singularity','Nexus'],
  Romance: ['Kiss','Heart','Destiny','Serendipity','Forever','Always','Love','Passion','Affair','Waltz'],
  Thriller: ['Conspiracy','Deception','Betrayal','Identity','Suspect','Evidence','Motive','Alibi','Cipher','Target'],
  Animation: ['Kingdom','Wonder','Magic','Fantasy','Dream','Adventure','Quest','Legend','Fable','Tale'],
  Mystery: ['Clue','Enigma','Riddle','Secret','Shadow','Whisper','Cipher','Puzzle','Code','Labyrinth'],
  Fantasy: ['Realm','Dragon','Prophecy','Crown','Sword','Magic','Quest','Legend','Myth','Enchantment'],
  Documentary: ['Truth','Journey','Story','Vision','Chronicle','Legacy','Portrait','Insight','Revelation','Exposure'],
  Superhero: ['Origin','Rising','Dawn','Legacy','Chronicles','Alliance','Doom','Salvation','Vengeance','Guardian'],
  Western: ['Outlaw','Sheriff','Frontier','Dust','Reckoning','Gunslinger','Trail','Sunset','Ranch','Gold'],
  Musical: ['Melody','Rhythm','Symphony','Harmony','Encore','Stage','Broadway','Concert','Ballad','Opera'],
  War: ['Soldier','Battlefield','Victory','Defeat','Courage','Sacrifice','Honor','Glory','Invasion','Liberation'],
  Crime: ['Heist','Gangster','Detective','Undercover','Mafia','Cartel','Prison','Street','Empire','Syndicate'],
  Family: ['Adventure','Vacation','Holiday','Treasure','Journey','Together','Magic','Wonder','Dream','Home'],
  Noir: ['Shadow','Femme','Detective','Rain','City','Night','Betrayal','Sin','Guilt','Fate'],
  Adventure: ['Quest','Expedition','Discovery','Voyage','Frontier','Path','Compass','Summit','Wild','Uncharted'],
  Biography: ['Life','Story','Man','Woman','Genius','Leader','Rebel','Icon','Legend','Portrait'],
  History: ['Empire','Kingdom','Revolution','Century','Era','Legacy','Chronicle','Throne','Dynasty','Time'],
  Psychological: ['Mind','Mirror','Shattered','Labyrinth','Echo','Silence','Fragment','Void','Deep','Inside'],
  Slasher: ['Mask','Blade','Woods','Camp','Midnight','Final','Scream','Killer','Shadow','Night'],
  Supernatural: ['Spirit','Ghost','Beyond','Haunted','Entity','Portal','Other','Veil','Possession','Awakening'],
  Cyberpunk: ['Neon','Chrome','Glitch','System','Neural','Matrix','Grid','Carbon','Silicon','Protocol'],
  Steampunk: ['Steam','Gear','Clockwork','Brass','Engine','Aether','Iron','Valve','Crank','Piston'],
  Dystopian: ['Ruins','Ashes','Control','Resistance','Dust','Wall','System','Survival','End','New'],
  Satire: ['Mirror','Joke','Game','World','Modern','Society','Life','Truth','Laugh','Point'],
  Parody: ['Movie','Story','Hero','Quest','Legend','Tale','Epic','Saga','Fable','Chronicle'],
  Mockumentary: ['Life','Truth','Behind','Scenes','Real','Story','Camera','Lens','View','Focus'],
  Experimental: ['Vision','Light','Sound','Form','Space','Time','Color','Motion','Art','Mind'],
  Short: ['Moment','Brief','Glimpse','Flash','Snippet','Piece','Slice','Part','Bit','Fragment'],
  Anthology: ['Stories','Tales','Collection','Book','Volume','Chapter','Series','Parts','Set','Group'],
  Biopic: ['Life','Rise','Fall','Journey','Man','Woman','Legend','Star','Icon','Name'],
  'Period Piece': ['Era','Time','Century','Past','Age','Legacy','Throne','Court','Society','Class'],
  'Coming of Age': ['Summer','Change','Grow','Learn','First','Last','Road','Path','Life','New'],
};

export function generateName(): string {
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

export function generateMovieTitle(genre: Genre): string {
  const nouns = movieNouns[genre];
  return nouns[Math.floor(Math.random() * nouns.length)];
}

export function generateBio(name: string, type: TalentType): string {
  const bios: Record<TalentType, string[]> = {
    actor: [`${name} discovered acting in high school.`,`Won a prestigious award at 25.`,`Trained at drama school.`],
    director: [`${name} studied at film school.`,`Known for unique visual style.`,`Started in music videos.`],
    writer: [`${name} wrote first script as a barista.`,`Known for sharp dialogue.`,`Master of plot twists.`],
    cinematographer: [`${name} has eye for stunning shots.`,`Trained under legendary DPs.`],
    editor: [`${name} has natural sense of pacing.`,`Creates tension through editing.`],
    composer: [`${name} played piano since age 5.`,`Known for memorable themes.`],
    producer: [`${name} brings projects in on budget.`,`Known for spotting talent early.`],
    vfx: [`${name} was a digital artist at ILM.`,`Known for groundbreaking VFX.`],
    productionDesigner: [`${name} creates immersive worlds.`,`Known for stunning set design.`],
    costumeDesigner: [`${name} brings characters to life.`,`Known for period accuracy.`],
  };
  return bios[type][Math.floor(Math.random() * bios[type].length)];
}

const realActors: Partial<Talent>[] = [
  { name: 'Robert Downey Jr.', gender: 'Male', skill: 95, fame: 98, starPower: 99, type: 'actor', bio: 'The face of the MCU.' },
  { name: 'Scarlett Johansson', gender: 'Female', skill: 92, fame: 96, starPower: 95, type: 'actor', bio: 'Versatile action star.' },
  { name: 'Tom Holland', gender: 'Male', skill: 85, fame: 92, starPower: 90, type: 'actor', bio: 'Everyone\'s favorite web-slinger.' },
  { name: 'Zendaya', gender: 'Female', skill: 88, fame: 94, starPower: 92, type: 'actor', bio: 'Fashion icon and talented actress.' },
  { name: 'Chris Hemsworth', gender: 'Male', skill: 84, fame: 95, starPower: 93, type: 'actor', bio: 'The God of Thunder.' },
  { name: 'Florence Pugh', gender: 'Female', skill: 93, fame: 88, starPower: 85, type: 'actor', bio: 'Rising star with immense range.' },
  { name: 'Benedict Cumberbatch', gender: 'Male', skill: 96, fame: 90, starPower: 88, type: 'actor', bio: 'Master of the mystic arts.' },
  { name: 'Elizabeth Olsen', gender: 'Female', skill: 91, fame: 91, starPower: 89, type: 'actor', bio: 'The Scarlet Witch.' },
  { name: 'Ryan Reynolds', gender: 'Male', skill: 80, fame: 97, starPower: 96, type: 'actor', bio: 'The Merc with a Mouth.' },
  { name: 'Hugh Jackman', gender: 'Male', skill: 94, fame: 96, starPower: 95, type: 'actor', bio: 'The Wolverine.' },
  { name: 'Margot Robbie', gender: 'Female', skill: 94, fame: 98, starPower: 97, type: 'actor', bio: 'The definitive Harley Quinn and Barbie.' },
  { name: 'Cillian Murphy', gender: 'Male', skill: 97, fame: 90, starPower: 88, type: 'actor', bio: 'Intense and brilliant performer.' },
  { name: 'Emma Stone', gender: 'Female', skill: 95, fame: 94, starPower: 92, type: 'actor', bio: 'Oscar-winning talent with great comedic timing.' },
  { name: 'Pedro Pascal', gender: 'Male', skill: 89, fame: 95, starPower: 93, type: 'actor', bio: 'The internet\'s favorite daddy.' },
  { name: 'Jenna Ortega', gender: 'Female', skill: 86, fame: 92, starPower: 88, type: 'actor', bio: 'The new face of gothic horror.' },
  { name: 'Timothée Chalamet', gender: 'Male', skill: 92, fame: 95, starPower: 94, type: 'actor', bio: 'The prince of modern cinema.' },
  { name: 'Ana de Armas', gender: 'Female', skill: 88, fame: 90, starPower: 87, type: 'actor', bio: 'Captivating and talented star.' },
  { name: 'Austin Butler', gender: 'Male', skill: 90, fame: 88, starPower: 85, type: 'actor', bio: 'The king of rock and roll.' },
  { name: 'Tom Cruise', gender: 'Male', skill: 95, fame: 99, starPower: 99, type: 'actor', bio: 'The last true movie star.' },
  { name: 'Viola Davis', gender: 'Female', skill: 98, fame: 92, starPower: 90, type: 'actor', bio: 'An acting powerhouse.' },
  { name: 'Leonardo DiCaprio', gender: 'Male', skill: 96, fame: 98, starPower: 98, type: 'actor', bio: 'The king of the world (again).' },
  { name: 'Meryl Streep', gender: 'Female', skill: 99, fame: 97, starPower: 95, type: 'actor', bio: 'The greatest actress of her generation.' },
  { name: 'Denzel Washington', gender: 'Male', skill: 97, fame: 96, starPower: 96, type: 'actor', bio: 'Charisma and talent personified.' },
  { name: 'Cate Blanchett', gender: 'Female', skill: 98, fame: 93, starPower: 91, type: 'actor', bio: 'Ethereal and immensely talented.' },
  { name: 'Joaquin Phoenix', gender: 'Male', skill: 99, fame: 90, starPower: 88, type: 'actor', bio: 'Intense and transformative actor.' },
  { name: 'Jennifer Lawrence', gender: 'Female', skill: 90, fame: 95, starPower: 94, type: 'actor', bio: 'Relatable and incredibly talented.' },
  { name: 'Christian Bale', gender: 'Male', skill: 98, fame: 94, starPower: 93, type: 'actor', bio: 'The master of transformation.' },
  { name: 'Charlize Theron', gender: 'Female', skill: 93, fame: 94, starPower: 92, type: 'actor', bio: 'Action icon and dramatic force.' },
  { name: 'Keanu Reeves', gender: 'Male', skill: 82, fame: 98, starPower: 97, type: 'actor', bio: 'The internet\'s favorite assassin.' },
  { name: 'Gal Gadot', gender: 'Female', skill: 78, fame: 95, starPower: 94, type: 'actor', bio: 'The Wonder Woman.' },
  { name: 'Henry Cavill', gender: 'Male', skill: 84, fame: 94, starPower: 92, type: 'actor', bio: 'The Man of Steel.' },
  { name: 'Jason Momoa', gender: 'Male', skill: 75, fame: 93, starPower: 91, type: 'actor', bio: 'The King of Atlantis.' },
  { name: 'Brie Larson', gender: 'Female', skill: 94, fame: 90, starPower: 88, type: 'actor', bio: 'Captain Marvel and Oscar winner.' },
  { name: 'Tom Hardy', gender: 'Male', skill: 96, fame: 92, starPower: 90, type: 'actor', bio: 'Intense and physical performer.' },
  { name: 'Will Smith', gender: 'Male', skill: 88, fame: 98, starPower: 98, type: 'actor', bio: 'The Fresh Prince of blockbusters.' },
  { name: 'Angelina Jolie', gender: 'Female', skill: 90, fame: 97, starPower: 96, type: 'actor', bio: 'A global icon and talented actress.' },
  { name: 'Brad Pitt', gender: 'Male', skill: 94, fame: 98, starPower: 98, type: 'actor', bio: 'Charisma personified.' },
  { name: 'Natalie Portman', gender: 'Female', skill: 96, fame: 93, starPower: 91, type: 'actor', bio: 'Oscar winner with incredible range.' },
  { name: 'Idris Elba', gender: 'Male', skill: 92, fame: 91, starPower: 89, type: 'actor', bio: 'Cool, calm, and commanding.' },
  { name: 'Samuel L. Jackson', gender: 'Male', skill: 90, fame: 99, starPower: 98, type: 'actor', bio: 'The king of cool.' },
  { name: 'Morgan Freeman', gender: 'Male', skill: 98, fame: 99, starPower: 95, type: 'actor', bio: 'The voice of God.' },
  { name: 'Julia Roberts', gender: 'Female', skill: 92, fame: 97, starPower: 96, type: 'actor', bio: 'America\'s sweetheart.' },
  { name: 'George Clooney', gender: 'Male', skill: 93, fame: 97, starPower: 95, type: 'actor', bio: 'The ultimate leading man.' },
  { name: 'Sandra Bullock', gender: 'Female', skill: 90, fame: 96, starPower: 95, type: 'actor', bio: 'Beloved and talented star.' },
  { name: 'Dwayne Johnson', gender: 'Male', skill: 70, fame: 99, starPower: 99, type: 'actor', bio: 'The Rock.' },
  { name: 'Vin Diesel', gender: 'Male', skill: 65, fame: 96, starPower: 95, type: 'actor', bio: 'Family first.' },
  { name: 'Michelle Rodriguez', gender: 'Female', skill: 78, fame: 88, starPower: 85, type: 'actor', bio: 'The queen of action.' },
  { name: 'Ryan Gosling', gender: 'Male', skill: 93, fame: 94, starPower: 92, type: 'actor', bio: 'Charismatic and versatile leading man.' },
  { name: 'Joaquin Phoenix', gender: 'Male', skill: 99, fame: 90, starPower: 88, type: 'actor', bio: 'Master of transformative performances.' },
  { name: 'Emily Blunt', gender: 'Female', skill: 94, fame: 92, starPower: 90, type: 'actor', bio: 'Versatile and talented actress.' },
];

const realDirectors: Partial<Talent>[] = [
  { name: 'Steven Spielberg', gender: 'Male', skill: 99, fame: 99, starPower: 95, type: 'director', bio: 'The master of blockbusters.' },
  { name: 'Christopher Nolan', gender: 'Male', skill: 98, fame: 97, starPower: 98, type: 'director', bio: 'Master of mind-bending cinema.' },
  { name: 'Greta Gerwig', gender: 'Female', skill: 94, fame: 90, starPower: 92, type: 'director', bio: 'Visionary behind Barbie.' },
  { name: 'James Gunn', gender: 'Male', skill: 92, fame: 92, starPower: 90, type: 'director', bio: 'Architect of the new DCU.' },
  { name: 'Denis Villeneuve', gender: 'Male', skill: 97, fame: 88, starPower: 85, type: 'director', bio: 'Master of sci-fi epics.' },
  { name: 'Chloé Zhao', gender: 'Female', skill: 93, fame: 82, starPower: 75, type: 'director', bio: 'Oscar-winning visionary.' },
  { name: 'Quentin Tarantino', gender: 'Male', skill: 96, fame: 95, starPower: 94, type: 'director', bio: 'Master of dialogue and violence.' },
  { name: 'Martin Scorsese', gender: 'Male', skill: 98, fame: 96, starPower: 92, type: 'director', bio: 'The legend of cinema.' },
  { name: 'James Cameron', gender: 'Male', skill: 97, fame: 98, starPower: 99, type: 'director', bio: 'The king of the world.' },
  { name: 'Patty Jenkins', gender: 'Female', skill: 88, fame: 85, starPower: 82, type: 'director', bio: 'Visionary behind Wonder Woman.' },
  { name: 'Kathryn Bigelow', gender: 'Female', skill: 95, fame: 85, starPower: 80, type: 'director', bio: 'Master of intense action and drama.' },
  { name: 'Jordan Peele', gender: 'Male', skill: 94, fame: 92, starPower: 90, type: 'director', bio: 'The new master of social horror.' },
  { name: 'Sofia Coppola', gender: 'Female', skill: 91, fame: 88, starPower: 85, type: 'director', bio: 'Visionary of atmospheric cinema.' },
  { name: 'Wes Anderson', gender: 'Male', skill: 95, fame: 93, starPower: 91, type: 'director', bio: 'The master of symmetry and style.' },
  { name: 'Ava DuVernay', gender: 'Female', skill: 92, fame: 89, starPower: 87, type: 'director', bio: 'Powerful voice in modern cinema.' },
  { name: 'Zack Snyder', gender: 'Male', skill: 85, fame: 90, starPower: 88, type: 'director', bio: 'Master of visual spectacle.' },
  { name: 'Ridley Scott', gender: 'Male', skill: 96, fame: 94, starPower: 90, type: 'director', bio: 'Legend of sci-fi and historical epics.' },
  { name: 'David Fincher', gender: 'Male', skill: 97, fame: 92, starPower: 88, type: 'director', bio: 'Master of meticulous thrillers.' },
  { name: 'Bong Joon-ho', gender: 'Male', skill: 98, fame: 90, starPower: 85, type: 'director', bio: 'Oscar-winning visionary.' },
  { name: 'Guillermo del Toro', gender: 'Male', skill: 96, fame: 93, starPower: 90, type: 'director', bio: 'Master of dark fantasy.' },
  { name: 'Martin McDonagh', gender: 'Male', skill: 95, fame: 85, starPower: 80, type: 'director', bio: 'Master of dark comedy and dialogue.' },
  { name: 'Rian Johnson', gender: 'Male', skill: 92, fame: 88, starPower: 85, type: 'director', bio: 'Known for Knives Out and subverting tropes.' },
  { name: 'Taika Waititi', gender: 'Male', skill: 90, fame: 92, starPower: 88, type: 'director', bio: 'Unique voice in comedy and drama.' },
  { name: 'Emerald Fennell', gender: 'Female', skill: 88, fame: 80, starPower: 75, type: 'director', bio: 'Provocative director of Promising Young Woman.' },
];

const realWriters: Partial<Talent>[] = [
  { name: 'Aaron Sorkin', gender: 'Male', skill: 98, fame: 90, starPower: 80, type: 'writer', bio: 'Master of rapid-fire dialogue.' },
  { name: 'Phoebe Waller-Bridge', gender: 'Female', skill: 95, fame: 92, starPower: 88, type: 'writer', bio: 'Brilliant voice behind Fleabag.' },
  { name: 'Charlie Kaufman', gender: 'Male', skill: 97, fame: 85, starPower: 75, type: 'writer', bio: 'Master of surreal and meta narratives.' },
  { name: 'Shonda Rhimes', gender: 'Female', skill: 94, fame: 95, starPower: 92, type: 'writer', bio: 'The queen of television drama.' },
];

const realProducers: Partial<Talent>[] = [
  { name: 'Kevin Feige', gender: 'Male', skill: 99, fame: 98, starPower: 95, type: 'producer', bio: 'The architect of the MCU.' },
  { name: 'Kathleen Kennedy', gender: 'Female', skill: 96, fame: 94, starPower: 90, type: 'producer', bio: 'Legendary producer of Star Wars and more.' },
  { name: 'Jason Blum', gender: 'Male', skill: 92, fame: 90, starPower: 85, type: 'producer', bio: 'The king of modern low-budget horror.' },
  { name: 'Jerry Bruckheimer', gender: 'Male', skill: 95, fame: 96, starPower: 92, type: 'producer', bio: 'Master of high-octane blockbusters.' },
];

export function generateTalentPool(): Talent[] {
  const talents: Talent[] = [];
  const genres: Genre[] = ['Action','Comedy','Drama','Horror','Sci-Fi','Romance','Thriller','Animation','Mystery','Fantasy','Superhero','Crime'];
  
  // Add Real World Talent
  [...realActors, ...realDirectors, ...realWriters, ...realProducers].forEach((t, i) => {
    const skill = t.skill || 50;
    const fame = t.fame || 50;
    talents.push({
      id: `real-${t.type}-${i}`,
      name: t.name!,
      type: t.type as TalentType,
      gender: t.gender as 'Male' | 'Female',
      age: 25 + Math.floor(Math.random() * 40),
      salary: 1000000 + fame * 200000 + skill * 50000,
      skill,
      fame,
      starPower: t.starPower || fame,
      genreAffinity: { [genres[Math.floor(Math.random() * genres.length)]]: 1.5 },
      hired: i < 20, // Only first 20 are hired for demo
      bio: t.bio || ''
    });
  });

  for (let i = 0; i < 50; i++) {
    const name = generateName();
    const skill = Math.floor(30 + Math.random() * 70);
    const fame = Math.floor(20 + Math.random() * 80);
    const gender = Math.random() > 0.5 ? 'Male' : 'Female';
    talents.push({ id: `actor-${i}`, name, type: 'actor', gender, age: 20 + Math.floor(Math.random() * 40), salary: 100000 + fame * 100000 + skill * 20000, skill, fame, starPower: fame, genreAffinity: { [genres[Math.floor(Math.random() * genres.length)]]: 1.2 + Math.random() * 0.3 }, hired: i < 6, bio: generateBio(name, 'actor') });
  }
  for (let i = 0; i < 20; i++) {
    const name = generateName();
    const skill = Math.floor(40 + Math.random() * 60);
    const gender = Math.random() > 0.5 ? 'Male' : 'Female';
    talents.push({ id: `director-${i}`, name, type: 'director', gender, age: 30 + Math.floor(Math.random() * 35), salary: 500000 + skill * 50000, skill, fame: Math.floor(30 + Math.random() * 70), starPower: Math.floor(Math.random() * 100), genreAffinity: {}, hired: i < 3, bio: generateBio(name, 'director') });
  }
  for (let i = 0; i < 15; i++) {
    const name = generateName();
    const skill = Math.floor(35 + Math.random() * 65);
    const gender = Math.random() > 0.5 ? 'Male' : 'Female';
    talents.push({ id: `writer-${i}`, name, type: 'writer', gender, age: 25 + Math.floor(Math.random() * 30), salary: 300000 + skill * 20000, skill, fame: Math.floor(20 + Math.random() * 60), starPower: Math.floor(Math.random() * 40), genreAffinity: {}, hired: i < 2, bio: generateBio(name, 'writer') });
  }
  for (let i = 0; i < 12; i++) {
    const gender = Math.random() > 0.5 ? 'Male' : 'Female';
    talents.push({ id: `cinematographer-${i}`, name: generateName(), type: 'cinematographer', gender, age: 28 + Math.floor(Math.random() * 30), salary: 400000 + Math.floor(Math.random() * 60) * 15000, skill: Math.floor(40 + Math.random() * 60), fame: Math.floor(20 + Math.random() * 50), starPower: Math.floor(Math.random() * 30), genreAffinity: {}, hired: i < 2, bio: generateBio(generateName(), 'cinematographer') });
  }
  for (let i = 0; i < 12; i++) {
    const gender = Math.random() > 0.5 ? 'Male' : 'Female';
    talents.push({ id: `editor-${i}`, name: generateName(), type: 'editor', gender, age: 25 + Math.floor(Math.random() * 30), salary: 350000 + Math.floor(Math.random() * 60) * 12000, skill: Math.floor(40 + Math.random() * 60), fame: Math.floor(15 + Math.random() * 40), starPower: Math.floor(Math.random() * 25), genreAffinity: {}, hired: i < 2, bio: generateBio(generateName(), 'editor') });
  }
  for (let i = 0; i < 10; i++) {
    const gender = Math.random() > 0.5 ? 'Male' : 'Female';
    talents.push({ id: `composer-${i}`, name: generateName(), type: 'composer', gender, age: 30 + Math.floor(Math.random() * 35), salary: 450000 + Math.floor(Math.random() * 55) * 18000, skill: Math.floor(45 + Math.random() * 55), fame: Math.floor(30 + Math.random() * 60), starPower: Math.floor(Math.random() * 50), genreAffinity: {}, hired: i < 1, bio: generateBio(generateName(), 'composer') });
  }
  for (let i = 0; i < 10; i++) {
    const gender = Math.random() > 0.5 ? 'Male' : 'Female';
    talents.push({ id: `producer-${i}`, name: generateName(), type: 'producer', gender, age: 35 + Math.floor(Math.random() * 25), salary: 500000 + Math.floor(Math.random() * 60) * 20000, skill: Math.floor(40 + Math.random() * 60), fame: Math.floor(25 + Math.random() * 50), starPower: Math.floor(Math.random() * 40), genreAffinity: {}, hired: i < 2, bio: generateBio(generateName(), 'producer') });
  }
  for (let i = 0; i < 8; i++) {
    const gender = Math.random() > 0.5 ? 'Male' : 'Female';
    talents.push({ id: `vfx-${i}`, name: generateName(), type: 'vfx', gender, age: 28 + Math.floor(Math.random() * 25), salary: 600000 + Math.floor(Math.random() * 50) * 25000, skill: Math.floor(50 + Math.random() * 50), fame: Math.floor(20 + Math.random() * 40), starPower: Math.floor(Math.random() * 30), genreAffinity: {}, hired: i < 1, bio: generateBio(generateName(), 'vfx') });
  }
  for (let i = 0; i < 8; i++) {
    const gender = Math.random() > 0.5 ? 'Male' : 'Female';
    talents.push({ id: `pd-${i}`, name: generateName(), type: 'productionDesigner', gender, age: 30 + Math.floor(Math.random() * 30), salary: 400000 + Math.floor(Math.random() * 55) * 15000, skill: Math.floor(45 + Math.random() * 55), fame: Math.floor(20 + Math.random() * 40), starPower: Math.floor(Math.random() * 25), genreAffinity: {}, hired: i < 1, bio: generateBio(generateName(), 'productionDesigner') });
  }
  for (let i = 0; i < 8; i++) {
    const gender = Math.random() > 0.5 ? 'Male' : 'Female';
    talents.push({ id: `cd-${i}`, name: generateName(), type: 'costumeDesigner', gender, age: 28 + Math.floor(Math.random() * 30), salary: 350000 + Math.floor(Math.random() * 55) * 12000, skill: Math.floor(45 + Math.random() * 55), fame: Math.floor(20 + Math.random() * 40), starPower: Math.floor(Math.random() * 25), genreAffinity: {}, hired: i < 1, bio: generateBio(generateName(), 'costumeDesigner') });
  }
  
  return talents;
}

export function generateRivalMovie(week: number, year: number): RivalMovie {
  const studios = ['Warner Bros.', 'Disney', 'Universal', 'Paramount', 'Sony', 'Netflix', 'Apple TV+', 'A24', 'SigNify By Sike', 'Lionsgate', 'MGM', 'Blumhouse'];
  const genres: Genre[] = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Superhero', 'Thriller', 'Animation', 'Fantasy', 'Crime'];
  const studioName = studios[Math.floor(Math.random() * studios.length)];
  const genre = genres[Math.floor(Math.random() * genres.length)];
  
  const prefixes = ['The', 'Return of the', 'Rise of the', 'Dawn of', 'Legacy of', 'Shadow of', 'Last', 'Final', 'Beyond', 'Into the'];
  const usePrefix = Math.random() > 0.6;
  const baseTitle = generateMovieTitle(genre);
  const title = usePrefix ? `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${baseTitle}` : baseTitle;
  
  const quality = Math.floor(45 + Math.random() * 50);
  const budget = Math.floor(30000000 + Math.random() * 250000000);
  
  // More dynamic box office based on quality and budget
  const qualityMultiplier = 0.5 + (quality / 100) * 2; // 0.5 to 2.5
  const budgetMultiplier = 0.8 + Math.random() * 0.4;
  const openingWeekend = (budget * 0.2) * qualityMultiplier * budgetMultiplier;
  const totalBoxOffice = openingWeekend * (2.2 + Math.random() * 3);
  
  return {
    id: `rival-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    title,
    studioName,
    genres: [genre],
    quality,
    budget,
    releaseWeek: week,
    releaseYear: year,
    boxOffice: totalBoxOffice,
    director: generateName(),
    leadActor: generateName(),
    leadActress: generateName()
  };
}

export function formatMoney(amount: number): string {
  if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(2)}B`;
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getGenreColor(genre: Genre): string {
  const colors: Record<Genre, string> = {
    Action: '#ef4444', Comedy: '#fbbf24', Drama: '#8b5cf6', Horror: '#7c2d12', 'Sci-Fi': '#06b6d4', Romance: '#ec4899',
    Thriller: '#374151', Animation: '#10b981', Mystery: '#6366f1', Fantasy: '#a855f7', Documentary: '#14b8a6', Superhero: '#f97316',
    Western: '#d97706', Musical: '#f472b6', War: '#78716c', Crime: '#1f2937', Family: '#22c55e', Noir: '#000000',
    Adventure: '#3b82f6', Biography: '#60a5fa', History: '#92400e', Psychological: '#4c1d95', Slasher: '#991b1b',
    Supernatural: '#4338ca', Cyberpunk: '#d946ef', Steampunk: '#b45309', Dystopian: '#4b5563', Satire: '#facc15',
    Parody: '#a3e635', Mockumentary: '#2dd4bf', Experimental: '#818cf8', Short: '#94a3b8', Anthology: '#6b7280',
    Biopic: '#38bdf8', 'Period Piece': '#78350f', 'Coming of Age': '#fb7185',
  };
  return colors[genre];
}

export function getQualityColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#f5b800';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

export function getPhaseColor(phase: ProductionPhase): string {
  const colors: Record<ProductionPhase, string> = { 
    writing: '#a855f7',
    preProduction: '#06b6d4', 
    locations: '#3b82f6',
    filming: '#ef4444', 
    postProduction: '#f5b800', 
    marketing: '#22c55e', 
    released: '#10b981' 
  };
  return colors[phase];
}

export function getPhaseShortLabel(phase: ProductionPhase): string {
  const labels: Record<ProductionPhase, string> = { 
    writing: 'WRIT',
    preProduction: 'PRE', 
    locations: 'LOCS',
    filming: 'FILM', 
    postProduction: 'POST', 
    marketing: 'MKT', 
    released: 'OUT' 
  };
  return labels[phase];
}

export function generateFranchiseColors(): string[] {
  return ['#ef4444','#f97316','#f5b800','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f43f5e'];
}
