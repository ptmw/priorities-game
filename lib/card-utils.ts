import { Card } from "@/types/game";

/** Cached cards from the deck */
let cachedCards: Card[] | null = null;

/**
 * Load cards from the public folder
 * Results are cached after first load
 */
export async function loadCards(): Promise<Card[]> {
  if (cachedCards) {
    return cachedCards;
  }

  const response = await fetch("/data/cards.json");
  if (!response.ok) {
    throw new Error("Failed to load cards");
  }
  
  cachedCards = await response.json();
  return cachedCards!;
}

/**
 * Get cards synchronously (throws if not loaded yet)
 * Call loadCards() first to ensure cards are available
 */
export function getCards(): Card[] {
  if (!cachedCards) {
    throw new Error("Cards not loaded. Call loadCards() first.");
  }
  return cachedCards;
}

/**
 * Check if cards have been loaded
 */
export function areCardsLoaded(): boolean {
  return cachedCards !== null;
}

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
  const cards = getCards();
  const shuffled = shuffle(cards);
  return shuffled.slice(0, count);
}

/**
 * Get the total number of cards in the deck
 */
export function getTotalCardCount(): number {
  return getCards().length;
}
