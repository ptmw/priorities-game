"use client";

import { useState, useEffect, useRef } from "react";
import { Card as CardType, RankedCard, RANK_LABELS } from "@/types/game";
import { createRankedCard } from "@/lib/game-logic";
import { shuffle } from "@/lib/card-utils";
import { Loader2 } from "lucide-react";

interface RankingAreaProps {
  /** All cards for this round */
  availableCards: CardType[];
  /** Currently ranked cards */
  rankedCards: RankedCard[];
  /** Callback when ranking changes */
  onRankingChange: (ranked: RankedCard[]) => void;
  /** Whether the area is disabled (view-only mode) */
  disabled?: boolean;
  /** Title to display above the ranking area */
  title: string;
}

export function RankingArea({
  availableCards,
  rankedCards,
  onRankingChange,
  disabled = false,
  title,
}: RankingAreaProps) {
  // Track which card is currently selected for swapping
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  
  // Track if we've initialized to prevent double-init
  const hasInitialized = useRef(false);

  // Initialize cards in random positions when availableCards changes and rankedCards is empty
  useEffect(() => {
    if (availableCards.length === 5 && rankedCards.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      const shuffledCards = shuffle(availableCards);
      const initialRanking = shuffledCards.map((card, index) =>
        createRankedCard(card, index + 1)
      );
      onRankingChange(initialRanking);
    }
  }, [availableCards, rankedCards.length, onRankingChange]);

  // Reset initialization flag when availableCards change (new round)
  useEffect(() => {
    hasInitialized.current = false;
  }, [availableCards]);

  // Handle tapping a card slot
  const handleSlotClick = (position: number) => {
    if (disabled) return;

    if (selectedPosition === null) {
      // First tap - select this card
      setSelectedPosition(position);
    } else if (selectedPosition === position) {
      // Tapping same card - deselect
      setSelectedPosition(null);
    } else {
      // Second tap - swap the cards
      const card1 = rankedCards.find((c) => c.position === selectedPosition);
      const card2 = rankedCards.find((c) => c.position === position);

      if (card1 && card2) {
        const newRanked = rankedCards.map((c) => {
          if (c.id === card1.id) {
            return createRankedCard(c, position);
          }
          if (c.id === card2.id) {
            return createRankedCard(c, selectedPosition);
          }
          return c;
        });
        onRankingChange(newRanked);
      }
      setSelectedPosition(null);
    }
  };

  // Clear selection when disabled changes (e.g., on submit)
  useEffect(() => {
    if (disabled) {
      setSelectedPosition(null);
    }
  }, [disabled]);

  // Sort cards by position for display
  const sortedCards = [...rankedCards].sort((a, b) => a.position - b.position);

  // Show loading state while cards are being initialized
  const isInitializing = availableCards.length === 5 && rankedCards.length === 0;

  if (isInitializing) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground">
          {title}
        </h2>
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="w-8 h-8 text-purple-punch animate-spin" />
          <p className="text-sm text-foreground/60">Shuffling cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground">
        {title}
      </h2>

      {/* Instructions */}
      <p className="text-sm text-foreground/60 text-center">
        Tap two cards to swap their positions
      </p>

      {/* Ranking Slots - Vertical List */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((position) => {
          const rankInfo = RANK_LABELS[position];
          const cardInSlot = sortedCards.find((c) => c.position === position);
          const isSelected = selectedPosition === position;

          return (
            <SwapSlot
              key={position}
              position={position}
              emoji={rankInfo.emoji}
              label={rankInfo.label}
              card={cardInSlot}
              isSelected={isSelected}
              disabled={disabled}
              onClick={() => handleSlotClick(position)}
            />
          );
        })}
      </div>

      {/* Selection Hint */}
      {selectedPosition !== null && (
        <div className="text-center text-sm text-purple-punch font-medium animate-pulse">
          Now tap another card to swap
        </div>
      )}
    </div>
  );
}

/** Individual swap slot component */
interface SwapSlotProps {
  position: number;
  emoji: string;
  label: string;
  card: RankedCard | undefined;
  isSelected: boolean;
  disabled: boolean;
  onClick: () => void;
}

const slotColors: Record<number, { bg: string; selectedBg: string }> = {
  1: {
    bg: "bg-gradient-to-r from-green-fresh/15 to-green-fresh/5 border-green-fresh/30",
    selectedBg: "bg-gradient-to-r from-green-fresh/30 to-green-fresh/15 border-green-fresh ring-2 ring-green-fresh ring-offset-2",
  },
  2: {
    bg: "bg-gradient-to-r from-blue-bright/15 to-blue-bright/5 border-blue-bright/30",
    selectedBg: "bg-gradient-to-r from-blue-bright/30 to-blue-bright/15 border-blue-bright ring-2 ring-blue-bright ring-offset-2",
  },
  3: {
    bg: "bg-gradient-to-r from-yellow-sunny/15 to-yellow-sunny/5 border-yellow-sunny/30",
    selectedBg: "bg-gradient-to-r from-yellow-sunny/30 to-yellow-sunny/15 border-yellow-sunny ring-2 ring-yellow-sunny ring-offset-2",
  },
  4: {
    bg: "bg-gradient-to-r from-orange-zest/15 to-orange-zest/5 border-orange-zest/30",
    selectedBg: "bg-gradient-to-r from-orange-zest/30 to-orange-zest/15 border-orange-zest ring-2 ring-orange-zest ring-offset-2",
  },
  5: {
    bg: "bg-gradient-to-r from-pink-pop/15 to-pink-pop/5 border-pink-pop/30",
    selectedBg: "bg-gradient-to-r from-pink-pop/30 to-pink-pop/15 border-pink-pop ring-2 ring-pink-pop ring-offset-2",
  },
};

function SwapSlot({
  position,
  emoji,
  label,
  card,
  isSelected,
  disabled,
  onClick,
}: SwapSlotProps) {
  const colors = slotColors[position];

  // Don't render if no card (shouldn't happen after initialization)
  if (!card) {
    return (
      <div className={`
        w-full flex items-center gap-3 sm:gap-4
        p-3 sm:p-4 rounded-xl border-2
        ${colors.bg}
      `}>
        <div className="flex flex-col items-center justify-center w-14 sm:w-16 shrink-0">
          <span className="text-2xl sm:text-3xl">{emoji}</span>
          <span className="text-[10px] sm:text-xs font-semibold text-foreground/60 text-center leading-tight mt-0.5">
            {label}
          </span>
        </div>
        <div className="flex-1 min-w-0 flex items-center">
          <Loader2 className="w-5 h-5 text-foreground/40 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full
        flex items-center gap-3 sm:gap-4
        p-3 sm:p-4 rounded-xl
        border-2
        ${isSelected ? colors.selectedBg : colors.bg}
        ${disabled ? "cursor-default" : "cursor-pointer active:scale-[0.98]"}
        ${isSelected ? "scale-[1.02] shadow-lg" : "shadow-sm hover:shadow-md"}
        transition-all duration-200 ease-out
        text-left
      `}
    >
      {/* Position & Emoji */}
      <div className="flex flex-col items-center justify-center w-14 sm:w-16 shrink-0">
        <span className="text-2xl sm:text-3xl">{emoji}</span>
        <span className="text-[10px] sm:text-xs font-semibold text-foreground/60 text-center leading-tight mt-0.5">
          {label}
        </span>
      </div>

      {/* Card Content */}
      <div className="flex-1 min-w-0">
        <span className={`
          font-semibold text-foreground text-base sm:text-lg
          ${isSelected ? "text-purple-punch" : ""}
        `}>
          {card.text}
        </span>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="shrink-0 w-3 h-3 rounded-full bg-purple-punch animate-pulse" />
      )}
    </button>
  );
}
