"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RankedCard, RANK_LABELS } from "@/types/game";

interface SortableCardProps {
  card: RankedCard;
  disabled?: boolean;
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

export function SortableCard({ card, disabled = false }: SortableCardProps) {
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

  const rankInfo = RANK_LABELS[card.position];
  const colors = slotColors[card.position];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        w-full
        flex items-center gap-3 sm:gap-4
        p-3 sm:p-4 rounded-xl
        border-2
        ${colors.bg}
        ${isDragging ? "opacity-50 cursor-grabbing" : disabled ? "cursor-default" : "cursor-grab"}
        shadow-sm hover:shadow-md
        transition-all duration-200 ease-out
        ${isDragging ? "z-50" : ""}
      `}
    >
      {/* Drag Handle - entire card is draggable */}
      <div
        {...attributes}
        {...listeners}
        className="flex-1 flex items-center gap-3 sm:gap-4"
      >
        {/* Position & Emoji */}
        <div className="flex flex-col items-center justify-center w-14 sm:w-16 shrink-0">
          <span className="text-2xl sm:text-3xl">{rankInfo.emoji}</span>
          <span className="text-[10px] sm:text-xs font-semibold text-foreground/60 text-center leading-tight mt-0.5">
            {rankInfo.label}
          </span>
        </div>

        {/* Card Content */}
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-foreground text-base sm:text-lg">
            {card.text}
          </span>
        </div>
      </div>
    </div>
  );
}
