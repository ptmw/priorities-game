"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMultiplayerStore } from "@/lib/multiplayer-state";
import { Lobby } from "@/components/multiplayer/Lobby";
import { MultiplayerGame } from "@/components/multiplayer/MultiplayerGame";
import { JoinRoom } from "@/components/multiplayer/JoinRoom";
import { Loader2 } from "lucide-react";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();

  const {
    phase,
    roomCode,
    connectionStatus,
    error,
    attemptReconnect,
    reset,
  } = useMultiplayerStore();

  // Try to reconnect or show join form
  useEffect(() => {
    if (!code) {
      router.push("/");
      return;
    }

    // If already connected to this room, do nothing
    if (roomCode === code && connectionStatus === "connected") {
      return;
    }

    // If connected to a different room, reset
    if (roomCode && roomCode !== code) {
      reset();
    }

    // Attempt reconnection if we have stored credentials
    if (connectionStatus === "disconnected") {
      attemptReconnect().then((success) => {
        // If reconnection failed or connected to wrong room, show join form
        if (!success || useMultiplayerStore.getState().roomCode !== code) {
          // Will show JoinRoom component
        }
      });
    }
  }, [code, roomCode, connectionStatus, attemptReconnect, reset, router]);

  // Loading state
  if (connectionStatus === "connecting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-punch/5 to-blue-bright/5">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-punch animate-spin mx-auto" />
          <p className="text-foreground/70">Connecting to room...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (connectionStatus === "error" && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-punch/5 to-blue-bright/5">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="text-5xl">😵</div>
          <h2 className="text-2xl font-bold text-foreground">Connection Error</h2>
          <p className="text-foreground/70">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-purple-punch text-white rounded-xl font-bold hover:bg-purple-punch/90 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Not connected - show join form
  if (!roomCode || roomCode !== code) {
    return <JoinRoom prefillCode={code} />;
  }

  // Connected - show appropriate view based on phase
  switch (phase) {
    case "lobby":
      return <Lobby />;
    
    case "picking":
    case "guessing":
    case "results":
    case "gameOver":
      return <MultiplayerGame />;
    
    default:
      return <Lobby />;
  }
}
