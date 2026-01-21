"use client";

import { Card as CardType } from "@/types/game";

interface CardProps {
  card: CardType;
  /** Whether the card is selected for placement */
  isSelected?: boolean;
  /** Whether the card is in a ranking slot */
  isRanked?: boolean;
  /** The position (1-5) when ranked */
  position?: number;
  /** Animation delay class */
  animationDelay?: string;
  /** Whether interactions are disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/** Color mapping for card backgrounds based on position */
const positionColors: Record<number, string> = {
  1: "bg-gradient-to-br from-green-fresh/30 to-green-fresh/10 border-green-fresh",
  2: "bg-gradient-to-br from-blue-bright/30 to-blue-bright/10 border-blue-bright",
  3: "bg-gradient-to-br from-yellow-sunny/30 to-yellow-sunny/10 border-yellow-sunny",
  4: "bg-gradient-to-br from-orange-zest/30 to-orange-zest/10 border-orange-zest",
  5: "bg-gradient-to-br from-pink-pop/30 to-pink-pop/10 border-pink-pop",
};

/** Default card style when not ranked */
const defaultCardStyle =
  "bg-white border-purple-punch/20 hover:border-purple-punch/40";

/** Selected card style */
const selectedCardStyle =
  "bg-purple-punch/10 border-purple-punch ring-2 ring-purple-punch ring-offset-2 shadow-lg shadow-purple-punch/20";

export function Card({
  card,
  isSelected = false,
  isRanked = false,
  position,
  animationDelay = "",
  disabled = false,
  onClick,
}: CardProps) {
  const cardColor = isSelected 
    ? selectedCardStyle 
    : position 
      ? positionColors[position] 
      : defaultCardStyle;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        ${cardColor}
        ${animationDelay}
        ${disabled ? "cursor-default opacity-90" : "cursor-pointer active:scale-95"}
        ${isSelected ? "scale-[1.02]" : ""}
        w-full
        p-3 sm:p-4
        border-2 rounded-xl
        shadow-md hover:shadow-lg
        transition-all duration-200
        select-none
        animate-bounce-in
        min-h-[70px] sm:min-h-[80px]
        flex items-center justify-center
        text-center
      `}
    >
      <span className="font-semibold text-foreground text-sm sm:text-base leading-tight">
        {card.text}
      </span>
    </button>
  );
}
