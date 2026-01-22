"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMultiplayerStore } from "@/lib/multiplayer-state";
import { RoomCodeDisplay } from "./RoomCodeDisplay";
import { PlayerList } from "./PlayerList";
import { Button } from "@/components/ui/Button";
import { Play, LogOut, Loader2, Users } from "lucide-react";
import { MULTIPLAYER_CONSTANTS } from "@/types/multiplayer";

export function Lobby() {
  const router = useRouter();
  const {
    roomCode,
    players,
    playerId,
    isHost,
    startGame,
    leaveRoom,
  } = useMultiplayerStore();

  const [isStarting, setIsStarting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectedPlayers = players.filter(p => p.is_connected);
  const canStart = isHost && connectedPlayers.length >= MULTIPLAYER_CONSTANTS.MIN_PLAYERS_TO_START;

  const handleStartGame = async () => {
    setError(null);
    setIsStarting(true);

    const result = await startGame();

    if (!result.success) {
      setError(result.error || "Failed to start game");
      setIsStarting(false);
    }
    // If successful, the real-time subscription will update the phase
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    await leaveRoom();
    router.push("/");
  };

  if (!roomCode) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-punch/5 to-blue-bright/5">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-purple-punch/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-punch/10">
              <Users className="w-5 h-5 text-purple-punch" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Game Lobby</h1>
              <p className="text-xs text-foreground/60">Waiting for players...</p>
            </div>
          </div>
          
          <RoomCodeDisplay code={roomCode} size="small" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Room Code (Large) */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-punch/10">
            <RoomCodeDisplay code={roomCode} size="large" />
          </div>

          {/* Players */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-punch/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">
                Players ({connectedPlayers.length}/{MULTIPLAYER_CONSTANTS.MAX_PLAYERS_PER_ROOM})
              </h2>
              {connectedPlayers.length < MULTIPLAYER_CONSTANTS.MIN_PLAYERS_TO_START && (
                <span className="text-sm text-foreground/60">
                  Need {MULTIPLAYER_CONSTANTS.MIN_PLAYERS_TO_START - connectedPlayers.length} more to start
                </span>
              )}
            </div>

            <PlayerList
              players={players}
              currentPlayerId={playerId}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-100 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isHost ? (
              <Button
                onClick={handleStartGame}
                disabled={!canStart || isStarting}
                size="lg"
                className="flex-1"
              >
                {isStarting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Start Game
                  </span>
                )}
              </Button>
            ) : (
              <div className="flex-1 py-4 px-6 rounded-xl bg-foreground/5 text-center text-foreground/60">
                Waiting for host to start the game...
              </div>
            )}

            <Button
              onClick={handleLeave}
              disabled={isLeaving}
              variant="ghost"
              size="lg"
            >
              {isLeaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Leaving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  Leave Room
                </span>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-foreground/50 space-y-1">
            <p>Share the room code with friends to invite them.</p>
            <p>The host can start the game when at least 2 players have joined.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
