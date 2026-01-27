# Feature Implementation Plan

**Overall Progress:** `100%`

## TLDR

Replace the current tap-to-swap interaction with drag-and-drop for card reordering in both ranking and guessing phases. Uses @dnd-kit/core for touch-friendly mobile support. Works in both single-player and multiplayer modes. Maintains vertical layout with emoji indicators, fits on iPhone screen.

## Critical Decisions

- **Library Choice: @dnd-kit/core** - Modern, excellent touch/mobile support, accessible, works well with React 18
- **Complete Replacement** - Remove all tap-to-swap code; drag-and-drop is the only interaction method
- **Visual Feedback: Drop indicators without shifting** - Show border/highlight on drop target, cards don't shift until drop completes
- **Multiplayer Sync: Final position only** - Other players see final card positions after drop, not real-time dragging
- **Keep Vertical Layout** - No layout changes; 5 cards with emoji indicators already fit on iPhone

## Tasks

- [x] 🟩 **Step 1: Install Dependencies**
  - [x] 🟩 Install `@dnd-kit/core` for drag-and-drop functionality
  - [x] 🟩 Install `@dnd-kit/sortable` for list reordering utilities
  - [x] 🟩 Install `@dnd-kit/utilities` for helper functions

- [x] 🟩 **Step 2: Create Draggable Card Component**
  - [x] 🟩 Create `SortableCard` component using `useSortable` hook
  - [x] 🟩 Add drag handle and touch-friendly activation constraint
  - [x] 🟩 Apply visual styles for dragging state (opacity, cursor)
  - [x] 🟩 Preserve emoji indicator and card content display

- [x] 🟩 **Step 3: Update RankingArea Component**
  - [x] 🟩 Remove `selectedPosition` state and `handleSlotClick` function
  - [x] 🟩 Add `DndContext` with touch, mouse, and keyboard sensors
  - [x] 🟩 Implement `handleDragStart` and `handleDragEnd` handlers
  - [x] 🟩 Add `SortableContext` with vertical sorting strategy
  - [x] 🟩 Replace card buttons with `SortableCard` components
  - [x] 🟩 Add `DragOverlay` for floating drag preview
  - [x] 🟩 Implement card reordering logic using `arrayMove`

- [x] 🟩 **Step 4: Add CSS Styling**
  - [x] 🟩 Update `.dragging` class for ghost card in original position
  - [x] 🟩 Update `.drop-zone-active` class for drop target indicator
  - [x] 🟩 Add drag overlay styles (scale, shadow, z-index)
  - [x] 🟩 Add smooth transition animations (transform, opacity)

- [ ] 🟥 **Step 5: Testing**
  - [ ] 🟥 Test drag-and-drop on desktop (mouse interaction)
  - [ ] 🟥 Test drag-and-drop on mobile/iPhone (touch interaction)
  - [ ] 🟥 Verify cards fit on iPhone screen without scrolling
  - [ ] 🟥 Test in single-player mode (ranking and guessing phases)
  - [ ] 🟥 Test in multiplayer mode (final position sync only)
  - [ ] 🟥 Verify smooth animations on drag, reorder, and drop
  - [ ] 🟥 Test keyboard accessibility (arrow keys + space)
