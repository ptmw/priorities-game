import { RankedCard, CardResult, Card } from "@/types/game";

/**
 * Compare the guessed ranking against the actual ranking
 * Returns detailed results for each card
 */
export function compareRankings(
  actualRanking: RankedCard[],
  guessedRanking: RankedCard[]
): CardResult[] {
  return actualRanking.map((actualCard) => {
    const guessedCard = guessedRanking.find((g) => g.id === actualCard.id);
    const guessedPosition = guessedCard?.position ?? -1;
    
    return {
      card: {
        id: actualCard.id,
        text: actualCard.text,
        category: actualCard.category,
      },
      actualPosition: actualCard.position,
      guessedPosition,
      isCorrect: actualCard.position === guessedPosition,
    };
  });
}

/**
 * Calculate the score from results
 * 1 point per correct position
 */
export function calculateScore(results: CardResult[]): number {
  return results.filter((r) => r.isCorrect).length;
}

/**
 * Count how many positions were guessed correctly
 */
export function countCorrect(results: CardResult[]): number {
  return results.filter((r) => r.isCorrect).length;
}

/**
 * Create a RankedCard from a Card and position
 */
export function createRankedCard(card: Card, position: number): RankedCard {
  return {
    ...card,
    position,
  };
}

/**
 * Sort ranked cards by position (1-5)
 */
export function sortByPosition(cards: RankedCard[]): RankedCard[] {
  return [...cards].sort((a, b) => a.position - b.position);
}
