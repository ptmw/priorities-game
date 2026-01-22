/**
 * Room Utilities
 * 
 * Functions for room management: creation, joining, leaving, and role assignment.
 */

import { supabase, now } from "./supabase";
import { getRandomCards } from "./card-utils";
import type { Room, Player, Round, RankingEntry } from "@/types/database";
import type { CreateRoomResult, JoinRoomResult } from "@/types/multiplayer";
import { MULTIPLAYER_CONSTANTS } from "@/types/multiplayer";

// Alphabet for room codes (excluding I and O to avoid confusion with 1 and 0)
const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generate a random 4-letter room code
 */
export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < MULTIPLAYER_CONSTANTS.ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
  }
  return code;
}

/**
 * Create a new room with the given host name
 * Handles collision by retrying up to 5 times
 * 
 * Note: Room is created with a placeholder host_player_id, then updated after player creation.
 * This avoids circular FK constraint issues.
 */
export async function createRoom(hostName: string): Promise<CreateRoomResult> {
  const maxAttempts = 5;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRoomCode();
    const roomId = crypto.randomUUID();
    const playerId = crypto.randomUUID();
    
    try {
      // 1. Insert room first (host_player_id is just a reference, no FK constraint)
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .insert({
          id: roomId,
          code,
          host_player_id: playerId, // Will be the player we create next
          status: "lobby",
          player_score: 0,
          game_score: 0,
          current_round: 0,
          winner: null,
        })
        .select()
        .single();
      
      if (roomError) {
        // Check if it's a unique constraint violation (code already exists)
        if (roomError.code === "23505") {
          continue; // Try again with a new code
        }
        console.error("Room creation error:", roomError);
        throw new Error(roomError.message || "Failed to create room");
      }
      
      // 2. Insert the host player
      const { data: player, error: playerError } = await supabase
        .from("players")
        .insert({
          id: playerId,
          room_id: roomId,
          display_name: hostName.trim().slice(0, 20),
          is_host: true,
          is_connected: true,
        })
        .select()
        .single();
      
      if (playerError) {
        // Clean up the room if player creation fails
        console.error("Player creation error:", playerError);
        await supabase.from("rooms").delete().eq("id", roomId);
        throw new Error(playerError.message || "Failed to create player");
      }
      
      return { room: room as Room, player: player as Player };
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === maxAttempts - 1) {
        const message = error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Failed to create room: ${message}`);
      }
    }
  }
  
  throw new Error("Failed to create room after multiple attempts");
}

/**
 * Join an existing room by code
 * @param code - The 4-letter room code
 * @param displayName - The player's display name
 * @param existingPlayerId - Optional existing player ID for reconnection
 */
export async function joinRoom(
  code: string,
  displayName: string,
  existingPlayerId?: string
): Promise<JoinRoomResult> {
  const normalizedCode = code.toUpperCase().trim();
  
  // 1. Find the room
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select()
    .eq("code", normalizedCode)
    .single();
  
  if (roomError || !room) {
    throw new Error("Room not found. Check the code and try again.");
  }
  
  // 2. Check if room is full
  const { data: existingPlayers, error: playersError } = await supabase
    .from("players")
    .select()
    .eq("room_id", room.id);
  
  if (playersError) throw playersError;
  
  const connectedPlayers = (existingPlayers || []).filter(p => p.is_connected);
  
  if (connectedPlayers.length >= MULTIPLAYER_CONSTANTS.MAX_PLAYERS_PER_ROOM) {
    throw new Error("Room is full (max 10 players)");
  }
  
  // 3. Check if this is a reconnection
  if (existingPlayerId) {
    const existingPlayer = existingPlayers?.find(p => p.id === existingPlayerId);
    if (existingPlayer) {
      // Reconnect: update connection status
      const { data: updatedPlayer, error: updateError } = await supabase
        .from("players")
        .update({ 
          is_connected: true, 
          last_seen_at: now(),
          display_name: displayName.trim().slice(0, 20), // Allow name update
        })
        .eq("id", existingPlayerId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      return {
        room: room as Room,
        player: updatedPlayer as Player,
        players: existingPlayers as Player[],
      };
    }
  }
  
  // 4. Create new player
  const { data: newPlayer, error: joinError } = await supabase
    .from("players")
    .insert({
      room_id: room.id,
      display_name: displayName.trim().slice(0, 20),
      is_host: false,
      is_connected: true,
    })
    .select()
    .single();
  
  if (joinError) {
    if (joinError.code === "23514") { // Check constraint violation (max players)
      throw new Error("Room is full (max 10 players)");
    }
    throw joinError;
  }
  
  // 5. Update room activity
  await supabase
    .from("rooms")
    .update({ last_activity_at: now() })
    .eq("id", room.id);
  
  return {
    room: room as Room,
    player: newPlayer as Player,
    players: [...(existingPlayers || []), newPlayer] as Player[],
  };
}

/**
 * Leave a room (mark player as disconnected, or delete if last player)
 */
export async function leaveRoom(playerId: string, roomId: string): Promise<void> {
  // 1. Get current players
  const { data: players } = await supabase
    .from("players")
    .select()
    .eq("room_id", roomId);
  
  const connectedPlayers = (players || []).filter(
    p => p.is_connected && p.id !== playerId
  );
  
  // 2. If this is the last player, delete the room
  if (connectedPlayers.length === 0) {
    await supabase.from("rooms").delete().eq("id", roomId);
    return;
  }
  
  // 3. Mark player as disconnected
  const leavingPlayer = players?.find(p => p.id === playerId);
  await supabase
    .from("players")
    .update({ is_connected: false, last_seen_at: now() })
    .eq("id", playerId);
  
  // 4. If leaving player was host, transfer to next oldest connected player
  if (leavingPlayer?.is_host) {
    const newHost = connectedPlayers.sort(
      (a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
    )[0];
    
    if (newHost) {
      await supabase
        .from("players")
        .update({ is_host: true })
        .eq("id", newHost.id);
      
      await supabase
        .from("rooms")
        .update({ host_player_id: newHost.id })
        .eq("id", roomId);
    }
  }
}

/**
 * Assign picker and guesser roles for a round
 * @param players - All connected players in the room
 * @param previousPickerId - The picker from the previous round (to rotate)
 */
export function assignRoles(
  players: Player[],
  previousPickerId?: string
): { pickerId: string; guesserId: string } {
  const connectedPlayers = players.filter(p => p.is_connected);
  
  if (connectedPlayers.length < 2) {
    throw new Error("Need at least 2 players to assign roles");
  }
  
  // Rotate picker: exclude previous picker if possible
  let eligiblePickers = previousPickerId
    ? connectedPlayers.filter(p => p.id !== previousPickerId)
    : connectedPlayers;
  
  // If only one player was eligible and it was the previous picker, allow them
  if (eligiblePickers.length === 0) {
    eligiblePickers = connectedPlayers;
  }
  
  // Random picker from eligible players
  const picker = eligiblePickers[Math.floor(Math.random() * eligiblePickers.length)];
  
  // Guesser: first non-picker by join order
  const guesser = connectedPlayers
    .filter(p => p.id !== picker.id)
    .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime())[0];
  
  return { pickerId: picker.id, guesserId: guesser.id };
}

/**
 * Start a new round in the room
 */
export async function startRound(
  roomId: string,
  roundNumber: number,
  pickerId: string,
  guesserId: string
): Promise<Round> {
  console.log(`[startRound] Starting round ${roundNumber} for room ${roomId}`);
  
  // Check if round already exists (in case of retry/race condition)
  const { data: existingRound } = await supabase
    .from("rounds")
    .select()
    .eq("room_id", roomId)
    .eq("round_number", roundNumber)
    .single();
  
  if (existingRound) {
    console.log("[startRound] Round already exists, returning existing round");
    return existingRound as Round;
  }

  // Get 5 random cards
  const cards = getRandomCards(5);
  const cardIds = cards.map(c => c.id);
  
  console.log("[startRound] Inserting new round...");
  const { data: round, error } = await supabase
    .from("rounds")
    .insert({
      room_id: roomId,
      round_number: roundNumber,
      picker_id: pickerId,
      guesser_id: guesserId,
      phase: "picking",
      card_ids: cardIds,
    })
    .select()
    .single();
  
  if (error) {
    console.error("[startRound] Error creating round:", error);
    throw new Error(error.message || "Failed to create round");
  }
  
  console.log("[startRound] Round created, updating room...");
  // Update room
  const { error: updateError } = await supabase
    .from("rooms")
    .update({ 
      status: "playing",
      current_round: roundNumber,
      last_activity_at: now(),
    })
    .eq("id", roomId);
  
  if (updateError) {
    console.error("[startRound] Error updating room:", updateError);
  }
  
  console.log("[startRound] Done!");
  return round as Round;
}

/**
 * Submit the picker's ranking
 */
export async function submitPickerRanking(
  roundId: string,
  ranking: RankingEntry[]
): Promise<void> {
  const { error } = await supabase
    .from("rounds")
    .update({
      actual_ranking: ranking,
      phase: "guessing",
    })
    .eq("id", roundId);
  
  if (error) throw error;
}

/**
 * Update the current guess (real-time sync for spectators)
 */
export async function updateCurrentGuess(
  roundId: string,
  guess: RankingEntry[]
): Promise<void> {
  const { error } = await supabase
    .from("rounds")
    .update({ current_guess: guess })
    .eq("id", roundId);
  
  if (error) throw error;
}

/**
 * Submit the final guess and calculate results
 */
export async function submitFinalGuess(
  roundId: string,
  roomId: string,
  guess: RankingEntry[],
  actualRanking: RankingEntry[]
): Promise<{ playerScore: number; gameScore: number }> {
  // Calculate results
  const results = guess.map(g => {
    const actual = actualRanking.find(a => a.id === g.id);
    return {
      card_id: g.id,
      actual_position: actual?.position || 0,
      guessed_position: g.position,
      is_correct: actual?.position === g.position,
    };
  });
  
  const playerRoundScore = results.filter(r => r.is_correct).length;
  const gameRoundScore = 5 - playerRoundScore;
  
  // Update round
  const { error: roundError } = await supabase
    .from("rounds")
    .update({
      final_guess: guess,
      results,
      player_round_score: playerRoundScore,
      game_round_score: gameRoundScore,
      phase: "results",
      submitted_at: now(),
    })
    .eq("id", roundId);
  
  if (roundError) throw roundError;
  
  // Get current room scores
  const { data: room } = await supabase
    .from("rooms")
    .select("player_score, game_score")
    .eq("id", roomId)
    .single();
  
  const newPlayerScore = (room?.player_score || 0) + playerRoundScore;
  const newGameScore = (room?.game_score || 0) + gameRoundScore;
  
  // Check for winner
  const winner = 
    newPlayerScore >= MULTIPLAYER_CONSTANTS.WINNING_SCORE ? "players" :
    newGameScore >= MULTIPLAYER_CONSTANTS.WINNING_SCORE ? "game" : 
    null;
  
  // Update room
  const { error: roomError } = await supabase
    .from("rooms")
    .update({
      player_score: newPlayerScore,
      game_score: newGameScore,
      winner,
      status: winner ? "finished" : "playing",
      last_activity_at: now(),
    })
    .eq("id", roomId);
  
  if (roomError) throw roomError;
  
  return { playerScore: playerRoundScore, gameScore: gameRoundScore };
}

/**
 * Get the current round for a room
 */
export async function getCurrentRound(roomId: string): Promise<Round | null> {
  const { data: room } = await supabase
    .from("rooms")
    .select("current_round")
    .eq("id", roomId)
    .single();
  
  if (!room || room.current_round === 0) return null;
  
  const { data: round } = await supabase
    .from("rounds")
    .select()
    .eq("room_id", roomId)
    .eq("round_number", room.current_round)
    .single();
  
  return round as Round | null;
}

/**
 * Get all players in a room
 */
export async function getPlayers(roomId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select()
    .eq("room_id", roomId)
    .order("joined_at", { ascending: true });
  
  if (error) throw error;
  return data as Player[];
}

/**
 * Update player heartbeat
 */
export async function updateHeartbeat(
  playerId: string,
  roomId: string
): Promise<void> {
  const timestamp = now();
  
  await Promise.all([
    supabase
      .from("players")
      .update({ last_seen_at: timestamp })
      .eq("id", playerId),
    supabase
      .from("rooms")
      .update({ last_activity_at: timestamp })
      .eq("id", roomId),
  ]);
}
