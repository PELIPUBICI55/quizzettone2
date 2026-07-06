export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  category: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
}

export interface QuestionPayload {
  index: number;
  total: number;
  question: Omit<Question, "correctIndex">;
  timeLimitMs: number;
}

export interface AnswerResult {
  playerId: string;
  playerName: string;
  answerIndex: number | null;
  correct: boolean;
  pointsEarned: number;
}

export interface QuestionSummary {
  questionIndex: number;
  correctIndex: number;
  results: AnswerResult[];
  scores: { id: string; name: string; score: number }[];
}

export type GamePhase = "lobby" | "question" | "reveal" | "finished";

export interface RoomState {
  code: string;
  phase: GamePhase;
  players: Player[];
  questionIndex: number;
  totalQuestions: number;
  currentQuestion?: QuestionPayload;
  lastSummary?: QuestionSummary;
  winner?: { id: string; name: string; score: number };
}

export const QUESTION_TIME_MS = 15000;
export const REVEAL_TIME_MS = 5000;
export const QUESTIONS_PER_GAME = 10;
export const MAX_POINTS = 1000;

export function computePoints(correct: boolean, elapsedMs: number, timeLimitMs: number): number {
  if (!correct) return 0;
  const ratio = Math.max(0, 1 - elapsedMs / timeLimitMs);
  return Math.round(500 + ratio * (MAX_POINTS - 500));
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
