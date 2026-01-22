/**
 * Supabase Database Types
 * 
 * This file defines TypeScript types for our Supabase tables.
 * These should match the schema defined in Supabase.
 */

export type RoomStatus = "lobby" | "playing" | "finished";
export type RoundPhase = "picking" | "guessing" | "results";
export type GameWinner = "players" | "game" | null;

/** Row type for the rooms table */
export type Room = {
  id: string;
  code: string;
  host_player_id: string;
  status: RoomStatus;
  player_score: number;
  game_score: number;
  current_round: number;
  winner: GameWinner;
  created_at: string;
  last_activity_at: string;
};

/** Row type for the players table */
export type Player = {
  id: string;
  room_id: string;
  display_name: string;
  is_host: boolean;
  is_connected: boolean;
  joined_at: string;
  last_seen_at: string;
};

/** Ranking entry stored in JSONB */
export type RankingEntry = {
  id: string;      // Card ID
  position: number; // 1-5
};

/** Row type for the rounds table */
export type Round = {
  id: string;
  room_id: string;
  round_number: number;
  picker_id: string | null;
  guesser_id: string | null;
  phase: RoundPhase;
  card_ids: string[];
  actual_ranking: RankingEntry[] | null;
  current_guess: RankingEntry[] | null;
  final_guess: RankingEntry[] | null;
  results: RoundResult[] | null;
  player_round_score: number;
  game_round_score: number;
  created_at: string;
  submitted_at: string | null;
};

/** Result for a single card comparison */
export type RoundResult = {
  card_id: string;
  actual_position: number;
  guessed_position: number;
  is_correct: boolean;
};

/**
 * Database schema type for Supabase client
 * This enables type-safe queries
 */
export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: Room;
        Insert: Omit<Room, "id" | "created_at" | "last_activity_at"> & {
          id?: string;
          created_at?: string;
          last_activity_at?: string;
        };
        Update: Partial<Omit<Room, "id">>;
      };
      players: {
        Row: Player;
        Insert: Omit<Player, "id" | "joined_at" | "last_seen_at" | "is_host" | "is_connected"> & {
          id?: string;
          joined_at?: string;
          last_seen_at?: string;
          is_host?: boolean;
          is_connected?: boolean;
        };
        Update: Partial<Omit<Player, "id">>;
      };
      rounds: {
        Row: Round;
        Insert: Omit<Round, "id" | "created_at" | "phase" | "player_round_score" | "game_round_score"> & {
          id?: string;
          created_at?: string;
          phase?: RoundPhase;
          player_round_score?: number;
          game_round_score?: number;
        };
        Update: Partial<Omit<Round, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      room_status: RoomStatus;
      round_phase: RoundPhase;
    };
  };
};
