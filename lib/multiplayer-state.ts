"use client";

/**
 * Multiplayer State Management
 * 
 * Zustand store with Supabase real-time subscriptions for multiplayer game state.
 */

import { create } from "zustand";
import { supabase, now } from "./supabase";
import { cardsData as allCards } from "./cards-data";
import {
  createRoom as createRoomUtil,
  joinRoom as joinRoomUtil,
  leaveRoom as leaveRoomUtil,
  assignRoles,
  startRound,
  submitPickerRanking,
  updateCurrentGuess,
  submitFinalGuess,
  getPlayers,
  getCurrentRound,
  updateHeartbeat,
} from "./room-utils";
import type { Room, Player, Round, RankingEntry } from "@/types/database";
import type {
  MultiplayerStore,
  MultiplayerState,
  MultiplayerPhase,
  PlayerRole,
  ConnectionStatus,
} from "@/types/multiplayer";
import { STORAGE_KEYS, MULTIPLAYER_CONSTANTS } from "@/types/multiplayer";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ============================================================
// Initial State
// ============================================================

const initialState: MultiplayerState = {
  connectionStatus: "disconnected",
  error: null,
  playerId: null,
  displayName: null,
  room: null,
  roomCode: null,
  players: [],
  currentRound: null,
  myRole: null,
  phase: "landing",
  isHost: false,
};

// ============================================================
// Store
// ============================================================

// Track subscription channel and heartbeat outside store
let channel: RealtimeChannel | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  ...initialState,

  // ============================================================
  // Room Management
  // ============================================================

  createRoom: async (displayName: string) => {
    set({ connectionStatus: "connecting", error: null, phase: "creating" });

    try {
      const { room, player } = await createRoomUtil(displayName);

      // Save to localStorage for reconnection
      localStorage.setItem(STORAGE_KEYS.PLAYER_ID, player.id);
      localStorage.setItem(STORAGE_KEYS.DISPLAY_NAME, displayName);
      localStorage.setItem(STORAGE_KEYS.ROOM_CODE, room.code);

      set({
        connectionStatus: "connected",
        playerId: player.id,
        displayName: player.display_name,
        room,
        roomCode: room.code,
        players: [player],
        isHost: true,
        phase: "lobby",
      });

      // Start subscriptions and heartbeat
      get().subscribeToRoom(room.id);
      get().startHeartbeat();

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create room";
      set({ connectionStatus: "error", error: message, phase: "landing" });
      return { success: false, error: message };
    }
  },

  joinRoom: async (code: string, displayName: string) => {
    set({ connectionStatus: "connecting", error: null, phase: "joining" });

    try {
      // Check for existing player ID for reconnection
      const existingPlayerId = localStorage.getItem(STORAGE_KEYS.PLAYER_ID) || undefined;

      const { room, player, players } = await joinRoomUtil(code, displayName, existingPlayerId);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.PLAYER_ID, player.id);
      localStorage.setItem(STORAGE_KEYS.DISPLAY_NAME, displayName);
      localStorage.setItem(STORAGE_KEYS.ROOM_CODE, room.code);

      // Determine phase based on room status
      let phase: MultiplayerPhase = "lobby";
      if (room.status === "playing") {
        const currentRound = await getCurrentRound(room.id);
        if (currentRound) {
          phase = currentRound.phase as MultiplayerPhase;
        }
      } else if (room.status === "finished") {
        phase = "gameOver";
      }

      // Determine role if game is in progress
      let myRole: PlayerRole | null = null;
      let currentRound: Round | null = null;
      if (room.status === "playing") {
        currentRound = await getCurrentRound(room.id);
        if (currentRound) {
          myRole = 
            currentRound.picker_id === player.id ? "picker" :
            currentRound.guesser_id === player.id ? "guesser" :
            "spectator";
        }
      }

      set({
        connectionStatus: "connected",
        playerId: player.id,
        displayName: player.display_name,
        room,
        roomCode: room.code,
        players,
        isHost: player.is_host,
        phase,
        currentRound,
        myRole,
      });

      // Start subscriptions and heartbeat
      get().subscribeToRoom(room.id);
      get().startHeartbeat();

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to join room";
      set({ connectionStatus: "error", error: message, phase: "landing" });
      return { success: false, error: message };
    }
  },

  leaveRoom: async () => {
    const { playerId, room } = get();

    // Cleanup subscriptions and heartbeat
    get().unsubscribeFromRoom();
    get().stopHeartbeat();

    if (playerId && room) {
      try {
        await leaveRoomUtil(playerId, room.id);
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    }

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
    localStorage.removeItem(STORAGE_KEYS.ROOM_CODE);

    // Reset state
    get().reset();
  },

  // ============================================================
  // Game Flow
  // ============================================================

  startGame: async () => {
    const { room, players, isHost, playerId } = get();

    if (!isHost || !room) {
      return { success: false, error: "Only the host can start the game" };
    }

    const connectedPlayers = players.filter(p => p.is_connected);
    if (connectedPlayers.length < MULTIPLAYER_CONSTANTS.MIN_PLAYERS_TO_START) {
      return { success: false, error: `Need at least ${MULTIPLAYER_CONSTANTS.MIN_PLAYERS_TO_START} players` };
    }

    try {
      // Assign roles
      const { pickerId, guesserId } = assignRoles(connectedPlayers);

      console.log("[startGame] Starting round 1, picker:", pickerId, "guesser:", guesserId);

      // Start round 1
      const newRound = await startRound(room.id, 1, pickerId, guesserId);
      console.log("[startGame] Round created:", newRound);

      // Optimistically update local state (real-time will confirm)
      let myRole: "picker" | "guesser" | "spectator" = "spectator";
      if (playerId === pickerId) myRole = "picker";
      else if (playerId === guesserId) myRole = "guesser";

      // Parse card IDs to get actual cards
      const cardIds = newRound.card_ids as string[];
      const selectedCards = cardIds.map(id => {
        const card = allCards.find(c => c.id === id);
        return card || { id, text: id, category: "unknown" as const };
      });

      set({
        currentRound: newRound,
        selectedCards,
        myRole,
        localRanking: [],
        phase: "picking",
        room: { ...room, current_round: 1, status: "playing" },
      });

      return { success: true };
    } catch (error) {
      console.error("[startGame] Failed:", error);
      const message = error instanceof Error ? error.message : "Failed to start game";
      return { success: false, error: message };
    }
  },

  submitPicking: async (ranking: RankingEntry[]) => {
    const { currentRound, myRole } = get();

    if (!currentRound || myRole !== "picker") {
      throw new Error("Only the picker can submit ranking");
    }

    await submitPickerRanking(currentRound.id, ranking);
    // State will be updated via real-time subscription
  },

  updateGuess: async (guess: RankingEntry[]) => {
    const { currentRound, myRole } = get();

    if (!currentRound || myRole !== "guesser") {
      return; // Silently ignore if not guesser
    }

    await updateCurrentGuess(currentRound.id, guess);
    // State will be updated via real-time subscription
  },

  submitGuess: async (guess: RankingEntry[]) => {
    const { currentRound, room, myRole } = get();

    if (!currentRound || !room || myRole !== "guesser") {
      throw new Error("Only the guesser can submit the guess");
    }

    if (!currentRound.actual_ranking) {
      throw new Error("No ranking to compare against");
    }

    await submitFinalGuess(
      currentRound.id,
      room.id,
      guess,
      currentRound.actual_ranking as RankingEntry[]
    );
    // State will be updated via real-time subscription
  },

  nextRound: async () => {
    const { room, players, isHost, currentRound } = get();

    if (!isHost || !room) {
      throw new Error("Only the host can start the next round");
    }

    const connectedPlayers = players.filter(p => p.is_connected);
    const previousPickerId = currentRound?.picker_id || undefined;

    // Assign new roles
    const { pickerId, guesserId } = assignRoles(connectedPlayers, previousPickerId);

    console.log("[nextRound] Starting round", room.current_round + 1, "picker:", pickerId, "guesser:", guesserId);

    try {
      // Start next round
      const newRound = await startRound(room.id, room.current_round + 1, pickerId, guesserId);
      console.log("[nextRound] Round created:", newRound);

      // Optimistically update local state (real-time will confirm)
      const { playerId } = get();
      let myRole: "picker" | "guesser" | "spectator" = "spectator";
      if (playerId === pickerId) myRole = "picker";
      else if (playerId === guesserId) myRole = "guesser";

      // Parse card IDs to get actual cards
      const cardIds = newRound.card_ids as string[];
      const selectedCards = cardIds.map(id => {
        const card = allCards.find(c => c.id === id);
        return card || { id, text: id, category: "unknown" as const };
      });

      set({
        currentRound: newRound,
        selectedCards,
        myRole,
        localRanking: [],
        phase: "picking",
        room: { ...room, current_round: newRound.round_number, status: "playing" },
      });
    } catch (error) {
      console.error("[nextRound] Failed:", error);
      throw error;
    }
  },

  // ============================================================
  // Subscriptions
  // ============================================================

  subscribeToRoom: (roomId: string) => {
    // Unsubscribe from any existing channel
    get().unsubscribeFromRoom();

    channel = supabase.channel(`room:${roomId}`)
      // Players changes (join/leave/connect/disconnect)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        async () => {
          // Refresh players list
          try {
            const players = await getPlayers(roomId);
            const { playerId } = get();
            const me = players.find(p => p.id === playerId);
            set({ 
              players,
              isHost: me?.is_host || false,
            });
          } catch (error) {
            console.error("Error fetching players:", error);
          }
        }
      )
      // Room changes (status, scores, winner)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const room = payload.new as Room;
          set({ room });

          // Check for game over
          if (room.winner) {
            set({ phase: "gameOver" });
          }
        }
      )
      // Round changes (phase, ranking, guess)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rounds",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          if (payload.eventType === "DELETE") return;

          const round = payload.new as Round;
          const { playerId, room, currentRound } = get();

          // Accept this round if:
          // 1. It matches the room's current_round, OR
          // 2. It's a NEW round (round_number > current round we have), OR
          // 3. It's an update to our current round
          const isCurrentRound = room && round.round_number === room.current_round;
          const isNewRound = round.round_number > (currentRound?.round_number || 0);
          const isUpdateToCurrentRound = currentRound && round.id === currentRound.id;
          
          if (isCurrentRound || isNewRound || isUpdateToCurrentRound) {
            // Determine role
            const myRole: PlayerRole =
              round.picker_id === playerId ? "picker" :
              round.guesser_id === playerId ? "guesser" :
              "spectator";

            // Determine phase
            const phase = round.phase as MultiplayerPhase;

            set({
              currentRound: round,
              myRole,
              phase,
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          set({ connectionStatus: "connected" });
        } else if (status === "CHANNEL_ERROR") {
          set({ connectionStatus: "error", error: "Connection lost" });
        }
      });
  },

  unsubscribeFromRoom: () => {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  },

  // ============================================================
  // Heartbeat
  // ============================================================

  startHeartbeat: () => {
    get().stopHeartbeat();

    heartbeatInterval = setInterval(async () => {
      const { playerId, room } = get();
      if (playerId && room) {
        try {
          await updateHeartbeat(playerId, room.id);
        } catch (error) {
          console.error("Heartbeat error:", error);
        }
      }
    }, MULTIPLAYER_CONSTANTS.HEARTBEAT_INTERVAL_MS);
  },

  stopHeartbeat: () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  },

  // ============================================================
  // Reset & Reconnect
  // ============================================================

  reset: () => {
    get().unsubscribeFromRoom();
    get().stopHeartbeat();
    set({ ...initialState });
  },

  attemptReconnect: async () => {
    const storedPlayerId = localStorage.getItem(STORAGE_KEYS.PLAYER_ID);
    const storedRoomCode = localStorage.getItem(STORAGE_KEYS.ROOM_CODE);
    const storedDisplayName = localStorage.getItem(STORAGE_KEYS.DISPLAY_NAME);

    if (!storedPlayerId || !storedRoomCode || !storedDisplayName) {
      return false;
    }

    try {
      const result = await get().joinRoom(storedRoomCode, storedDisplayName);
      return result.success;
    } catch {
      // Clear stale data
      localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
      localStorage.removeItem(STORAGE_KEYS.ROOM_CODE);
      return false;
    }
  },
}));

// ============================================================
// Cleanup on page unload
// ============================================================

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    const { playerId, room } = useMultiplayerStore.getState();
    if (playerId && room) {
      // Use sendBeacon for reliable delivery on page unload
      navigator.sendBeacon(
        "/api/leave-room",
        JSON.stringify({ playerId, roomId: room.id })
      );
    }
  });
}
