import type { ParticolareImageItem, ParticolareYoutubeItem } from "./particolare.js";
import { PARTICOLARE_CATEGORIES } from "../../shared/particolareCategories.js";
import type { ParticolareCategoryDef } from "../../shared/types.js";

// File generato: contenuti reali per il mondo "cieli" (IL GRANDIOSO BUZZ).
// Stesse 5 categorie di Grandioso Quiz Particolare (Animali, Serie TV, Film,
// Musica, Videogiochi), ma domande TUTTE DIVERSE da quelle usate lì, per non
// spoilerare le risposte a chi ha già giocato l'altro minigioco.
// Le immagini vivono in /public/buzz/<categoria>/<slug>-dettaglio.jpg e -intero.jpg

export const BUZZ_ANIMALI_ITEMS: ParticolareImageItem[] = [
  { id: "buzz-animali-nala", answer: "Nala (Il Re Leone)", detailUrl: "/buzz/animali/nala-dettaglio.jpg", fullUrl: "/buzz/animali/nala-intero.webp" },
  { id: "buzz-animali-timon", answer: "Timon (Il Re Leone)", detailUrl: "/buzz/animali/timon-dettaglio.png", fullUrl: "/buzz/animali/timon-intero.png" },
  { id: "buzz-animali-dumbo", answer: "Dumbo", detailUrl: "/buzz/animali/dumbo-dettaglio.jpg", fullUrl: "/buzz/animali/dumbo-intero.jpg" },
  { id: "buzz-animali-bambi", answer: "Bambi", detailUrl: "/buzz/animali/bambi-dettaglio.jpg", fullUrl: "/buzz/animali/bambi-intero.jpg" },
  { id: "buzz-animali-nemo", answer: "Nemo (Alla ricerca di Nemo)", detailUrl: "/buzz/animali/nemo-dettaglio.jpeg", fullUrl: "/buzz/animali/nemo-intero.jpeg" },
  { id: "buzz-animali-baloo", answer: "Baloo (Il Libro della Giungla)", detailUrl: "/buzz/animali/baloo-dettaglio.png", fullUrl: "/buzz/animali/baloo-intero.png" },
  { id: "buzz-animali-balto", answer: "Balto", detailUrl: "/buzz/animali/balto-dettaglio.jpg", fullUrl: "/buzz/animali/balto-intero.webp" },
  { id: "buzz-animali-alex", answer: "Alex (Madagascar)", detailUrl: "/buzz/animali/alex-dettaglio.jpg", fullUrl: "/buzz/animali/alex-intero.jpg" },
  { id: "buzz-animali-gloria", answer: "Gloria (Madagascar)", detailUrl: "/buzz/animali/gloria-dettaglio.jpg", fullUrl: "/buzz/animali/gloria-intero.jpg" },
  { id: "buzz-animali-gatto-con-gli-stivali", answer: "Il Gatto con gli Stivali (Shrek 2)", detailUrl: "/buzz/animali/gatto-con-gli-stivali-dettaglio.jpg", fullUrl: "/buzz/animali/gatto-con-gli-stivali-intero.jpg" },
  { id: "buzz-animali-garfield", answer: "Garfield", detailUrl: "/buzz/animali/garfield-dettaglio.png", fullUrl: "/buzz/animali/garfield-intero.png" },
  { id: "buzz-animali-tom", answer: "Tom (Tom & Jerry)", detailUrl: "/buzz/animali/tom-dettaglio.jpg", fullUrl: "/buzz/animali/tom-intero.jpg" },
  { id: "buzz-animali-scooby-doo", answer: "Scooby-Doo", detailUrl: "/buzz/animali/scooby-doo-dettaglio.jpg", fullUrl: "/buzz/animali/scooby-doo-intero.jpg" },
  { id: "buzz-animali-winnie-the-pooh", answer: "Winnie the Pooh", detailUrl: "/buzz/animali/winnie-the-pooh-dettaglio.png", fullUrl: "/buzz/animali/winnie-the-pooh-intero.png" },
  { id: "buzz-animali-ih-oh", answer: "Ih-Oh (Winnie the Pooh)", detailUrl: "/buzz/animali/ih-oh-dettaglio.jpg", fullUrl: "/buzz/animali/ih-oh-intero.jpg" },
  { id: "buzz-animali-babe", answer: "Babe, maialino coraggioso", detailUrl: "/buzz/animali/babe-dettaglio.jpg", fullUrl: "/buzz/animali/babe-intero.jpg" },
  { id: "buzz-animali-flipper", answer: "Flipper", detailUrl: "/buzz/animali/flipper-dettaglio.jpg", fullUrl: "/buzz/animali/flipper-intero.jpg" },
  { id: "buzz-animali-black-beauty", answer: "Black Beauty", detailUrl: "/buzz/animali/black-beauty-dettaglio.jpg", fullUrl: "/buzz/animali/black-beauty-intero.jpg" },
  { id: "buzz-animali-rocket-raccoon", answer: "Rocket Raccoon (Guardiani della Galassia)", detailUrl: "/buzz/animali/rocket-raccoon-dettaglio.jpg", fullUrl: "/buzz/animali/rocket-raccoon-intero.jpg" },
  { id: "buzz-animali-paperino", answer: "Paperino", detailUrl: "/buzz/animali/paperino-dettaglio.jpg", fullUrl: "/buzz/animali/paperino-intero.jpg" },
];

export const BUZZ_VIDEOGIOCHI_ITEMS: ParticolareImageItem[] = [
  { id: "buzz-videogiochi-super-mario-bros", answer: "Super Mario Bros", detailUrl: "/buzz/videogiochi/super-mario-bros-dettaglio.jpg", fullUrl: "/buzz/videogiochi/super-mario-bros-intero.jpg" },
  { id: "buzz-videogiochi-zelda", answer: "The Legend of Zelda", detailUrl: "/buzz/videogiochi/zelda-dettaglio.png", fullUrl: "/buzz/videogiochi/zelda-intero.png" },
  { id: "buzz-videogiochi-pac-man", answer: "Pac-Man", detailUrl: "/buzz/videogiochi/pac-man-dettaglio.png", fullUrl: "/buzz/videogiochi/pac-man-intero.png" },
  { id: "buzz-videogiochi-sonic", answer: "Sonic the Hedgehog", detailUrl: "/buzz/videogiochi/sonic-dettaglio.jpg", fullUrl: "/buzz/videogiochi/sonic-intero.jpg" },
  { id: "buzz-videogiochi-fortnite", answer: "Fortnite", detailUrl: "/buzz/videogiochi/fortnite-dettaglio.jpg", fullUrl: "/buzz/videogiochi/fortnite-intero.jpg" },
  { id: "buzz-videogiochi-among-us", answer: "Among Us", detailUrl: "/buzz/videogiochi/among-us-dettaglio.jpg", fullUrl: "/buzz/videogiochi/among-us-intero.jpg" },
  { id: "buzz-videogiochi-gta-v", answer: "Grand Theft Auto V", detailUrl: "/buzz/videogiochi/gta-v-dettaglio.jpg", fullUrl: "/buzz/videogiochi/gta-v-intero.jpg" },
  { id: "buzz-videogiochi-witcher-3", answer: "The Witcher 3", detailUrl: "/buzz/videogiochi/witcher-3-dettaglio.jpg", fullUrl: "/buzz/videogiochi/witcher-3-intero.jpg" },
  { id: "buzz-videogiochi-red-dead-redemption-2", answer: "Red Dead Redemption 2", detailUrl: "/buzz/videogiochi/red-dead-redemption-2-dettaglio.jpg", fullUrl: "/buzz/videogiochi/red-dead-redemption-2-intero.jpg" },
  { id: "buzz-videogiochi-god-of-war", answer: "God of War", detailUrl: "/buzz/videogiochi/god-of-war-dettaglio.jpg", fullUrl: "/buzz/videogiochi/god-of-war-intero.webp" },
  { id: "buzz-videogiochi-portal", answer: "Portal", detailUrl: "/buzz/videogiochi/portal-dettaglio.jpg", fullUrl: "/buzz/videogiochi/portal-intero.jpg" },
  { id: "buzz-videogiochi-doom", answer: "Doom", detailUrl: "/buzz/videogiochi/doom-dettaglio.jpg", fullUrl: "/buzz/videogiochi/doom-intero.jpg" },
  { id: "buzz-videogiochi-overwatch", answer: "Overwatch", detailUrl: "/buzz/videogiochi/overwatch-dettaglio.jpg", fullUrl: "/buzz/videogiochi/overwatch-intero.jpg" },
  { id: "buzz-videogiochi-league-of-legends", answer: "League of Legends", detailUrl: "/buzz/videogiochi/league-of-legends-dettaglio.jpg", fullUrl: "/buzz/videogiochi/league-of-legends-intero.jpg" },
  { id: "buzz-videogiochi-pokemon-videogioco", answer: "Pokémon (videogioco)", detailUrl: "/buzz/videogiochi/pokemon-videogioco-dettaglio.jpeg", fullUrl: "/buzz/videogiochi/pokemon-videogioco-intero.jpeg" },
  { id: "buzz-videogiochi-street-fighter-ii", answer: "Street Fighter II", detailUrl: "/buzz/videogiochi/street-fighter-ii-dettaglio.jpg", fullUrl: "/buzz/videogiochi/street-fighter-ii-intero.jpg" },
  { id: "buzz-videogiochi-mortal-kombat", answer: "Mortal Kombat", detailUrl: "/buzz/videogiochi/mortal-kombat-dettaglio.jpeg", fullUrl: "/buzz/videogiochi/mortal-kombat-intero.jpeg" },
  { id: "buzz-videogiochi-metal-gear-solid", answer: "Metal Gear Solid", detailUrl: "/buzz/videogiochi/metal-gear-solid-dettaglio.jpg", fullUrl: "/buzz/videogiochi/metal-gear-solid-intero.webp" },
  { id: "buzz-videogiochi-final-fantasy-vii", answer: "Final Fantasy VII", detailUrl: "/buzz/videogiochi/final-fantasy-vii-dettaglio.jpg", fullUrl: "/buzz/videogiochi/final-fantasy-vii-intero.jpg" },
  { id: "buzz-videogiochi-resident-evil", answer: "Resident Evil", detailUrl: "/buzz/videogiochi/resident-evil-dettaglio.jpg", fullUrl: "/buzz/videogiochi/resident-evil-intero.jpg" },
];

export const BUZZ_FILM_ITEMS: ParticolareImageItem[] = [
  { id: "buzz-film-harry-potter-pietra-filosofale", answer: "Harry Potter e la Pietra Filosofale", detailUrl: "/buzz/film/harry-potter-pietra-filosofale-dettaglio.jpg", fullUrl: "/buzz/film/harry-potter-pietra-filosofale-intero.jpg" },
  { id: "buzz-film-il-padrino", answer: "Il Padrino", detailUrl: "/buzz/film/il-padrino-dettaglio.jpeg", fullUrl: "/buzz/film/il-padrino-intero.jpeg" },
  { id: "buzz-film-pulp-fiction", answer: "Pulp Fiction", detailUrl: "/buzz/film/pulp-fiction-dettaglio.jpg", fullUrl: "/buzz/film/pulp-fiction-intero.jpg" },
  { id: "buzz-film-matrix", answer: "Matrix", detailUrl: "/buzz/film/matrix-dettaglio.jpg", fullUrl: "/buzz/film/matrix-intero.webp" },
  { id: "buzz-film-il-gladiatore", answer: "Il Gladiatore", detailUrl: "/buzz/film/il-gladiatore-dettaglio.jpg", fullUrl: "/buzz/film/il-gladiatore-intero.jpg" },
  { id: "buzz-film-inception", answer: "Inception", detailUrl: "/buzz/film/inception-dettaglio.jpg", fullUrl: "/buzz/film/inception-intero.jpg" },
  { id: "buzz-film-il-diavolo-veste-prada", answer: "Il Diavolo Veste Prada", detailUrl: "/buzz/film/il-diavolo-veste-prada-dettaglio.jpg", fullUrl: "/buzz/film/il-diavolo-veste-prada-intero.jpg" },
  { id: "buzz-film-la-vita-e-bella", answer: "La vita è bella", detailUrl: "/buzz/film/la-vita-e-bella-dettaglio.jpg", fullUrl: "/buzz/film/la-vita-e-bella-intero.jpg" },
  { id: "buzz-film-rocky", answer: "Rocky", detailUrl: "/buzz/film/rocky-dettaglio.jpg", fullUrl: "/buzz/film/rocky-intero.jpg" },
  { id: "buzz-film-et-extraterrestre", answer: "E.T. l'Extra-Terrestre", detailUrl: "/buzz/film/et-extraterrestre-dettaglio.jpg", fullUrl: "/buzz/film/et-extraterrestre-intero.jpg" },
  { id: "buzz-film-ritorno-al-futuro", answer: "Ritorno al Futuro", detailUrl: "/buzz/film/ritorno-al-futuro-dettaglio.jpg", fullUrl: "/buzz/film/ritorno-al-futuro-intero.webp" },
  { id: "buzz-film-fight-club", answer: "Fight Club", detailUrl: "/buzz/film/fight-club-dettaglio.jpg", fullUrl: "/buzz/film/fight-club-intero.jpg" },
  { id: "buzz-film-shrek", answer: "Shrek", detailUrl: "/buzz/film/shrek-dettaglio.jpg", fullUrl: "/buzz/film/shrek-intero.jpg" },
  { id: "buzz-film-interstellar", answer: "Interstellar", detailUrl: "/buzz/film/interstellar-dettaglio.jpg", fullUrl: "/buzz/film/interstellar-intero.jpg" },
  { id: "buzz-film-cappuccetto-rosso-insoliti-sospetti", answer: "Cappuccetto Rosso e gli Insoliti Sospetti", detailUrl: "/buzz/film/cappuccetto-rosso-insoliti-sospetti-dettaglio.jpg", fullUrl: "/buzz/film/cappuccetto-rosso-insoliti-sospetti-intero.jpg" },
  { id: "buzz-film-vita-di-pi", answer: "Vita di Pi", detailUrl: "/buzz/film/vita-di-pi-dettaglio.jpg", fullUrl: "/buzz/film/vita-di-pi-intero.jpg" },
  { id: "buzz-film-scarface", answer: "Scarface", detailUrl: "/buzz/film/scarface-dettaglio.jpg", fullUrl: "/buzz/film/scarface-intero.webp" },
  { id: "buzz-film-il-grande-lebowski", answer: "Il Grande Lebowski", detailUrl: "/buzz/film/il-grande-lebowski-dettaglio.jpg", fullUrl: "/buzz/film/il-grande-lebowski-intero.webp" },
  { id: "buzz-film-dirty-dancing", answer: "Dirty Dancing", detailUrl: "/buzz/film/dirty-dancing-dettaglio.jpg", fullUrl: "/buzz/film/dirty-dancing-intero.jpg" },
  { id: "buzz-film-grease", answer: "Grease", detailUrl: "/buzz/film/grease-dettaglio.jpg", fullUrl: "/buzz/film/grease-intero.jpg" },
];

export const BUZZ_MUSICA_ITEMS: ParticolareYoutubeItem[] = [
  { id: "buzz-musica-despacito", answer: "Despacito - Luis Fonsi feat. Daddy Yankee", videoId: "kJQP7kiw5Fk" },
  { id: "buzz-musica-shape-of-you", answer: "Shape of You - Ed Sheeran", videoId: "JGwWNGJdvx8" },
  { id: "buzz-musica-blinding-lights", answer: "Blinding Lights - The Weeknd", videoId: "4NRXx6U8ABQ" },
  { id: "buzz-musica-uptown-funk", answer: "Uptown Funk - Mark Ronson feat. Bruno Mars", videoId: "OPf0YbXqDm0" },
  { id: "buzz-musica-bad-romance", answer: "Bad Romance - Lady Gaga", videoId: "qrO4YZeyl0I" },
  { id: "buzz-musica-someone-like-you", answer: "Someone Like You - Adele", videoId: "hLQl3WQQoQ0" },
  { id: "buzz-musica-hey-ya", answer: "Hey Ya! - OutKast", videoId: "PWgvGjAhvIw" },
  { id: "buzz-musica-mr-brightside", answer: "Mr. Brightside - The Killers", videoId: "gGdGFtwCNBE" },
  { id: "buzz-musica-livin-la-vida-loca", answer: "Livin' la Vida Loca - Ricky Martin", videoId: "p47fEXGabaY" },
  { id: "buzz-musica-radioactive", answer: "Radioactive - Imagine Dragons", videoId: "ktvTqknDobU" },
  { id: "buzz-musica-counting-stars", answer: "Counting Stars - OneRepublic", videoId: "hT_nvWreIhg" },
  { id: "buzz-musica-sugar", answer: "Sugar - Maroon 5", videoId: "09R8_2nJtjg" },
  { id: "buzz-musica-happy", answer: "Happy - Pharrell Williams", videoId: "ZbZSe6N_BXs" },
  { id: "buzz-musica-thinking-out-loud", answer: "Thinking Out Loud - Ed Sheeran", videoId: "lp-EO5I60KA" },
  { id: "buzz-musica-levitating", answer: "Levitating - Dua Lipa feat. DaBaby", videoId: "TUVcZfQe-Kw" },
  { id: "buzz-musica-sweet-child-o-mine", answer: "Sweet Child O' Mine - Guns N' Roses", videoId: "1w7OgIMMRc4" },
  { id: "buzz-musica-smells-like-teen-spirit", answer: "Smells Like Teen Spirit - Nirvana", videoId: "hTWKbfoikeg" },
  { id: "buzz-musica-africa", answer: "Africa - Toto", videoId: "FTQbiNvZqaY" },
  { id: "buzz-musica-dont-stop-believin", answer: "Don't Stop Believin' - Journey", videoId: "-j2EgFx129w" },
  { id: "buzz-musica-andiamo-a-comandare", answer: "Andiamo a Comandare - Fabio Rovazzi", videoId: "Kifn_WVGReM" },
];

export const BUZZ_SERIE_TV_ITEMS: ParticolareYoutubeItem[] = [
  { id: "buzz-serietv-naruto", answer: "Naruto", videoId: "wwksOxljKzI" },
  { id: "buzz-serietv-one-piece", answer: "One Piece", videoId: "QFsZoCleX3w" },
  { id: "buzz-serietv-detective-conan", answer: "Detective Conan", videoId: "oUpfX6c0jpU" },
  { id: "buzz-serietv-digimon", answer: "Digimon", videoId: "85IXx6tstaQ" },
  { id: "buzz-serietv-yu-gi-oh", answer: "Yu-Gi-Oh!", videoId: "8Lk9B1fcKps" },
  { id: "buzz-serietv-puffi", answer: "I Puffi", videoId: "IX2jJat_6q0" },
  { id: "buzz-serietv-ducktales", answer: "DuckTales", videoId: "HP-nYbzLjSo" },
  { id: "buzz-serietv-lupin-iii", answer: "Lupin III", videoId: "rWbeoUuWa7o" },
  { id: "buzz-serietv-streghe", answer: "Streghe (Charmed)", videoId: "zGN54Jqo-iE" },
  { id: "buzz-serietv-buffy", answer: "Buffy l'Ammazzavampiri", videoId: "fKCkzApORq0" },
  { id: "buzz-serietv-twin-peaks", answer: "I Segreti di Twin Peaks", videoId: "mGioIh9wRg8" },
  { id: "buzz-serietv-lost", answer: "Lost", videoId: "9LDh8DefWpI" },
  { id: "buzz-serietv-dawsons-creek", answer: "Dawson's Creek", videoId: "47PaXLyf6HU" },
  { id: "buzz-serietv-melrose-place", answer: "Melrose Place", videoId: "QCb5swG47x8" },
  { id: "buzz-serietv-csi", answer: "CSI: Scena del Crimine", videoId: "BcWkUyU1MkY" },
  { id: "buzz-serietv-er", answer: "E.R. - Medici in Prima Linea", videoId: "z1KmRMJ6N2E" },
  { id: "buzz-serietv-alf", answer: "Alf", videoId: "FS4NK2fkj4w" },
  { id: "buzz-serietv-occhi-di-gatto", answer: "Occhi di Gatto", videoId: "H_oDhrBsVFA" },
  { id: "buzz-serietv-kiss-me-licia", answer: "Kiss Me Licia", videoId: "oSy93wFZMPw" },
  { id: "buzz-serietv-supernatural", answer: "Supernatural", videoId: "WZU516GI3Ac" },
];

function poolForCategory(categoryId: string): (ParticolareImageItem | ParticolareYoutubeItem)[] {
  switch (categoryId) {
    case "animali":
      return BUZZ_ANIMALI_ITEMS;
    case "videogiochi":
      return BUZZ_VIDEOGIOCHI_ITEMS;
    case "film":
      return BUZZ_FILM_ITEMS;
    case "musica":
      return BUZZ_MUSICA_ITEMS;
    case "serie-tv":
      return BUZZ_SERIE_TV_ITEMS;
    default:
      return [];
  }
}

// Pesca una categoria fra quelle che hanno ancora almeno una domanda fresca
// (IL GRANDIOSO BUZZ ha una sola domanda per round). Pool ed esclusione
// (playedBuzzItemIds) SEPARATI da quelli di Grandioso Quiz Particolare: le
// due categorie condividono solo nomi/emoji, non i contenuti. Se tutte e 5
// sono esaurite restituisce null, e sarà GameSession a disattivare "cieli".
export function pickRandomBuzzCategory(
  excludedIds: ReadonlySet<string>
): ParticolareCategoryDef | null {
  const withFresh = PARTICOLARE_CATEGORIES.filter(
    (c) => poolForCategory(c.id).some((item) => !excludedIds.has(item.id))
  );
  if (withFresh.length === 0) return null;
  return withFresh[Math.floor(Math.random() * withFresh.length)];
}

// Pesca UNA sola domanda dalla categoria, evitando quelle già giocate in
// questa partita. Non ripiega mai su domande già usate: se la categoria non
// ha più domande fresche (non dovrebbe succedere se si è passati da
// pickRandomBuzzCategory) restituisce null.
export function pickRandomBuzzItem(
  categoryId: string,
  excludedIds: ReadonlySet<string>
): ParticolareImageItem | ParticolareYoutubeItem | null {
  const fresh = poolForCategory(categoryId).filter((item) => !excludedIds.has(item.id));
  if (fresh.length === 0) return null;
  return fresh[Math.floor(Math.random() * fresh.length)];
}

// true se OGNI categoria ha esaurito le sue domande fresche: il mondo
// "cieli" va disattivato.
export function isBuzzWorldExhausted(excludedIds: ReadonlySet<string>): boolean {
  return PARTICOLARE_CATEGORIES.every((c) =>
    poolForCategory(c.id).every((item) => excludedIds.has(item.id))
  );
}
