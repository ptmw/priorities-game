# Changelog

All notable changes to the Priorities Game.

## [Unreleased]

### Changed

- **Interaction method** - Replaced tap-to-swap with drag-and-drop for card reordering
- **Mobile UX** - Touch-friendly with 8px activation threshold to prevent accidental drags
- **Instructions** - Updated to "✨ Hold and drag cards to arrange your ranking!"

### Added

- **@dnd-kit integration** - `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for drag functionality
- **SortableCard component** - Reusable draggable card with visual feedback (opacity, cursor states)
- **DragOverlay** - Floating preview of dragged card for smooth UX
- **Keyboard support** - Arrow keys + space bar for accessibility
- **Smooth animations** - 200ms CSS transitions for drag, reorder, drop

### Removed

- **Tap-to-swap interaction** - Old click-based card swapping removed entirely
- **Selection state** - No longer tracks `selectedPosition` for two-tap workflow

---

## Format

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Fixed** - Bug fixes
- **Security** - Security improvements
- **Removed** - Removed features
