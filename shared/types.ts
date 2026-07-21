// Tipi condivisi tra client (src/) e server (server/).
// Qualsiasi modifica qui impatta sia il frontend che il backend.

export type WorldId = string;
export type MinigameType = "quiz"; // in futuro: "memory" | "reaction" | "guess" | ...

export interface WorldDef {
  id: WorldId;
  name: string;
  emoji: string;
  tagline: string;
  colorFrom: string; // usati dal client per lo sfondo/gradiente della card mondo
  colorTo: string;
}

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  timeLimitSec: number;
  // correctIndex NON viene mai inviato al client prima della risposta
}

export type CardEffectType =
  | "extraTime" // aggiunge secondi al timer della domanda corrente
  | "removeWrongOption" // elimina una risposta sbagliata
  | "doubleCoins" // raddoppia le monete guadagnate dal prossimo minigioco vinto
  | "secondChance" // se sbagli, ti da comunque meta monete invece di zero
  | "skipQuestion" // salta la domanda corrente e ne pesca subito un'altra
  | "passiveFreeChest" // passivo: dopo ogni gioco a cui partecipi, ricevi lo status "baule gratis"
  | "stealAllFromTwo" // ruba tutte le monete a 2 giocatori scelti
  | "swapZeroTripleWin" // scambia posizione con un giocatore a scelta, gli azzera le monete, triplica la tua prossima vincita
  | "chooseNextCategory" // scegli la categoria del tuo prossimo gioco
  | "passiveDoubleImprevistoCoins" // passivo: raddoppia le monete guadagnate/rubate dagli imprevisti
  | "forceSkipTurn" // fai saltare il prossimo turno a un giocatore a scelta
  | "gainThreeShields" // guadagna 3 scudi
  | "moveAllToCittadella" // sposta tutti gli avversari alla Cittadella
  | "teleportSelfToCittadella" // teletrasportati alla Cittadella
  | "steal200Coins" // ruba 200 monete a un avversario a scelta
  | "swapPositionChosen" // scambiati di posizione con un giocatore a scelta
  | "gainFreeChest" // guadagna subito lo status baule gratis
  | "discardTwoRandomFromChosen" // fai scartare 2 figurine casuali a un giocatore a scelta
  | "gainDoubleWin" // guadagna lo status vincita raddoppiata
  | "advanceThreeTiles" // avanza di tre caselle
  | "moveChosenBackwardOne" // fai indietreggiare di una casella un giocatore a scelta
  | "gain20Coins" // guadagna 20 monete
  | "advanceOneTile" // avanza di una casella
  | "gainOneShield" // guadagna uno scudo
  | "gainRandomCommonCard" // ricevi una figurina comune casuale
  | "gainFreePack" // guadagna subito lo status pacchetto gratis
  | "extraRollThisTurn" // tira due volte il dado in questo turno
  | "steal20Coins" // ruba 20 monete a un avversario a scelta
  | "advanceTwoTiles"; // avanza di due caselle

export interface CardEffectDef {
  type: CardEffectType;
  value?: number;
  label: string; // descrizione leggibile, es. "+10 secondi al timer"
  isQuickEffect: boolean; // se true: usabile in qualsiasi momento, anche nel turno altrui
  isPassive?: boolean; // se true: sempre attivo finche possiedi la carta, non va "usata"
}

// "segreta" è una rarità speciale: una sola figurina in tutto il gioco (la
// 26esima), non legata a nessun mondo, che non compare mai nella collezione
// completa finché non viene trovata.
export type CardRarity = "comune" | "rara" | "epica" | "leggendaria" | "segreta";

export interface CardDef {
  id: string;
  name: string;
  rarity: CardRarity;
  emoji: string;
  image?: string; // percorso di un'illustrazione vera, se presente (altrimenti si usa emoji)
  description: string; // testo narrativo mostrato sulla carta, sopra l'effetto
  effect?: CardEffectDef; // assente per le figurine puramente da collezione (es. la segreta)
}

export interface PackDef {
  id: string;
  name: string;
  cost: number;
  cardCount: number;
  description: string;
}

export interface OwnedCard {
  instanceId: string;
  cardId: string;
  used: boolean; // effetto già attivato: conta ancora nella collezione ma non è più riutilizzabile
}

export interface BoardPosition {
  nodeId: string; // nodo corrente (se onNode) oppure nodo di partenza dell'attraversamento
  onNode: boolean;
  edgeId?: string; // ponte su cui ci si trova, se non su un nodo
  progress?: number; // caselle percorse sul ponte (1..length-1)
}

export type PawnToken = "hat" | "car" | "dog" | "boot" | "ship" | "wheelbarrow";

export type StatusType =
  | "skipTurn"
  | "freePack"
  | "freeChest"
  | "doubleWin"
  | "halveWin"
  | "tripleWin"
  | "shield";

export interface PlayerStatus {
  id: string;
  type: StatusType;
  label: string;
  emoji: string;
  description?: string;
}

export interface PlayerSummary {
  id: string;
  name: string;
  coins: number;
  isHost: boolean;
  connected: boolean;
  token: PawnToken | null;
  activeEffects: CardEffectType[]; // effetti carta già armati, pronti da usare
  statuses: PlayerStatus[]; // impalcatura generica per i futuri "status" di gioco
  cardCount: number; // quante carte possiede in totale (visibile agli altri, non quali)
  // Solo l'host può attivarla, e solo nella schermata di scelta pedine
  // (prima di avviare la partita): niente pedina, niente turni, niente
  // figurine/monete/vittoria. Serve per gestire il gioco "da fuori" senza
  // parteciparvi attivamente.
  isSpectator: boolean;
}

export interface MyState extends PlayerSummary {
  collection: OwnedCard[]; // ogni copia posseduta, con il suo stato used/non used
  pendingRoll: number | null; // numero uscito, in attesa che tu confermi lo spostamento
  pendingShop: boolean; // sei atterrato sulla Cittadella e stai visitando il mercante
  cardsUsedThisTurn: string[]; // id delle carte già attivate in questo turno (una per nome/id)
}

export interface GameStateSnapshot {
  code: string;
  // "finalRound": tutti i mondi hanno esaurito le domande, si è tornati alla
  // Cittadella con un bonus di monete per un ultimo giro di shopping a testa.
  // "ended": il giro finale è concluso, la partita è chiusa (vedi
  // GameEndedPayload per la classifica finale).
  phase: "lobby" | "playing" | "finalRound" | "ended";
  worlds: WorldDef[];
  packs: PackDef[];
  cardCatalog: CardDef[];
  players: PlayerSummary[];
  me: MyState;
  board: { edges: BoardEdgeLike[] };
  turnOrder: string[];
  currentTurnPlayerId: string | null;
  positions: Record<string, BoardPosition>;
  deactivatedWorldIds: string[]; // mondi le cui domande sono finite: mondo + suoi 3 ponti non più attraversabili
}

// Duplico qui solo la "forma" dell'arco (senza dipendere da shared/board.ts)
// per evitare un giro di import circolare tra i due file di tipi/dati.
export interface BoardEdgeLike {
  id: string;
  a: string;
  b: string;
  length: number;
  surprises: number[];
}

export interface JoinResult {
  ok: boolean;
  error?: string;
  code?: string;
}

export interface WheelSpinPayload {
  playerId: string;
  worldId: WorldId;
  resultType: MinigameType;
  durationMs: number;
}

export interface QuizQuestionPayload {
  playerId: string;
  question: QuizQuestion;
  activeEffects: CardEffectType[];
  eliminatedOptionIndex?: number; // opzione già eliminata dall'effetto "removeWrongOption"
}

export interface QuizResultPayload {
  playerId: string;
  correct: boolean;
  correctIndex: number;
  coinsAwarded: number;
}

export interface Top5CategoryDef {
  id: string;
  name: string;
  emoji: string;
}

export interface Top5Def {
  id: string;
  title: string;
  category?: string; // Top5CategoryDef["id"], collega la classifica alla sua categoria
  answers: string[]; // esattamente 5: answers[0] = 1° posto ... answers[4] = 5° posto
  source?: string; // da dove viene la classifica, mostrata in fondo alla schermata di gioco
}

export interface Top5Slot {
  rank: number; // 1-5
  answer: string | null; // null finché non rivelata dall'host
}

export interface Top5State {
  playerId: string; // chi sta giocando la top5
  title: string;
  slots: Top5Slot[];
  heartsBroken: number; // 0-3
  source?: string; // fonte della classifica, mostrata a tutti in fondo
  fullAnswers?: string[]; // presente SOLO nella versione mandata all'host
}

// --- Mondo "officina" (CARO AMICO TI SCRIVO) --------------------------------
// Come la Top5, ma invece di una classifica si estrae una PERSONA dalla
// ruota: il giocatore deve indovinare a voce la SUA risposta a una domanda
// personale. Per questo motivo il giocatore sceglie prima quale persona è
// lui stesso, così la ruota non lo mette mai a rispondere a una domanda di
// cui già conosce la risposta.

export interface CaroAmicoPersonaDef {
  id: string;
  name: string;
  emoji: string;
}

export interface CaroAmicoDomandaDef {
  id: string;
  question: string;
  answers: Record<string, string>; // personaId -> risposta corretta di quella persona
}

export interface CaroAmicoState {
  playerId: string; // chi sta rispondendo
  personaId: string;
  personaName: string;
  personaEmoji: string;
  question: string;
  revealed: boolean; // true dopo che l'host ha confermato la risposta detta a voce
  answer: string | null; // valorizzata solo quando revealed è true
  fullAnswer?: string; // presente SOLO nella versione mandata all'host, sempre valorizzata
}

// --- Mondo "abisso" (TCT) ------------------------------------------------
// Quiz a tempo tutti-contro-tutti: partecipano automaticamente tutti i
// giocatori connessi con almeno 100 monete, che vengono scalate e formano
// il montepremi. Si gioca su 4 domande pescate a caso (10 secondi a testa,
// 4 opzioni): chi risponde correttamente più in fretta guadagna più punti.
// A fine partita il montepremi va a chi ha totalizzato più punti (diviso
// equamente in caso di pareggio).

export interface TctQuestionPublic {
  question: string;
  options: string[]; // esattamente 4, correctIndex non incluso
}

export interface TctQuestionPayload {
  questionIndex: number; // 0-based
  totalQuestions: number;
  question: TctQuestionPublic;
  timeLimitSec: number;
  participantIds: string[]; // chi sta giocando questo turno di TCT
}

export interface TctAnswerResultEntry {
  playerId: string;
  correct: boolean;
  pointsAwarded: number;
}

export interface TctQuestionResultPayload {
  questionIndex: number;
  correctIndex: number;
  correctAnswerText: string;
  results: TctAnswerResultEntry[];
}

export interface TctStanding {
  playerId: string;
  totalPoints: number;
  coinsWon: number;
}

export interface TctEndedPayload {
  standings: TctStanding[]; // ordinata per punti decrescenti
  potTotal: number;
  winnerIds: string[]; // più di uno se pari merito
}

export interface TctStartedPayload {
  participantIds: string[];
  potTotal: number;
  entryFee: number;
}

export interface TctSkippedPayload {
  reason: string; // es. "nessun giocatore ha abbastanza monete"
}

// --- Mondo "deserto" (OCHO ALLA BOMBA) --------------------------------------
// Come la Top5, si estrae prima una categoria dalla ruota verticale, poi un
// "gioco" a caso in quella categoria (mai ripetuto nella stessa partita).
// A differenza di Top5/CaroAmico, però, qui è il giocatore stesso (non
// l'host) a interagire: ha davanti 9 risposte e le seleziona una a una
// cercando di evitare quella "bomba". L'host entra in gioco solo alla fine,
// per decidere quante monete assegnare (0/50/100).

export interface OchoCategoryDef {
  id: string;
  name: string;
  emoji: string;
}

export interface OchoCellPublic {
  text: string; // il testo della risposta è sempre visibile
  revealed: boolean;
  isBomb: boolean; // significativo solo se revealed è true
}

export interface OchoStatePayload {
  playerId: string; // chi sta giocando
  categoryName: string;
  categoryEmoji: string;
  prompt: string;
  cells: OchoCellPublic[]; // esattamente 9
  ended: boolean; // true quando non si può più selezionare (bomba trovata, o restava solo lei)
}

export interface OchoEndedPayload {
  playerId: string;
  coinsAwarded: number; // 0, 50 o 100
}

// --- Mondo "ghiacciaia" (ACCHIAPPA LA PAPERA) -------------------------------
// Come la Top5/Ocho, si estrae prima una categoria dalla ruota verticale
// (mai ripetuta nella stessa partita). A differenza di tutti gli altri
// minigiochi, qui NON è mai coinvolto l'host: il giocatore di turno
// risponde da solo a un quiz di massimo 4 domande (2 opzioni ciascuna,
// ordine rimescolato a ogni pesca) e deve azzeccarne 3 su 4 per accedere
// alla griglia premi; il quiz si interrompe subito appena la terza risposta
// giusta o il secondo errore rendono l'esito matematicamente deciso. Se
// qualificato, sceglie UNA delle 9 caselle della griglia: si rivelano
// SUBITO tutti i 9 premi nascosti, ma solo quello della cella scelta viene
// assegnato in monete. Tutto l'esito (successo o fallimento) è calcolato e
// applicato in automatico dal server, senza alcuna conferma dell'host.

export interface DuckCategoryDef {
  id: string;
  name: string;
  emoji: string;
}

export interface DuckQuestionPublic {
  question: string;
  options: string[]; // esattamente 2, correctIndex non incluso
}

export interface DuckQuestionPayload {
  playerId: string;
  categoryName: string;
  categoryEmoji: string;
  questionIndex: number; // 0-based, quale domanda è (tra le 4 disponibili)
  totalQuestions: number; // sempre 4
  question: DuckQuestionPublic;
  correctSoFar: number;
  wrongSoFar: number;
}

export interface DuckAnswerResultPayload {
  playerId: string;
  questionIndex: number;
  correct: boolean;
  correctIndex: number;
  correctSoFar: number;
  wrongSoFar: number;
  qualified: boolean; // true se ha appena raggiunto 3 risposte corrette: accede alla griglia premi
  failed: boolean; // true se ha appena raggiunto 2 errori prima di qualificarsi: prova persa, niente griglia
}

export interface DuckCellPublic {
  revealed: boolean;
  prize: number | null; // valorizzato solo quando revealed è true
  chosen: boolean; // true SOLO per la cella scelta dal giocatore (il premio davvero assegnato)
}

export interface DuckGridStatePayload {
  playerId: string;
  categoryName: string;
  categoryEmoji: string;
  cells: DuckCellPublic[]; // esattamente 9
}

export interface DuckEndedPayload {
  playerId: string;
  coinsAwarded: number; // 0 se il quiz è fallito prima della griglia, altrimenti il premio scelto
}

// --- Mondo "foresta" (GRANDIOSO QUIZ PARTICOLARE) ---------------------------
// Gioca solo il giocatore di turno, che risponde A VOCE a 2 domande pescate
// dalla categoria estratta dalla ruota (Animali, Serie TV, Film, Musica,
// Videogiochi). Come in CaroAmico/Ocho, è l'host a gestire i controlli
// (prossima domanda / svela risposta / assegna monete): qui l'host decide
// un unico premio finale per l'intero minigioco (0, 50 o 100 monete).
// Animali/Videogiochi/Film mostrano un'immagine (un dettaglio ravvicinato,
// poi alla rivelazione anche la foto intera); Musica/Serie TV riproducono
// un video YouTube (audio condiviso con tutti i client, ma il player video
// visibile SOLO all'host per non spoilerare la risposta agli altri).

export type ParticolareCategoryId = "animali" | "serie-tv" | "film" | "musica" | "videogiochi";
export type ParticolareMediaKind = "image" | "youtube";

export interface ParticolareCategoryDef {
  id: ParticolareCategoryId;
  name: string;
  emoji: string;
  mediaKind: ParticolareMediaKind;
}

export type ParticolareMediaPublic =
  | { kind: "image"; detailUrl: string; fullUrl?: string } // fullUrl valorizzato solo dopo la rivelazione
  | { kind: "youtube"; videoId: string }; // sempre presente: l'audio deve suonare su OGNI client;
  // è il client stesso a nascondere visivamente il player se non è l'host

export interface ParticolareQuestionPayload {
  playerId: string;
  categoryId: ParticolareCategoryId;
  categoryName: string;
  categoryEmoji: string;
  questionIndex: number; // 0 oppure 1
  totalQuestions: number; // sempre 2
  media: ParticolareMediaPublic;
  revealed: boolean;
  answer: string | null; // valorizzata solo quando revealed è true
}

export interface ParticolareMediaControlPayload {
  action: "play" | "pause" | "rewind";
}

export interface ParticolareEndedPayload {
  playerId: string;
  coinsAwarded: number;
}

export interface PackOpenedPayload {
  packId: string;
  cards: { card: CardDef; capped: boolean }[]; // capped = limite di 5 copie già raggiunto, non aggiunta
}

// IL GRANDIOSO BUZZ (mondo "cieli"): a differenza di Grandioso Quiz
// Particolare, qui giocano TUTTI i giocatori insieme, non solo quello di
// turno. Stessa ruota delle 5 categorie (Animali, Serie TV, Film, Musica,
// Videogiochi, riusa ParticolareCategoryId/ParticolareMediaPublic perché
// identiche), ma una sola domanda per round, che vale fissa 100 monete.
// I giocatori premono il buzzer per prenotarsi (in ordine, tutti visibili in
// un pannello laterale); l'host può resettare la coda dei buzz in qualsiasi
// momento, svelare la risposta, e infine assegnare i 100 punti a UNO dei
// giocatori che hanno buzzato oppure a nessuno.
export interface BuzzQuestionPayload {
  categoryId: ParticolareCategoryId;
  categoryName: string;
  categoryEmoji: string;
  media: ParticolareMediaPublic;
  revealed: boolean;
  answer: string | null; // valorizzata solo quando revealed è true
  buzzOrder: string[]; // playerId in ordine di pressione del buzzer
}

export interface BuzzEndedPayload {
  winnerId: string | null; // null = l'host non ha assegnato punti a nessuno
  coinsAwarded: number;
}

// SFIDA GINO (mondo "rovine"): gioca solo il giocatore di turno, a voce,
// come in Grandioso Quiz Particolare. Una ruota estrae una fra 2 categorie
// (Indovina la Capitale / Indovina la Bandiera), poi una sola domanda al suo
// interno. Il premio è fisso e binario: 2000 monete oppure 0, deciso
// dall'host dopo aver sentito la risposta a voce.
export type SfidaGinoCategoryId = "capitali" | "bandiere";

export interface SfidaGinoCategoryDef {
  id: SfidaGinoCategoryId;
  name: string;
  emoji: string;
}

// Per "capitali" il prompt è testuale (il nome dello stato, la risposta è la
// capitale); per "bandiere" il prompt è l'immagine della bandiera (la
// risposta è il nome dello stato).
export type SfidaGinoPrompt =
  | { kind: "text"; text: string }
  | { kind: "image"; imageUrl: string };

export interface SfidaGinoQuestionPayload {
  playerId: string;
  categoryId: SfidaGinoCategoryId;
  categoryName: string;
  categoryEmoji: string;
  questionIndex: number; // 0, 1 oppure 2
  totalQuestions: number; // sempre SFIDA_GINO_ROUND_COUNT (si gioca al meglio di N)
  prompt: SfidaGinoPrompt;
  revealed: boolean;
  answer: string | null; // valorizzata solo quando revealed è true
}

export interface SfidaGinoEndedPayload {
  playerId: string;
  coinsAwarded: number; // 2000 oppure 0
}

// Fine partita: quando TUTTI gli 8 mondi hanno esaurito le domande, si torna
// alla Cittadella con un bonus di monete per un ultimo giro di shopping a
// testa (un turno solo, per giocatore), poi si decreta il vincitore. Standings
// già ordinate dal server: 1° posto per primo, ordinamento (1) carte diverse
// possedute, (2) copie totali possedute, (3) monete rimaste.
export interface GameEndedStandingEntry {
  playerId: string;
  distinctCards: number; // carte diverse possedute, su totalCardCount
  totalCards: number; // copie totali possedute (somma di tutte le carte, doppioni inclusi)
  coins: number;
}

export interface GameEndedPayload {
  standings: GameEndedStandingEntry[];
  winnerIds: string[]; // più di uno solo in caso di parità totale su tutti e 3 i criteri
  totalCardCount: number; // CARD_CATALOG.length, per mostrare "23/25"
  // "worldsExhausted": vittoria decretata a fine partita normale (tutti i
  // mondi esauriti + giro finale di shopping), coi 3 criteri di parimerito.
  // "collectionComplete": un giocatore ha completato l'intera collezione (25
  // figurine normali, la segreta non è richiesta) durante il gioco normale:
  // la partita finisce all'istante, senza giro finale né parimerito.
  reason: "worldsExhausted" | "collectionComplete";
}

export type SurpriseEffectCode =
  | "moveForward"
  | "moveBackward"
  | "skipNextTurn"
  | "rollAgain"
  | "loseCoins"
  | "gainCoins"
  | "stealCoins"
  | "loseAllCoins"
  | "discardChosenCard"
  | "discardRandomCard"
  | "freePack"
  | "swapChosen"
  | "swapRandom"
  | "nothing"
  | "returnToCittadella"
  | "doubleNextWin"
  | "halveNextWin"
  | "gainShield";

export interface SurpriseCardDef {
  id: string;
  text: string; // il testo narrativo della carta
  effectLabel: string; // l'etichetta dell'effetto, mostrata sulla carta (es. "AVANZA DI DUE CASELLE")
  effectCode: SurpriseEffectCode;
  amount?: number;
}

export interface SurpriseDrawnPayload {
  playerId: string;
  text: string;
  effectLabel: string;
}

export type ChoiceKind = "player" | "card" | "category";

export interface ChoiceOption {
  id: string;
  label: string;
}

export interface ChooseTargetPayload {
  kind: ChoiceKind;
  prompt: string;
  options: ChoiceOption[];
}

// Eventi client -> server
export interface ClientToServerEvents {
  "party:create": (
    payload: { name: string; clientId: string },
    cb: (res: JoinResult) => void
  ) => void;
  "party:join": (
    payload: { code: string; name: string; clientId: string },
    cb: (res: JoinResult) => void
  ) => void;
  "party:start": () => void;
  "party:kick": (payload: { playerId: string }) => void;
  "party:setCoins": (payload: { playerId: string; amount: number }) => void;
  "party:chooseToken": (payload: { token: PawnToken }) => void;
  // Solo l'host, solo nella lobby (prima di avviare la partita): passa tra
  // "giocatore" e "spettatore". Da spettatore non sceglie pedina, non entra
  // nell'ordine dei turni e non partecipa alla partita.
  "party:setSpectator": (payload: { spectator: boolean }) => void;
  "board:roll": () => void;
  "board:confirmMove": (payload: { direction?: string }) => void;
  "quiz:answer": (payload: {
    questionId: string;
    answerIndex: number | null;
  }) => void;
  "card:use": (payload: { cardId: string }) => void;
  // Salva la partita su disco lato server così può essere ripresa più tardi
  // ricollegandosi con lo stesso codice stanza (anche dopo un riavvio del
  // server). Qualsiasi minigioco in corso per qualunque giocatore viene
  // annullato: tutti si ritrovano sulla mappa pronti per il turno successivo.
  "game:save": () => void;
  "shop:buyPack": (payload: { packId: string }) => void;
  "shop:leave": () => void;
  "board:beginMinigame": () => void;
  "board:beginQuiz": () => void;
  "board:closeSurprise": () => void;
  "board:submitChoice": (payload: { optionId: string }) => void;
  "board:useShieldResponse": (payload: { use: boolean }) => void;
  "top5:reveal": (payload: { rank: number }) => void;
  "top5:breakHeart": () => void;
  "top5:resolve": (payload: { won: boolean }) => void;
  "top5:beginGame": () => void;
  "caroamico:chooseSelf": (payload: { personaId: string | null }) => void;
  "caroamico:beginGame": () => void;
  "caroamico:reveal": () => void;
  "caroamico:resolve": (payload: { won: boolean }) => void;
  "tct:answer": (payload: { answerIndex: number | null }) => void;
  "ocho:beginGame": () => void;
  "ocho:select": (payload: { index: number }) => void;
  "ocho:resolve": (payload: { coinsAwarded: number }) => void;
  "duck:beginGame": () => void;
  "duck:answer": (payload: { questionIndex: number; answerIndex: number | null }) => void;
  "duck:selectCell": (payload: { index: number }) => void;
  "particolare:beginGame": () => void;
  "particolare:nextQuestion": () => void;
  "particolare:reveal": () => void;
  "particolare:mediaControl": (payload: ParticolareMediaControlPayload) => void;
  "particolare:resolve": (payload: { coinsAwarded: number }) => void;
  "buzz:beginGame": () => void;
  "buzz:press": () => void;
  "buzz:reset": () => void;
  "buzz:reveal": () => void;
  "buzz:mediaControl": (payload: ParticolareMediaControlPayload) => void;
  "buzz:resolve": (payload: { winnerId: string | null }) => void;
  "sfidaGino:beginGame": () => void;
  "sfidaGino:reveal": () => void;
  "sfidaGino:nextQuestion": () => void;
  "sfidaGino:resolve": (payload: { coinsAwarded: number }) => void;
}

// Eventi server -> client
export interface ServerToClientEvents {
  "world:welcome": (payload: { playerId: string; worldId: string }) => void;
  "wheel:spin": (payload: {
    playerId: string;
    worldId: string;
    resultType: "quiz";
    durationMs: number;
  }) => void;
  "wheel:result": (payload: { playerId: string; worldId: string; resultType: "quiz" }) => void;
  "quiz:question": (payload: {
    playerId: string;
    question: QuizQuestion;
    activeEffects: CardEffectType[];
    eliminatedOptionIndex?: number;
  }) => void;
  "quiz:result": (payload: {
    playerId: string;
    correct: boolean;
    correctIndex: number;
    coinsAwarded: number;
  }) => void;
  "board:diceRolled": (payload: { playerId: string; value: number }) => void;
  "board:surpriseDrawn": (payload: { playerId: string; text: string; effectLabel: string }) => void;
  "board:useShieldPrompt": (payload: { message: string }) => void;
  "board:shieldUsed": (payload: { playerId: string }) => void;
  "board:chooseTarget": (payload: ChooseTargetPayload) => void;
  "state:update": (payload: GameStateSnapshot) => void;
  "error:message": (payload: { message: string }) => void;
  "party:kicked": () => void;
  "shop:packOpened": (payload: PackOpenedPayload) => void;

  "top5:spin": (payload: { playerId: string; durationMs: number }) => void;
  "top5:categoryDrawn": (payload: { playerId: string; categoryId: string; categoryName: string; categoryEmoji: string }) => void;
  "top5:state": (payload: Top5State) => void;
  "top5:ended": (payload: { playerId: string; won: boolean; coinsAwarded: number }) => void;

  "caroamico:selfChoicePrompt": (
    payload: { playerId: string; personas: CaroAmicoPersonaDef[]; currentSelfId: string | null }
  ) => void;
  "caroamico:spin": (payload: { playerId: string; durationMs: number }) => void;
  "caroamico:personaDrawn": (
    payload: { playerId: string; personaId: string; personaName: string; personaEmoji: string }
  ) => void;
  "caroamico:state": (payload: CaroAmicoState) => void;
  "caroamico:ended": (payload: { playerId: string; won: boolean; coinsAwarded: number }) => void;

  "tct:skipped": (payload: TctSkippedPayload) => void;
  "tct:started": (payload: TctStartedPayload) => void;
  "tct:question": (payload: TctQuestionPayload) => void;
  "tct:questionResult": (payload: TctQuestionResultPayload) => void;
  "tct:ended": (payload: TctEndedPayload) => void;

  "ocho:spin": (payload: { playerId: string; durationMs: number }) => void;
  "ocho:categoryDrawn": (
    payload: { playerId: string; categoryId: string; categoryName: string; categoryEmoji: string }
  ) => void;
  "ocho:state": (payload: OchoStatePayload) => void;
  "ocho:ended": (payload: { playerId: string; coinsAwarded: number }) => void;

  "duck:spin": (payload: { playerId: string; durationMs: number }) => void;
  "duck:categoryDrawn": (
    payload: { playerId: string; categoryId: string; categoryName: string; categoryEmoji: string }
  ) => void;
  "duck:question": (payload: DuckQuestionPayload) => void;
  "duck:answerResult": (payload: DuckAnswerResultPayload) => void;
  "duck:gridState": (payload: DuckGridStatePayload) => void;
  "duck:ended": (payload: DuckEndedPayload) => void;

  "particolare:spin": (payload: { playerId: string; durationMs: number }) => void;
  "particolare:categoryDrawn": (
    payload: { playerId: string; categoryId: ParticolareCategoryId; categoryName: string; categoryEmoji: string }
  ) => void;
  "particolare:question": (payload: ParticolareQuestionPayload) => void;
  "particolare:mediaControl": (payload: ParticolareMediaControlPayload) => void;
  "particolare:ended": (payload: ParticolareEndedPayload) => void;

  "buzz:spin": (payload: { durationMs: number }) => void;
  "buzz:categoryDrawn": (
    payload: { categoryId: ParticolareCategoryId; categoryName: string; categoryEmoji: string }
  ) => void;
  "buzz:question": (payload: BuzzQuestionPayload) => void;
  "buzz:mediaControl": (payload: ParticolareMediaControlPayload) => void;
  "buzz:ended": (payload: BuzzEndedPayload) => void;

  "sfidaGino:spin": (payload: { playerId: string; durationMs: number }) => void;
  "sfidaGino:categoryDrawn": (
    payload: { playerId: string; categoryId: SfidaGinoCategoryId; categoryName: string; categoryEmoji: string }
  ) => void;
  "sfidaGino:question": (payload: SfidaGinoQuestionPayload) => void;
  "sfidaGino:ended": (payload: SfidaGinoEndedPayload) => void;
  "game:ended": (payload: GameEndedPayload) => void;
  // Salvataggio completato (vedi GameSession.saveGame): il client ricarica
  // la pagina poco dopo, così ogni schermata di minigioco eventualmente
  // rimasta aperta si azzera e si riparte puliti dalla mappa. Ci si
  // ricollega poi normalmente con lo stesso codice stanza.
  "game:saved": () => void;
}
