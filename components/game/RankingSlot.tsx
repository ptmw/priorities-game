"use client";

import { RankedCard } from "@/types/game";
import { X } from "lucide-react";

interface RankingSlotProps {
  position: number;
  emoji: string;
  label: string;
  card: RankedCard | undefined;
  isSelected: boolean;
  disabled: boolean;
  onSlotClick: () => void;
  onRemoveCard: () => void;
}

const slotColors: Record<number, { bg: string; border: string; activeBg: string }> = {
  1: { 
    bg: "bg-green-fresh/5", 
    border: "border-green-fresh/40",
    activeBg: "bg-green-fresh/20 border-green-fresh"
  },
  2: { 
    bg: "bg-blue-bright/5", 
    border: "border-blue-bright/40",
    activeBg: "bg-blue-bright/20 border-blue-bright"
  },
  3: { 
    bg: "bg-yellow-sunny/5", 
    border: "border-yellow-sunny/40",
    activeBg: "bg-yellow-sunny/20 border-yellow-sunny"
  },
  4: { 
    bg: "bg-orange-zest/5", 
    border: "border-orange-zest/40",
    activeBg: "bg-orange-zest/20 border-orange-zest"
  },
  5: { 
    bg: "bg-pink-pop/5", 
    border: "border-pink-pop/40",
    activeBg: "bg-pink-pop/20 border-pink-pop"
  },
};

const filledSlotColors: Record<number, string> = {
  1: "bg-gradient-to-r from-green-fresh/20 to-green-fresh/5 border-green-fresh",
  2: "bg-gradient-to-r from-blue-bright/20 to-blue-bright/5 border-blue-bright",
  3: "bg-gradient-to-r from-yellow-sunny/20 to-yellow-sunny/5 border-yellow-sunny",
  4: "bg-gradient-to-r from-orange-zest/20 to-orange-zest/5 border-orange-zest",
  5: "bg-gradient-to-r from-pink-pop/20 to-pink-pop/5 border-pink-pop",
};

export function RankingSlot({
  position,
  emoji,
  label,
  card,
  isSelected,
  disabled,
  onSlotClick,
  onRemoveCard,
}: RankingSlotProps) {
  const colors = slotColors[position];

  // If there's a card in this slot
  if (card) {
    return (
      <div
        className={`
          flex items-center gap-2 sm:gap-3
          p-2 sm:p-3 rounded-xl
          border-2
          ${filledSlotColors[position]}
          transition-all duration-200
          min-h-[70px] sm:min-h-[80px]
        `}
      >
        {/* Rank Label */}
        <div className="flex flex-col items-center justify-center w-12 sm:w-16 shrink-0">
          <span className="text-xl sm:text-2xl">{emoji}</span>
          <span className="text-[10px] sm:text-xs font-medium text-foreground/60 text-center leading-tight">
            {label}
          </span>
        </div>

        {/* Card Content */}
        <div className="flex-1 flex items-center justify-center py-2">
          <span className="font-semibold text-foreground text-sm sm:text-base text-center">
            {card.text}
          </span>
        </div>

        {/* Remove Button */}
        {!disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveCard();
            }}
            className="
              p-1.5 rounded-full
              bg-foreground/10 hover:bg-incorrect/20
              text-foreground/50 hover:text-incorrect
              transition-all duration-150
              shrink-0
            "
            aria-label="Remove card"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Empty slot
  return (
    <button
      type="button"
      onClick={onSlotClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 sm:gap-3
        p-2 sm:p-3 rounded-xl
        border-2 border-dashed
        ${isSelected ? colors.activeBg : `${colors.bg} ${colors.border}`}
        ${disabled ? "cursor-default" : "cursor-pointer hover:border-solid"}
        ${isSelected ? "ring-2 ring-offset-1 ring-purple-punch scale-[1.02]" : ""}
        transition-all duration-200
        min-h-[70px] sm:min-h-[80px]
        w-full text-left
      `}
    >
      {/* Rank Label */}
      <div className="flex flex-col items-center justify-center w-12 sm:w-16 shrink-0">
        <span className="text-xl sm:text-2xl">{emoji}</span>
        <span className="text-[10px] sm:text-xs font-medium text-foreground/60 text-center leading-tight">
          {label}
        </span>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center">
        <span className="text-foreground/40 text-xs sm:text-sm">
          {isSelected ? "Tap here to place" : "Tap to select"}
        </span>
      </div>
    </button>
  );
}
