import { create } from "zustand";
import { GameStore, RankedCard, GamePhase, Winner, WINNING_SCORE } from "@/types/game";
import { getRandomCards } from "./card-utils";
import { compareRankings, calculateScore } from "./game-logic";

/** Initial game state */
const initialState = {
  currentRound: 0,
  playerScore: 0,
  gameScore: 0,
  playerRoundScore: 0,
  gameRoundScore: 0,
  phase: "ranking" as GamePhase,
  selectedCards: [],
  actualRanking: [],
  guessedRanking: [],
  results: [],
  correctCount: 0,
  winner: null as Winner,
};

/**
 * Zustand store for game state management
 */
export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  /**
   * Start a new round with 5 random cards
   */
  startRound: () => {
    const cards = getRandomCards(5);
    set({
      phase: "ranking",
      selectedCards: cards,
      actualRanking: [],
      guessedRanking: [],
      results: [],
      correctCount: 0,
      playerRoundScore: 0,
      gameRoundScore: 0,
      currentRound: get().currentRound + 1,
    });
  },

  /**
   * Submit the user's ranking (picker role)
   * Transitions to guessing phase
   */
  submitRanking: (ranking: RankedCard[]) => {
    set({
      actualRanking: ranking,
      phase: "guessing",
    });
  },

  /**
   * Submit the user's guess (guesser role)
   * Calculates results and transitions to results phase
   * Checks for win condition
   */
  submitGuess: (guess: RankedCard[]) => {
    const { actualRanking, playerScore, gameScore } = get();
    const results = compareRankings(actualRanking, guess);
    const correctCount = calculateScore(results);
    
    // Calculate round scores
    const playerRoundScore = correctCount;
    const gameRoundScore = 5 - correctCount;
    
    // Update total scores
    const newPlayerScore = playerScore + playerRoundScore;
    const newGameScore = gameScore + gameRoundScore;
    
    // Check for winner
    let winner: Winner = null;
    let phase: GamePhase = "results";
    
    if (newPlayerScore >= WINNING_SCORE) {
      winner = "players";
      phase = "gameOver";
    } else if (newGameScore >= WINNING_SCORE) {
      winner = "game";
      phase = "gameOver";
    }

    set({
      guessedRanking: guess,
      results,
      correctCount,
      playerRoundScore,
      gameRoundScore,
      playerScore: newPlayerScore,
      gameScore: newGameScore,
      winner,
      phase,
    });
  },

  /**
   * Move to the next round
   */
  nextRound: () => {
    get().startRound();
  },

  /**
   * Reset the entire game
   */
  resetGame: () => {
    set({
      ...initialState,
    });
    // Auto-start first round
    get().startRound();
  },
}));
