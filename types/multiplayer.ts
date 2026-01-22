/**
 * Multiplayer Type Definitions
 * 
 * Types for room management, player state, and real-time game coordination.
 */

import type { Room, Player, Round, RankingEntry, RoundResult } from "./database";
import type { Card } from "./game";

// Re-export database types for convenience
export type { Room, Player, Round, RankingEntry, RoundResult };

/** Player role in a round */
export type PlayerRole = "picker" | "guesser" | "spectator";

/** Connection status */
export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

/** Multiplayer game phase (extends single-player phases) */
export type MultiplayerPhase = 
  | "landing"      // Choose create or join
  | "creating"     // Entering name to create room
  | "joining"      // Entering code and name to join
  | "lobby"        // Waiting for host to start
  | "picking"      // Picker is ranking cards
  | "guessing"     // Guesser is guessing (others watch)
  | "results"      // Showing round results
  | "gameOver";    // Game finished

/** State for the multiplayer store */
export type MultiplayerState = {
  // Connection
  connectionStatus: ConnectionStatus;
  error: string | null;
  
  // Player identity (persisted to localStorage)
  playerId: string | null;
  displayName: string | null;
  
  // Room state
  room: Room | null;
  roomCode: string | null;
  players: Player[];
  
  // Current round
  currentRound: Round | null;
  myRole: PlayerRole | null;
  selectedCards: Card[];      // The 5 cards for the current round
  localRanking: RankingEntry[]; // Local ranking state for picker/guesser
  
  // UI state
  phase: MultiplayerPhase;
  isHost: boolean;
};

/** Actions for the multiplayer store */
export type MultiplayerActions = {
  // Room management
  createRoom: (displayName: string) => Promise<{ success: boolean; error?: string }>;
  joinRoom: (code: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  leaveRoom: () => Promise<void>;
  
  // Game flow (host only)
  startGame: () => Promise<{ success: boolean; error?: string }>;
  
  // Round actions
  submitPicking: (ranking: RankingEntry[]) => Promise<void>;
  updateGuess: (guess: RankingEntry[]) => Promise<void>;
  submitGuess: (guess: RankingEntry[]) => Promise<void>;
  nextRound: () => Promise<void>;
  
  // Subscriptions
  subscribeToRoom: (roomId: string) => void;
  unsubscribeFromRoom: () => void;
  
  // Heartbeat
  startHeartbeat: () => void;
  stopHeartbeat: () => void;
  
  // Reset
  reset: () => void;
  
  // Reconnection
  attemptReconnect: () => Promise<boolean>;
};

/** Combined store type */
export type MultiplayerStore = MultiplayerState & MultiplayerActions;

/** Player with computed properties */
export type PlayerWithRole = Player & {
  role: PlayerRole | null;
  isMe: boolean;
};

/** Room creation result */
export type CreateRoomResult = {
  room: Room;
  player: Player;
};

/** Join room result */
export type JoinRoomResult = {
  room: Room;
  player: Player;
  players: Player[];
};

/** Local storage keys */
export const STORAGE_KEYS = {
  PLAYER_ID: "priorities_player_id",
  DISPLAY_NAME: "priorities_display_name",
  ROOM_CODE: "priorities_room_code",
} as const;

/** Game constants */
export const MULTIPLAYER_CONSTANTS = {
  MIN_PLAYERS_TO_START: 2,
  MAX_PLAYERS_PER_ROOM: 10,
  ROOM_CODE_LENGTH: 4,
  HEARTBEAT_INTERVAL_MS: 30000,
  RECONNECT_TIMEOUT_MS: 5000,
  WINNING_SCORE: 10,
} as const;
