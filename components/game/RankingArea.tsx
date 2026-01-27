"use client";

import { useState, useEffect } from "react";
import { Card as CardType, RankedCard, RANK_LABELS } from "@/types/game";
import { createRankedCard } from "@/lib/game-logic";
import { shuffle } from "@/lib/card-utils";
import { Loader2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableCard } from "./SortableCard";

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
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for drag-and-drop (touch, mouse, keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize cards in random positions when we have 5 cards but no ranked cards
  // This runs whenever rankedCards becomes empty (phase change or new round)
  useEffect(() => {
    if (availableCards.length === 5 && rankedCards.length === 0) {
      // Use setTimeout to ensure we don't conflict with parent's state reset
      const timer = setTimeout(() => {
        const shuffledCards = shuffle(availableCards);
        const initialRanking = shuffledCards.map((card, index) =>
          createRankedCard(card, index + 1)
        );
        onRankingChange(initialRanking);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [availableCards, rankedCards.length, onRankingChange]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end - reorder cards based on new positions
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || disabled) return;

    if (active.id !== over.id) {
      // Sort cards by position to get current order
      const sortedCards = [...rankedCards].sort((a, b) => a.position - b.position);
      
      // Find indices of active and over cards
      const oldIndex = sortedCards.findIndex((c) => c.id === active.id);
      const newIndex = sortedCards.findIndex((c) => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder the array
        const reorderedCards = arrayMove(sortedCards, oldIndex, newIndex);
        
        // Update positions to match new order (1-5)
        const newRanked = reorderedCards.map((card, index) =>
          createRankedCard(card, index + 1)
        );
        
        onRankingChange(newRanked);
      }
    }
  };

  // Sort cards by position for display
  const sortedCards = [...rankedCards].sort((a, b) => a.position - b.position);
  
  // Find the active card for drag overlay
  const activeCard = activeId ? sortedCards.find((c) => c.id === activeId) : null;

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground">
          {title}
        </h2>

        {/* Instructions */}
        <p className="text-sm text-foreground/60 text-center">
          ✨ Hold and drag cards to arrange your ranking!
        </p>

        {/* Ranking Slots - Vertical List */}
        <SortableContext
          items={sortedCards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sortedCards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                disabled={disabled}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag Overlay - shows card being dragged */}
        <DragOverlay>
          {activeCard ? (
            <div className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 bg-white shadow-2xl scale-105 rotate-2 opacity-95">
              <div className="flex flex-col items-center justify-center w-14 sm:w-16 shrink-0">
                <span className="text-2xl sm:text-3xl">
                  {RANK_LABELS[activeCard.position].emoji}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-foreground/60 text-center leading-tight mt-0.5">
                  {RANK_LABELS[activeCard.position].label}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-foreground text-base sm:text-lg">
                  {activeCard.text}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

