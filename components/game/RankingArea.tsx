"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { Card as CardType, RankedCard, RANK_LABELS } from "@/types/game";
import { Card } from "./Card";
import { createRankedCard } from "@/lib/game-logic";

interface RankingAreaProps {
  /** Cards to rank (unranked cards in the pool) */
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
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Find the active card
  const activeCard =
    availableCards.find((c) => c.id === activeId) ||
    rankedCards.find((c) => c.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const draggedId = active.id as string;
    const overId = over.id as string;

    // Only handle drops on slots
    if (!overId.startsWith("slot-")) return;

    const slotNumber = parseInt(overId.replace("slot-", ""));
    
    // Find the dragged card
    const card =
      availableCards.find((c) => c.id === draggedId) ||
      rankedCards.find((c) => c.id === draggedId);

    if (!card) return;

    // Remove the dragged card from ranked cards if it was there
    let newRanked = rankedCards.filter((c) => c.id !== draggedId);

    // Check if there's already a card in the target slot
    const existingInSlot = newRanked.find((c) => c.position === slotNumber);
    
    if (existingInSlot) {
      // If the dragged card was previously ranked, swap positions
      const draggedPrevPosition = rankedCards.find((c) => c.id === draggedId)?.position;
      if (draggedPrevPosition) {
        // Swap: give the existing card the dragged card's old position
        newRanked = newRanked.map((c) =>
          c.id === existingInSlot.id
            ? createRankedCard(c, draggedPrevPosition)
            : c
        );
      } else {
        // Dragged card was from the pool, remove the existing card from its slot
        newRanked = newRanked.filter((c) => c.id !== existingInSlot.id);
      }
    }

    // Add the dragged card to the target slot
    newRanked.push(createRankedCard(card, slotNumber));
    onRankingChange(newRanked);
  }

  // Get unranked cards (cards not yet placed in slots)
  const unrankedCards = availableCards.filter(
    (card) => !rankedCards.some((r) => r.id === card.id)
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground">
          {title}
        </h2>

        {/* Card Pool (unranked cards) */}
        {unrankedCards.length > 0 && (
          <div className="mb-8">
            <p className="text-sm text-foreground/60 mb-3 text-center">
              Drag cards to rank them
            </p>
            <SortableContext
              items={unrankedCards.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {unrankedCards.map((card, index) => (
                  <Card
                    key={card.id}
                    card={card}
                    animationDelay={`delay-${index + 1}`}
                    disabled={disabled}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        )}

        {/* Ranking Slots */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((position) => {
            const rankInfo = RANK_LABELS[position];
            const cardInSlot = rankedCards.find(
              (c) => c.position === position
            );

            return (
              <RankSlot
                key={position}
                position={position}
                rankInfo={rankInfo}
                card={cardInSlot}
                disabled={disabled}
              />
            );
          })}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeCard ? (
          <div className="opacity-95 rotate-2 scale-105">
            <Card card={activeCard} disabled />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/** Individual ranking slot component */
interface RankSlotProps {
  position: number;
  rankInfo: { emoji: string; label: string; color: string };
  card: RankedCard | undefined;
  disabled: boolean;
}

function RankSlot({ position, rankInfo, card, disabled }: RankSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${position}`,
  });

  const slotColors: Record<number, string> = {
    1: "border-green-fresh bg-green-fresh/5",
    2: "border-blue-bright bg-blue-bright/5",
    3: "border-yellow-sunny bg-yellow-sunny/5",
    4: "border-orange-zest bg-orange-zest/5",
    5: "border-pink-pop bg-pink-pop/5",
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        flex items-center gap-3 sm:gap-4
        p-2 sm:p-3 rounded-2xl
        border-2 border-dashed
        ${isOver ? "drop-zone-active scale-[1.02]" : slotColors[position]}
        transition-all duration-200
        min-h-[90px] sm:min-h-[110px]
      `}
    >
      {/* Rank Label */}
      <div className="flex flex-col items-center justify-center w-16 sm:w-20 shrink-0">
        <span className="text-2xl sm:text-3xl">{rankInfo.emoji}</span>
        <span className="text-xs sm:text-sm font-semibold text-foreground/70">
          {rankInfo.label}
        </span>
      </div>

      {/* Card or Empty Slot */}
      <div className="flex-1">
        {card ? (
          <SortableContext items={[card.id]} strategy={verticalListSortingStrategy}>
            <Card card={card} isRanked position={position} disabled={disabled} />
          </SortableContext>
        ) : (
          <div className="h-[60px] sm:h-[80px] rounded-xl border-2 border-dashed border-foreground/20 flex items-center justify-center">
            <span className="text-foreground/40 text-sm">
              Drop card here
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
