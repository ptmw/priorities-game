import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/leave-room
 * 
 * Called via sendBeacon when a player closes their tab.
 * Marks the player as disconnected and handles host transfer if needed.
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside handler (not at module level)
    // to avoid build-time execution when env vars aren't available
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await request.json();
    const { playerId, roomId } = body;

    if (!playerId || !roomId) {
      return NextResponse.json(
        { error: "Missing playerId or roomId" },
        { status: 400 }
      );
    }

    // Get current players
    const { data: players } = await supabase
      .from("players")
      .select()
      .eq("room_id", roomId);

    const connectedPlayers = (players || []).filter(
      (p) => p.is_connected && p.id !== playerId
    );

    // If this is the last player, delete the room
    if (connectedPlayers.length === 0) {
      await supabase.from("rooms").delete().eq("id", roomId);
      return NextResponse.json({ success: true, action: "room_deleted" });
    }

    // Mark player as disconnected
    const leavingPlayer = players?.find((p) => p.id === playerId);
    await supabase
      .from("players")
      .update({ is_connected: false, last_seen_at: new Date().toISOString() })
      .eq("id", playerId);

    // If leaving player was host, transfer to next oldest connected player
    if (leavingPlayer?.is_host) {
      const newHost = connectedPlayers.sort(
        (a, b) =>
          new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
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

    return NextResponse.json({ success: true, action: "player_disconnected" });
  } catch (error) {
    console.error("Error in leave-room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
