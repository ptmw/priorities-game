/** A card from the deck */
export type Card = {
  id: string;
  text: string;
  category?: string;
};

/** A card with its position in a ranking (1-5) */
export type RankedCard = Card & {
  position: number;
};

/** The current phase of the game */
export type GamePhase = "ranking" | "guessing" | "results" | "gameOver";

/** Result of comparing a single card's position */
export type CardResult = {
  card: Card;
  actualPosition: number;
  guessedPosition: number;
  isCorrect: boolean;
};

/** Winner of the game */
export type Winner = "players" | "game" | null;

/** Complete game state */
export type GameState = {
  /** Current round number (starts at 1) */
  currentRound: number;
  /** Player's total score (correct guesses) */
  playerScore: number;
  /** Game's total score (wrong guesses) */
  gameScore: number;
  /** Points players earned this round */
  playerRoundScore: number;
  /** Points game earned this round */
  gameRoundScore: number;
  /** Current phase of the game */
  phase: GamePhase;
  /** The 5 cards selected for this round */
  selectedCards: Card[];
  /** User's ranking of the cards (picker role) */
  actualRanking: RankedCard[];
  /** User's guess of the ranking (guesser role) */
  guessedRanking: RankedCard[];
  /** Detailed results for each card */
  results: CardResult[];
  /** How many positions were guessed correctly */
  correctCount: number;
  /** Winner when game is over */
  winner: Winner;
};

/** Actions available on the game store */
export type GameActions = {
  /** Start a new round with 5 random cards */
  startRound: () => void;
  /** Submit the user's ranking (picker role) */
  submitRanking: (ranking: RankedCard[]) => void;
  /** Submit the user's guess (guesser role) */
  submitGuess: (guess: RankedCard[]) => void;
  /** Move to the next round */
  nextRound: () => void;
  /** Reset the entire game (score and round) */
  resetGame: () => void;
};

/** Combined store type */
export type GameStore = GameState & GameActions;

/** Winning score threshold */
export const WINNING_SCORE = 10;

/** Rank labels for display - updated for tap interface */
export const RANK_LABELS: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: "❤️", label: "Love it", color: "bg-rank-1" },
  2: { emoji: "😊", label: "Like it", color: "bg-rank-2" },
  3: { emoji: "😐", label: "It's okay", color: "bg-rank-3" },
  4: { emoji: "🙁", label: "Not a fan", color: "bg-rank-4" },
  5: { emoji: "😡", label: "Hate it", color: "bg-rank-5" },
};
