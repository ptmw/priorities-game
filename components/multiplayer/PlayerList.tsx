"use client";

import { Crown, Wifi, WifiOff, Eye, Pencil, HelpCircle } from "lucide-react";
import type { Player } from "@/types/database";
import type { PlayerRole } from "@/types/multiplayer";

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string | null;
  pickerId?: string | null;
  guesserId?: string | null;
  showRoles?: boolean;
}

export function PlayerList({
  players,
  currentPlayerId,
  pickerId,
  guesserId,
  showRoles = false,
}: PlayerListProps) {
  // Sort: host first, then by join time
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.is_host && !b.is_host) return -1;
    if (!a.is_host && b.is_host) return 1;
    return new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime();
  });

  const getRole = (player: Player): PlayerRole | null => {
    if (!showRoles) return null;
    if (player.id === pickerId) return "picker";
    if (player.id === guesserId) return "guesser";
    return "spectator";
  };

  const getRoleDisplay = (role: PlayerRole | null) => {
    switch (role) {
      case "picker":
        return {
          icon: <Pencil className="w-4 h-4" />,
          label: "Picker",
          color: "text-pink-pop bg-pink-pop/10",
        };
      case "guesser":
        return {
          icon: <HelpCircle className="w-4 h-4" />,
          label: "Guesser",
          color: "text-blue-bright bg-blue-bright/10",
        };
      case "spectator":
        return {
          icon: <Eye className="w-4 h-4" />,
          label: "Watching",
          color: "text-foreground/50 bg-foreground/5",
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {sortedPlayers.map((player) => {
        const isMe = player.id === currentPlayerId;
        const role = getRole(player);
        const roleDisplay = getRoleDisplay(role);

        return (
          <div
            key={player.id}
            className={`
              flex items-center gap-3 p-3 rounded-xl
              ${isMe ? "bg-purple-punch/10 border-2 border-purple-punch/30" : "bg-foreground/5"}
              ${!player.is_connected ? "opacity-50" : ""}
              transition-all duration-200
            `}
          >
            {/* Connection Status */}
            <div className={`shrink-0 ${player.is_connected ? "text-green-fresh" : "text-foreground/30"}`}>
              {player.is_connected ? (
                <Wifi className="w-5 h-5" />
              ) : (
                <WifiOff className="w-5 h-5" />
              )}
            </div>

            {/* Name and badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-medium truncate ${isMe ? "text-purple-punch" : "text-foreground"}`}>
                  {player.display_name}
                </span>
                
                {isMe && (
                  <span className="text-xs font-medium text-purple-punch bg-purple-punch/10 px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
                
                {player.is_host && (
                  <Crown className="w-4 h-4 text-yellow-sunny shrink-0" />
                )}
              </div>
            </div>

            {/* Role badge */}
            {roleDisplay && (
              <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleDisplay.color}`}>
                {roleDisplay.icon}
                <span>{roleDisplay.label}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
