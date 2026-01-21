import { Card } from "@/types/game";
import cardsData from "@/data/cards.json";

/** All cards from the deck */
const allCards: Card[] = cardsData;

/**
 * Fisher-Yates shuffle algorithm
 * Returns a new shuffled array without mutating the original
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get a random selection of unique cards from the deck
 * @param count Number of cards to select (default 5)
 * @returns Array of randomly selected cards
 */
export function getRandomCards(count: number = 5): Card[] {
  const shuffled = shuffle(allCards);
  return shuffled.slice(0, count);
}

/**
 * Get the total number of cards in the deck
 */
export function getTotalCardCount(): number {
  return allCards.length;
}
