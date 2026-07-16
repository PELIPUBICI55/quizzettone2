import type { ParticolareCategoryDef } from "../../shared/types.js";
import { PARTICOLARE_CATEGORIES } from "../../shared/particolareCategories.js";

// File generato: contenuti reali per il mondo "foresta" (GRANDIOSO QUIZ PARTICOLARE).
// Le immagini vivono in /public/particolare/<categoria>/<slug>-dettaglio.jpg e -intero.jpg
// I brani/sigle usano ID video YouTube reali verificati (IFrame Player API lato client).

export interface ParticolareImageItem {
  id: string;
  answer: string;
  detailUrl: string;
  fullUrl: string;
}

export interface ParticolareYoutubeItem {
  id: string;
  answer: string;
  videoId: string;
}

export const ANIMALI_ITEMS: ParticolareImageItem[] = [
  { id: "animali-simba", answer: "Simba (Il Re Leone)", detailUrl: "/particolare/animali/simba-dettaglio.jpg", fullUrl: "/particolare/animali/simba-intero.jpg" },
  { id: "animali-dory", answer: "Dory (Alla ricerca di Nemo)", detailUrl: "/particolare/animali/dory-dettaglio.jpg", fullUrl: "/particolare/animali/dory-intero.jpg" },
  { id: "animali-shere-khan", answer: "Shere Khan (Il Libro della Giungla)", detailUrl: "/particolare/animali/shere-khan-dettaglio.jpg", fullUrl: "/particolare/animali/shere-khan-intero.jpg" },
  { id: "animali-king-kong", answer: "King Kong", detailUrl: "/particolare/animali/king-kong-dettaglio.jpg", fullUrl: "/particolare/animali/king-kong-intero.jpg" },
  { id: "animali-lassie", answer: "Lassie", detailUrl: "/particolare/animali/lassie-dettaglio.jpg", fullUrl: "/particolare/animali/lassie-intero.jpg" },
  { id: "animali-hachiko", answer: "Hachiko", detailUrl: "/particolare/animali/hachiko-dettaglio.jpg", fullUrl: "/particolare/animali/hachiko-intero.jpg" },
  { id: "animali-king-julien", answer: "King Julien (Madagascar)", detailUrl: "/particolare/animali/king-julien-dettaglio.jpg", fullUrl: "/particolare/animali/king-julien-intero.jpg" },
  { id: "animali-marty", answer: "Marty (Madagascar)", detailUrl: "/particolare/animali/marty-dettaglio.jpg", fullUrl: "/particolare/animali/marty-intero.jpg" },
  { id: "animali-melman", answer: "Melman (Madagascar)", detailUrl: "/particolare/animali/melman-dettaglio.jpg", fullUrl: "/particolare/animali/melman-intero.jpg" },
  { id: "animali-ciuchino", answer: "Ciuchino (Shrek)", detailUrl: "/particolare/animali/ciuchino-dettaglio.jpg", fullUrl: "/particolare/animali/ciuchino-intero.jpg" },
  { id: "animali-jerry", answer: "Jerry (Tom & Jerry)", detailUrl: "/particolare/animali/jerry-dettaglio.jpg", fullUrl: "/particolare/animali/jerry-intero.jpg" },
  { id: "animali-pluto", answer: "Pluto (Disney)", detailUrl: "/particolare/animali/pluto-dettaglio.jpg", fullUrl: "/particolare/animali/pluto-intero.jpg" },
  { id: "animali-tigro", answer: "Tigro (Winnie the Pooh)", detailUrl: "/particolare/animali/tigro-dettaglio.jpg", fullUrl: "/particolare/animali/tigro-intero.jpg" },
  { id: "animali-willy", answer: "Willy (Free Willy)", detailUrl: "/particolare/animali/willy-dettaglio.jpg", fullUrl: "/particolare/animali/willy-intero.jpg" },
  { id: "animali-sdentato", answer: "Sdentato (Dragon Trainer)", detailUrl: "/particolare/animali/sdentato-dettaglio.jpg", fullUrl: "/particolare/animali/sdentato-intero.jpg" },
  { id: "animali-bugs-bunny", answer: "Bugs Bunny", detailUrl: "/particolare/animali/bugs-bunny-dettaglio.jpg", fullUrl: "/particolare/animali/bugs-bunny-intero.jpg" },
  { id: "animali-duffy-duck", answer: "Duffy Duck", detailUrl: "/particolare/animali/duffy-duck-dettaglio.jpg", fullUrl: "/particolare/animali/duffy-duck-intero.jpg" },
  { id: "animali-topolino", answer: "Topolino", detailUrl: "/particolare/animali/topolino-dettaglio.jpg", fullUrl: "/particolare/animali/topolino-intero.jpg" },
  { id: "animali-pumbaa", answer: "Pumbaa (Il Re Leone)", detailUrl: "/particolare/animali/pumbaa-dettaglio.jpg", fullUrl: "/particolare/animali/pumbaa-intero.jpg" },
];

export const VIDEOGIOCHI_ITEMS: ParticolareImageItem[] = [
  { id: "videogiochi-tetris", answer: "Tetris", detailUrl: "/particolare/videogiochi/tetris-dettaglio.jpg", fullUrl: "/particolare/videogiochi/tetris-intero.jpg" },
  { id: "videogiochi-minecraft", answer: "Minecraft", detailUrl: "/particolare/videogiochi/minecraft-dettaglio.jpg", fullUrl: "/particolare/videogiochi/minecraft-intero.jpg" },
  { id: "videogiochi-last-of-us", answer: "The Last of Us", detailUrl: "/particolare/videogiochi/last-of-us-dettaglio.jpg", fullUrl: "/particolare/videogiochi/last-of-us-intero.jpg" },
  { id: "videogiochi-half-life", answer: "Half-Life", detailUrl: "/particolare/videogiochi/half-life-dettaglio.jpg", fullUrl: "/particolare/videogiochi/half-life-intero.jpg" },
  { id: "videogiochi-world-of-warcraft", answer: "World of Warcraft", detailUrl: "/particolare/videogiochi/world-of-warcraft-dettaglio.jpg", fullUrl: "/particolare/videogiochi/world-of-warcraft-intero.jpg" },
  { id: "videogiochi-fifa", answer: "FIFA", detailUrl: "/particolare/videogiochi/fifa-dettaglio.jpg", fullUrl: "/particolare/videogiochi/fifa-intero.jpg" },
  { id: "videogiochi-call-of-duty", answer: "Call of Duty", detailUrl: "/particolare/videogiochi/call-of-duty-dettaglio.jpg", fullUrl: "/particolare/videogiochi/call-of-duty-intero.jpg" },
  { id: "videogiochi-animal-crossing", answer: "Animal Crossing", detailUrl: "/particolare/videogiochi/animal-crossing-dettaglio.jpg", fullUrl: "/particolare/videogiochi/animal-crossing-intero.jpg" },
  { id: "videogiochi-silent-hill", answer: "Silent Hill", detailUrl: "/particolare/videogiochi/silent-hill-dettaglio.jpg", fullUrl: "/particolare/videogiochi/silent-hill-intero.jpg" },
  { id: "videogiochi-assassins-creed", answer: "Assassin's Creed", detailUrl: "/particolare/videogiochi/assassins-creed-dettaglio.jpg", fullUrl: "/particolare/videogiochi/assassins-creed-intero.jpg" },
  { id: "videogiochi-dark-souls", answer: "Dark Souls", detailUrl: "/particolare/videogiochi/dark-souls-dettaglio.jpg", fullUrl: "/particolare/videogiochi/dark-souls-intero.jpg" },
  { id: "videogiochi-elden-ring", answer: "Elden Ring", detailUrl: "/particolare/videogiochi/elden-ring-dettaglio.jpg", fullUrl: "/particolare/videogiochi/elden-ring-intero.jpg" },
  { id: "videogiochi-cyberpunk-2077", answer: "Cyberpunk 2077", detailUrl: "/particolare/videogiochi/cyberpunk-2077-dettaglio.jpg", fullUrl: "/particolare/videogiochi/cyberpunk-2077-intero.jpg" },
  { id: "videogiochi-fallout", answer: "Fallout", detailUrl: "/particolare/videogiochi/fallout-dettaglio.jpg", fullUrl: "/particolare/videogiochi/fallout-intero.jpg" },
  { id: "videogiochi-bioshock", answer: "Bioshock", detailUrl: "/particolare/videogiochi/bioshock-dettaglio.jpg", fullUrl: "/particolare/videogiochi/bioshock-intero.jpg" },
  { id: "videogiochi-halo", answer: "Halo", detailUrl: "/particolare/videogiochi/halo-dettaglio.jpg", fullUrl: "/particolare/videogiochi/halo-intero.jpg" },
  { id: "videogiochi-crash-bandicoot", answer: "Crash Bandicoot", detailUrl: "/particolare/videogiochi/crash-bandicoot-dettaglio.jpg", fullUrl: "/particolare/videogiochi/crash-bandicoot-intero.jpg" },
  { id: "videogiochi-spyro", answer: "Spyro", detailUrl: "/particolare/videogiochi/spyro-dettaglio.jpg", fullUrl: "/particolare/videogiochi/spyro-intero.jpg" },
  { id: "videogiochi-kirby", answer: "Kirby", detailUrl: "/particolare/videogiochi/kirby-dettaglio.jpg", fullUrl: "/particolare/videogiochi/kirby-intero.jpg" },
  { id: "videogiochi-angry-birds", answer: "Angry Birds", detailUrl: "/particolare/videogiochi/angry-birds-dettaglio.jpg", fullUrl: "/particolare/videogiochi/angry-birds-intero.jpg" },
];

export const FILM_ITEMS: ParticolareImageItem[] = [
  { id: "film-titanic", answer: "Titanic", detailUrl: "/particolare/film/titanic-dettaglio.jpg", fullUrl: "/particolare/film/titanic-intero.jpg" },
  { id: "film-jurassic-park", answer: "Jurassic Park", detailUrl: "/particolare/film/jurassic-park-dettaglio.jpg", fullUrl: "/particolare/film/jurassic-park-intero.jpg" },
  { id: "film-star-wars", answer: "Star Wars: Una nuova speranza", detailUrl: "/particolare/film/star-wars-dettaglio.jpg", fullUrl: "/particolare/film/star-wars-intero.jpg" },
  { id: "film-signore-degli-anelli", answer: "Il Signore degli Anelli: La Compagnia dell'Anello", detailUrl: "/particolare/film/signore-degli-anelli-dettaglio.jpg", fullUrl: "/particolare/film/signore-degli-anelli-intero.jpg" },
  { id: "film-forrest-gump", answer: "Forrest Gump", detailUrl: "/particolare/film/forrest-gump-dettaglio.jpg", fullUrl: "/particolare/film/forrest-gump-intero.jpg" },
  { id: "film-avatar", answer: "Avatar", detailUrl: "/particolare/film/avatar-dettaglio.jpg", fullUrl: "/particolare/film/avatar-intero.jpg" },
  { id: "film-nuovo-cinema-paradiso", answer: "Nuovo Cinema Paradiso", detailUrl: "/particolare/film/nuovo-cinema-paradiso-dettaglio.jpg", fullUrl: "/particolare/film/nuovo-cinema-paradiso-intero.jpg" },
  { id: "film-lo-squalo", answer: "Lo Squalo", detailUrl: "/particolare/film/lo-squalo-dettaglio.jpg", fullUrl: "/particolare/film/lo-squalo-intero.jpg" },
  { id: "film-le-iene", answer: "Le Iene (Reservoir Dogs)", detailUrl: "/particolare/film/le-iene-dettaglio.jpg", fullUrl: "/particolare/film/le-iene-intero.jpg" },
  { id: "film-frozen", answer: "Frozen - Il Regno di Ghiaccio", detailUrl: "/particolare/film/frozen-dettaglio.jpg", fullUrl: "/particolare/film/frozen-intero.jpg" },
  { id: "film-toy-story", answer: "Toy Story", detailUrl: "/particolare/film/toy-story-dettaglio.jpg", fullUrl: "/particolare/film/toy-story-intero.jpg" },
  { id: "film-joker", answer: "Joker", detailUrl: "/particolare/film/joker-dettaglio.jpg", fullUrl: "/particolare/film/joker-intero.jpg" },
  { id: "film-cera-una-volta-in-america", answer: "C'era una volta in America", detailUrl: "/particolare/film/cera-una-volta-in-america-dettaglio.jpg", fullUrl: "/particolare/film/cera-una-volta-in-america-intero.jpg" },
  { id: "film-silenzio-degli-innocenti", answer: "Il Silenzio degli Innocenti", detailUrl: "/particolare/film/silenzio-degli-innocenti-dettaglio.jpg", fullUrl: "/particolare/film/silenzio-degli-innocenti-intero.jpg" },
  { id: "film-quei-bravi-ragazzi", answer: "Quei bravi ragazzi", detailUrl: "/particolare/film/quei-bravi-ragazzi-dettaglio.jpg", fullUrl: "/particolare/film/quei-bravi-ragazzi-intero.jpg" },
  { id: "film-pretty-woman", answer: "Pretty Woman", detailUrl: "/particolare/film/pretty-woman-dettaglio.jpg", fullUrl: "/particolare/film/pretty-woman-intero.jpg" },
  { id: "film-la-la-land", answer: "La La Land", detailUrl: "/particolare/film/la-la-land-dettaglio.jpg", fullUrl: "/particolare/film/la-la-land-intero.jpg" },
  { id: "film-mamma-mia", answer: "Mamma Mia!", detailUrl: "/particolare/film/mamma-mia-dettaglio.jpg", fullUrl: "/particolare/film/mamma-mia-intero.jpg" },
  { id: "film-avengers-endgame", answer: "Avengers: Endgame", detailUrl: "/particolare/film/avengers-endgame-dettaglio.jpg", fullUrl: "/particolare/film/avengers-endgame-intero.jpg" },
  { id: "film-cera-una-volta-il-west", answer: "C'era una volta il West", detailUrl: "/particolare/film/cera-una-volta-il-west-dettaglio.jpg", fullUrl: "/particolare/film/cera-una-volta-il-west-intero.jpg" },
];

export const MUSICA_ITEMS: ParticolareYoutubeItem[] = [
  { id: "musica-fireball", answer: "Fireball - Pitbull feat. John Ryan", videoId: "HMqgVXSvwGo" },
  { id: "musica-roar", answer: "Roar - Katy Perry", videoId: "CevxZvSJLk8" },
  { id: "musica-marvin-gaye", answer: "Marvin Gaye - Charlie Puth feat. Meghan Trainor", videoId: "igNVdlXhKcI" },
  { id: "musica-meravigliosa-creatura", answer: "MERAVIGLIOSA CREATURA - Fedez, Marco Masini & Hauser", videoId: "-DUTSLOIYHw" },
  { id: "musica-scream-and-shout", answer: "Scream & Shout - will.i.am feat. Britney Spears", videoId: "kYtGl1dX5qI" },
  { id: "musica-rain-over-me", answer: "Rain Over Me - Pitbull feat. Marc Anthony", videoId: "SmM0653YvXU" },
  { id: "musica-firestone", answer: "Firestone - Kygo feat. Conrad Sewell", videoId: "9Sc-ir2UwGU" },
  { id: "musica-american-boy", answer: "American Boy - Estelle feat. Kanye West", videoId: "FAD_5NWzM5g" },
  { id: "musica-hangover", answer: "Hangover - Taio Cruz feat. Flo Rida", videoId: "dLhFDYQHDQY" },
  { id: "musica-black-widow", answer: "Black Widow - Iggy Azalea feat. Rita Ora", videoId: "u3u22OYqFGo" },
  { id: "musica-less-i-know-the-better", answer: "The Less I Know The Better - Tame Impala", videoId: "sBzrzS1Ag_g" },
  { id: "musica-we-are-one", answer: "We Are One (Ole Ola) - Pitbull feat. Jennifer Lopez & Claudia Leitte", videoId: "ZZx73NyXxuA" },
  { id: "musica-cant-stop-the-feeling", answer: "CAN'T STOP THE FEELING! - Justin Timberlake", videoId: "ru0K8uYEZWw" },
  { id: "musica-grenade", answer: "Grenade - Bruno Mars", videoId: "SR6iYWJxHqs" },
  { id: "musica-watermelon-sugar", answer: "Watermelon Sugar - Harry Styles", videoId: "E07s5ZYygMg" },
  { id: "musica-dove-si-balla", answer: "Dove Si Balla - Dargen D'Amico", videoId: "rCdHk1eTe34" },
  { id: "musica-too-good-at-goodbyes", answer: "Too Good At Goodbyes - Sam Smith", videoId: "J_ub7Etch2U" },
  { id: "musica-nuovo-range", answer: "NUOVO RANGE - Rkomi feat. Sfera Ebbasta", videoId: "uu6vCPbEZdI" },
  { id: "musica-vaina-loca", answer: "Vaina Loca - Ozuna feat. Manuel Turizo", videoId: "bx-fuY7LpSU" },
  { id: "musica-timber", answer: "Timber - Pitbull feat. Kesha", videoId: "hHUbLv4ThOo" },
  { id: "musica-see-you-again", answer: "See You Again - Wiz Khalifa feat. Charlie Puth", videoId: "RgKAFK5djSk" },
  { id: "musica-unforgettable", answer: "Unforgettable - French Montana feat. Swae Lee", videoId: "CTFtOOh47oo" },
  { id: "musica-troublemaker", answer: "Troublemaker - Olly Murs feat. Flo Rida", videoId: "4aQDOUbErNg" },
  { id: "musica-someone-you-loved", answer: "Someone You Loved - Lewis Capaldi", videoId: "bCuhuePlP8o" },
  { id: "musica-stereo-hearts", answer: "Stereo Hearts - Gym Class Heroes feat. Adam Levine", videoId: "T3E9Wjbq44E" },
  { id: "musica-on-the-floor", answer: "On The Floor - Jennifer Lopez feat. Pitbull", videoId: "t4H_Zoh7G5A" },
  { id: "musica-poker-face", answer: "Poker Face - Lady Gaga", videoId: "bESGLojNYSo" },
  { id: "musica-mi-fai-impazzire", answer: "MI FAI IMPAZZIRE - Blanco feat. Sfera Ebbasta", videoId: "FJNOkLCIg5Y" },
  { id: "musica-im-not-the-only-one", answer: "I'm Not The Only One - Sam Smith", videoId: "nCkpzqqog4k" },
  { id: "musica-we-dont-talk-anymore", answer: "We Don't Talk Anymore - Charlie Puth feat. Selena Gomez", videoId: "3AtDnEC4zak" },
  { id: "musica-rock-your-body", answer: "Rock Your Body - Justin Timberlake", videoId: "TSVHoHyErBQ" },
  { id: "musica-scars-to-your-beautiful", answer: "Scars To Your Beautiful - Alessia Cara", videoId: "MWASeaYuHZo" },
  { id: "musica-fiel-remix", answer: "Fiel (Remix) - Wisin feat. Jhay Cortez, Anuel AA & Myke Towers", videoId: "bQOh1cvMo00" },
  { id: "musica-locked-out-of-heaven", answer: "Locked out of Heaven - Bruno Mars", videoId: "e-fA-gBCkj0" },
  { id: "musica-love-tonight", answer: "Love Tonight - Shouse", videoId: "awT8XJTMZdQ" },
  { id: "musica-tik-tok", answer: "TiK ToK - Kesha", videoId: "iP6XpLQM2Cs" },
  { id: "musica-ricchi-x-sempre", answer: "Ricchi x Sempre - Sfera Ebbasta", videoId: "TQPypKI6U-U" },
  { id: "musica-sexy-and-i-know-it", answer: "Sexy And I Know It - LMFAO", videoId: "wyx6JDQCslE" },
  { id: "musica-assereje-sanremo", answer: "Aserejé (Sanremo Remix) - Elettra Lamborghini & Las Ketchup", videoId: "aVy16bbVGPM" },
  { id: "musica-love-on-top", answer: "Love On Top - Beyoncé", videoId: "Ob7vObnFUJc" },
];

export const SERIE_TV_ITEMS: ParticolareYoutubeItem[] = [
  { id: "serie-tv-simpson", answer: "I Simpson", videoId: "zS23DlSm08s" },
  { id: "serie-tv-dragon-ball", answer: "Dragon Ball", videoId: "6dfUm55SZs0" },
  { id: "serie-tv-sailor-moon", answer: "Sailor Moon", videoId: "zZTlN3YkCuc" },
  { id: "serie-tv-pokemon", answer: "Pokémon", videoId: "7g7ZoH42uu4" },
  { id: "serie-tv-card-captor-sakura", answer: "Card Captor Sakura", videoId: "xBVLWnhxy60" },
  { id: "serie-tv-holly-e-benji", answer: "Holly e Benji", videoId: "LXttEQmD-H4" },
  { id: "serie-tv-ape-maia", answer: "L'Ape Maia", videoId: "cq2FYGQwcWI" },
  { id: "serie-tv-heidi", answer: "Heidi", videoId: "-yU92EWqORQ" },
  { id: "serie-tv-peppa-pig", answer: "Peppa Pig", videoId: "4MEa_7PkoUo" },
  { id: "serie-tv-friends", answer: "Friends", videoId: "Niu9Zmrx0p8" },
  { id: "serie-tv-trono-di-spade", answer: "Il Trono di Spade", videoId: "YGhCyXi5zkk" },
  { id: "serie-tv-breaking-bad", answer: "Breaking Bad", videoId: "a02i_Ik4GGM" },
  { id: "serie-tv-stranger-things", answer: "Stranger Things", videoId: "-RcPZdihrp4" },
  { id: "serie-tv-big-bang-theory", answer: "The Big Bang Theory", videoId: "8yggEAfcvYk" },
  { id: "serie-tv-how-i-met-your-mother", answer: "How I Met Your Mother", videoId: "AM3mcTS8NMo" },
  { id: "serie-tv-greys-anatomy", answer: "Grey's Anatomy", videoId: "0iuiHR5wNac" },
  { id: "serie-tv-beautiful", answer: "Beautiful", videoId: "Vr_f6z_yJb8" },
  { id: "serie-tv-posto-al-sole", answer: "Un posto al sole", videoId: "R67QeTzVw2o" },
  { id: "serie-tv-don-matteo", answer: "Don Matteo", videoId: "CIO7TXYJ8vA" },
  { id: "serie-tv-montalbano", answer: "Il Commissario Montalbano", videoId: "zD-MM8YlB2I" },
  { id: "serie-tv-cesaroni", answer: "I Cesaroni", videoId: "XZOKFzT0s3A" },
  { id: "serie-tv-boris", answer: "Boris", videoId: "VrxtRwvkL7Q" },
  { id: "serie-tv-gomorra", answer: "Gomorra - La serie", videoId: "q3XPkB1qTIw" },
  { id: "serie-tv-mr-robot", answer: "Mr. Robot", videoId: "fiJGIieelu4" },
  { id: "serie-tv-sherlock", answer: "Sherlock", videoId: "aIBXwnV1mb8" },
  { id: "serie-tv-doctor-who", answer: "Doctor Who", videoId: "75V4ClJZME4" },
  { id: "serie-tv-squid-game", answer: "Squid Game", videoId: "YaZbrXAs5Wg" },
  { id: "serie-tv-casa-di-carta", answer: "La Casa di Carta", videoId: "EF-vEuzNwGo" },
  { id: "serie-tv-narcos", answer: "Narcos", videoId: "lczzTwkaMOE" },
  { id: "serie-tv-peaky-blinders", answer: "Peaky Blinders", videoId: "KGD2N5hJ2e0" },
  { id: "serie-tv-black-mirror", answer: "Black Mirror", videoId: "jXq23Tq9FeU" },
  { id: "serie-tv-rick-and-morty", answer: "Rick and Morty", videoId: "wh10k2LPZiI" },
  { id: "serie-tv-spongebob", answer: "SpongeBob", videoId: "r9L4AseD-aA" },
  { id: "serie-tv-baywatch", answer: "Baywatch", videoId: "Ls-BLClZX7I" },
  { id: "serie-tv-macgyver", answer: "MacGyver", videoId: "VAiVTHFN_bo" },
  { id: "serie-tv-principe-di-belair", answer: "Willy, il Principe di Bel-Air", videoId: "1CLs9eSvZyM" },
  { id: "serie-tv-beverly-hills", answer: "Beverly Hills 90210", videoId: "JDOrOMuo-9o" },
  { id: "serie-tv-full-house", answer: "Full House", videoId: "TJsPgsYbFDg" },
  { id: "serie-tv-x-files", answer: "X-Files", videoId: "SGzSGxySJ9Y" },
  { id: "serie-tv-power-rangers", answer: "Power Rangers", videoId: "c1MTJn4F3QI" },
];

// Pesca una categoria fra quelle che hanno ancora almeno `count` item
// freschi (Grandioso Quiz Particolare ne pesca 2 a round). Una domanda già
// giocata non può più essere ripescata: se NESSUNA categoria ha più
// abbastanza item freschi restituisce null, e sarà GameSession a
// disattivare il mondo "foresta".
export function pickRandomParticolareCategory(
  count: number,
  excludedIds: ReadonlySet<string>
): ParticolareCategoryDef | null {
  const withEnoughFresh = PARTICOLARE_CATEGORIES.filter(
    (c) => poolForCategory(c.id).filter((item) => !excludedIds.has(item.id)).length >= count
  );
  if (withEnoughFresh.length === 0) return null;
  return withEnoughFresh[Math.floor(Math.random() * withEnoughFresh.length)];
}

// true se NESSUNA categoria ha più `count` item freschi: il mondo "foresta"
// va disattivato.
export function isParticolareWorldExhausted(count: number, excludedIds: ReadonlySet<string>): boolean {
  return PARTICOLARE_CATEGORIES.every(
    (c) => poolForCategory(c.id).filter((item) => !excludedIds.has(item.id)).length < count
  );
}

function poolForCategory(categoryId: string): (ParticolareImageItem | ParticolareYoutubeItem)[] {
  switch (categoryId) {
    case "animali":
      return ANIMALI_ITEMS;
    case "videogiochi":
      return VIDEOGIOCHI_ITEMS;
    case "film":
      return FILM_ITEMS;
    case "musica":
      return MUSICA_ITEMS;
    case "serie-tv":
      return SERIE_TV_ITEMS;
    default:
      return [];
  }
}

// Pesca `count` elementi distinti dalla categoria, evitando quelli già
// giocati in questa partita. Non ripiega mai su item già usati: se non ce ne
// sono abbastanza di freschi (non dovrebbe succedere se si è passati da
// pickRandomParticolareCategory) restituisce null.
export function pickRandomParticolareItems(
  categoryId: string,
  count: number,
  excludedIds: ReadonlySet<string>
): (ParticolareImageItem | ParticolareYoutubeItem)[] | null {
  const fresh = poolForCategory(categoryId).filter((item) => !excludedIds.has(item.id));
  if (fresh.length < count) return null;
  const shuffled = [...fresh].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
