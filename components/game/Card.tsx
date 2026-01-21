"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card as CardType } from "@/types/game";

interface CardProps {
  card: CardType;
  /** Whether the card is in a ranking slot */
  isRanked?: boolean;
  /** The position label (1-5) when ranked */
  position?: number;
  /** Animation delay class */
  animationDelay?: string;
  /** Whether to disable drag */
  disabled?: boolean;
}

/** Color mapping for card backgrounds based on position */
const positionColors: Record<number, string> = {
  1: "bg-gradient-to-br from-green-fresh/20 to-green-fresh/5 border-green-fresh",
  2: "bg-gradient-to-br from-blue-bright/20 to-blue-bright/5 border-blue-bright",
  3: "bg-gradient-to-br from-yellow-sunny/20 to-yellow-sunny/5 border-yellow-sunny",
  4: "bg-gradient-to-br from-orange-zest/20 to-orange-zest/5 border-orange-zest",
  5: "bg-gradient-to-br from-pink-pop/20 to-pink-pop/5 border-pink-pop",
};

/** Default card style when not ranked */
const defaultCardStyle =
  "bg-white border-purple-punch/20 hover:border-purple-punch/50";

export function Card({
  card,
  isRanked = false,
  position,
  animationDelay = "",
  disabled = false,
}: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardColor = position ? positionColors[position] : defaultCardStyle;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        ${cardColor}
        ${animationDelay}
        ${isDragging ? "dragging z-50 rotate-3" : ""}
        ${disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
        p-4 sm:p-5
        border-2 rounded-2xl
        shadow-lg hover:shadow-xl
        transition-all duration-200
        select-none
        animate-bounce-in
        min-h-[80px] sm:min-h-[100px]
        flex items-center justify-center
        text-center
      `}
    >
      <span className="font-semibold text-foreground text-base sm:text-lg leading-tight">
        {card.text}
      </span>
    </div>
  );
}
