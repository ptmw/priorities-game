"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMultiplayerStore } from "@/lib/multiplayer-state";
import { RoomCodeDisplay } from "./RoomCodeDisplay";
import { PlayerList } from "./PlayerList";
import { RankingArea } from "@/components/game/RankingArea";
import { ResultsDisplay } from "@/components/game/ResultsDisplay";
import { ScoreDisplay } from "@/components/game/ScoreDisplay";
import { Button } from "@/components/ui/Button";
import { cardsData } from "@/lib/cards-data";
import { createRankedCard } from "@/lib/game-logic";
import type { Card, RankedCard } from "@/types/game";
import type { RankingEntry } from "@/types/database";
import {
  Send,
  ArrowRight,
  RotateCcw,
  LogOut,
  Loader2,
  Eye,
  Pencil,
  HelpCircle,
  Trophy,
  Skull,
  Users,
} from "lucide-react";
import { MULTIPLAYER_CONSTANTS } from "@/types/multiplayer";

export function MultiplayerGame() {
  const router = useRouter();
  const {
    room,
    roomCode,
    players,
    playerId,
    currentRound,
    myRole,
    phase,
    isHost,
    submitPicking,
    updateGuess,
    submitGuess,
    nextRound,
    leaveRoom,
    reset,
  } = useMultiplayerStore();

  const [currentRanking, setCurrentRanking] = useState<RankedCard[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);

  // Convert card IDs from round to full Card objects
  const roundCards: Card[] = currentRound?.card_ids
    ?.map(id => cardsData.find(c => c.id === id))
    .filter((c): c is Card => c !== undefined) || [];

  // Convert RankingEntry[] to RankedCard[]
  const toRankedCards = useCallback((entries: RankingEntry[] | null): RankedCard[] => {
    if (!entries) return [];
    return entries.map(entry => {
      const card = cardsData.find(c => c.id === entry.id);
      if (!card) return null;
      return createRankedCard(card, entry.position);
    }).filter((c): c is RankedCard => c !== null);
  }, []);

  // Get the current guess from the round (for spectators)
  const currentGuessFromRound = toRankedCards(currentRound?.current_guess as RankingEntry[] | null);

  // Get the actual ranking (for results)
  const actualRanking = toRankedCards(currentRound?.actual_ranking as RankingEntry[] | null);

  // Get the final guess (for results)
  const finalGuess = toRankedCards(currentRound?.final_guess as RankingEntry[] | null);

  // Reset ranking when round/phase changes
  useEffect(() => {
    setCurrentRanking([]);
    setIsSubmitting(false);
  }, [currentRound?.id, phase]);

  // Sync guesser's changes to Supabase (debounced)
  useEffect(() => {
    if (myRole !== "guesser" || phase !== "guessing" || currentRanking.length !== 5) return;

    const timeout = setTimeout(() => {
      const entries: RankingEntry[] = currentRanking.map(c => ({
        id: c.id,
        position: c.position,
      }));
      updateGuess(entries);
    }, 100); // Debounce 100ms

    return () => clearTimeout(timeout);
  }, [currentRanking, myRole, phase, updateGuess]);

  // Handle submit picking (picker only)
  const handleSubmitPicking = async () => {
    if (currentRanking.length !== 5) return;

    setIsSubmitting(true);
    try {
      const entries: RankingEntry[] = currentRanking.map(c => ({
        id: c.id,
        position: c.position,
      }));
      await submitPicking(entries);
    } catch (error) {
      console.error("Failed to submit picking:", error);
    }
    setIsSubmitting(false);
  };

  // Handle submit guess (guesser only)
  const handleSubmitGuess = async () => {
    if (currentRanking.length !== 5) return;

    setIsSubmitting(true);
    try {
      const entries: RankingEntry[] = currentRanking.map(c => ({
        id: c.id,
        position: c.position,
      }));
      await submitGuess(entries);
    } catch (error) {
      console.error("Failed to submit guess:", error);
    }
    setIsSubmitting(false);
  };

  // Handle next round (host only)
  const handleNextRound = async () => {
    setIsSubmitting(true);
    try {
      await nextRound();
    } catch (error) {
      console.error("Failed to start next round:", error);
    }
    setIsSubmitting(false);
  };

  // Handle leave room
  const handleLeave = async () => {
    await leaveRoom();
    router.push("/");
  };

  // Handle play again (host only, from game over)
  const handlePlayAgain = async () => {
    // Reset and start fresh - for now, leave and rejoin
    await leaveRoom();
    router.push("/");
  };

  if (!room || !currentRound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-punch animate-spin" />
      </div>
    );
  }

  // Calculate results for display
  const results = currentRound.results as Array<{
    card_id: string;
    actual_position: number;
    guessed_position: number;
    is_correct: boolean;
  }> | null;

  const formattedResults = results?.map(r => {
    const card = cardsData.find(c => c.id === r.card_id);
    return {
      card: card || { id: r.card_id, text: "Unknown" },
      actualPosition: r.actual_position,
      guessedPosition: r.guessed_position,
      isCorrect: r.is_correct,
    };
  }) || [];

  const correctCount = results?.filter(r => r.is_correct).length || 0;

  // Role-specific rendering
  const renderRoleIndicator = () => {
    const roleConfig = {
      picker: {
        icon: <Pencil className="w-5 h-5" />,
        label: "You are the Picker",
        description: "Rank the cards from ❤️ Love it to 😡 Hate it",
        color: "from-pink-pop to-purple-punch",
      },
      guesser: {
        icon: <HelpCircle className="w-5 h-5" />,
        label: "You are the Guesser",
        description: "Try to match the Picker's ranking!",
        color: "from-blue-bright to-purple-punch",
      },
      spectator: {
        icon: <Eye className="w-5 h-5" />,
        label: "You are Watching",
        description: "Watch the Guesser make their moves",
        color: "from-foreground/50 to-foreground/30",
      },
    };

    const config = roleConfig[myRole || "spectator"];

    return (
      <div className={`text-center p-4 rounded-2xl bg-gradient-to-r ${config.color} text-white mb-4`}>
        <div className="flex items-center justify-center gap-2 mb-1">
          {config.icon}
          <span className="font-bold">{config.label}</span>
        </div>
        <p className="text-sm opacity-90">{config.description}</p>
      </div>
    );
  };

  const renderPhase = () => {
    switch (phase) {
      case "picking":
        if (myRole === "picker") {
          return (
            <div className="space-y-6">
              {renderRoleIndicator()}
              <RankingArea
                availableCards={roundCards}
                rankedCards={currentRanking}
                onRankingChange={setCurrentRanking}
                title="🎯 Rank these items"
              />
              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleSubmitPicking}
                  disabled={currentRanking.length !== 5 || isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Submit Ranking
                    </span>
                  )}
                </Button>
              </div>
            </div>
          );
        } else {
          // Waiting for picker
          const picker = players.find(p => p.id === currentRound.picker_id);
          return (
            <div className="text-center py-12 space-y-6">
              {renderRoleIndicator()}
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-purple-punch animate-spin mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">
                  Waiting for {picker?.display_name || "Picker"}...
                </h2>
                <p className="text-foreground/60">
                  They&apos;re ranking the cards right now
                </p>
              </div>
            </div>
          );
        }

      case "guessing":
        if (myRole === "guesser") {
          return (
            <div className="space-y-6">
              {renderRoleIndicator()}
              <RankingArea
                availableCards={roundCards}
                rankedCards={currentRanking}
                onRankingChange={setCurrentRanking}
                title="🤔 Guess the ranking"
              />
              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleSubmitGuess}
                  disabled={currentRanking.length !== 5 || isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Submit Guess
                    </span>
                  )}
                </Button>
              </div>
            </div>
          );
        } else {
          // Spectator view - show live guess updates
          const guesser = players.find(p => p.id === currentRound.guesser_id);
          return (
            <div className="space-y-6">
              {renderRoleIndicator()}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  {guesser?.display_name || "Guesser"} is guessing...
                </h2>
                <p className="text-foreground/60 text-sm">
                  Watch their moves in real-time
                </p>
              </div>
              <RankingArea
                availableCards={roundCards}
                rankedCards={currentGuessFromRound}
                onRankingChange={() => {}} // Read-only
                disabled={true}
                title="🤔 Current Guess"
              />
            </div>
          );
        }

      case "results":
        return (
          <div className="space-y-6">
            <ResultsDisplay
              results={formattedResults}
              correctCount={correctCount}
              playerRoundScore={currentRound.player_round_score}
              gameRoundScore={currentRound.game_round_score}
            />
            <div className="flex justify-center pt-4">
              {isHost ? (
                <Button onClick={handleNextRound} size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Starting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ArrowRight className="w-5 h-5" />
                      Next Round
                    </span>
                  )}
                </Button>
              ) : (
                <div className="py-4 px-6 rounded-xl bg-foreground/5 text-foreground/60">
                  Waiting for host to start next round...
                </div>
              )}
            </div>
          </div>
        );

      case "gameOver":
        return (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-8">
            {/* Winner Announcement */}
            <div className={`
              text-center space-y-4 p-8 rounded-3xl
              ${room.winner === "players" 
                ? "bg-gradient-to-br from-green-fresh/20 to-blue-bright/20" 
                : "bg-gradient-to-br from-pink-pop/20 to-purple-punch/20"
              }
            `}>
              <div className="text-6xl sm:text-8xl animate-bounce">
                {room.winner === "players" ? (
                  <Trophy className="w-20 h-20 sm:w-28 sm:h-28 mx-auto text-yellow-sunny drop-shadow-lg" />
                ) : (
                  <Skull className="w-20 h-20 sm:w-28 sm:h-28 mx-auto text-pink-pop drop-shadow-lg" />
                )}
              </div>
              
              <h2 className={`
                text-3xl sm:text-5xl font-extrabold
                ${room.winner === "players" ? "text-green-fresh" : "text-pink-pop"}
              `}>
                {room.winner === "players" ? "Players Win!" : "Game Wins!"}
              </h2>
              
              <p className="text-xl sm:text-2xl text-foreground/70">
                {room.winner === "players" ? "🎉 Amazing teamwork!" : "😈 Better luck next time!"}
              </p>

              {/* Final Score */}
              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-sm text-foreground/60">Players</div>
                  <div className="text-3xl font-bold text-green-fresh">{room.player_score}</div>
                </div>
                <div className="text-2xl text-foreground/40">—</div>
                <div className="text-center">
                  <div className="text-sm text-foreground/60">Game</div>
                  <div className="text-3xl font-bold text-pink-pop">{room.game_score}</div>
                </div>
              </div>

              <p className="text-sm text-foreground/50">
                Completed in {room.current_round} rounds
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handlePlayAgain} size="lg" variant="primary">
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </span>
              </Button>
              <Button onClick={handleLeave} size="lg" variant="ghost">
                <span className="flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  Leave
                </span>
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-punch/5 to-blue-bright/5">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-purple-punch/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <ScoreDisplay
            playerScore={room.player_score}
            gameScore={room.game_score}
            round={room.current_round}
          />
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPlayers(!showPlayers)}
              className="p-2 rounded-full hover:bg-purple-punch/10 transition-colors relative"
              title="Show players"
            >
              <Users className="w-6 h-6 text-purple-punch" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-punch text-white text-xs font-bold rounded-full flex items-center justify-center">
                {players.filter(p => p.is_connected).length}
              </span>
            </button>
            
            {roomCode && <RoomCodeDisplay code={roomCode} size="small" />}
          </div>
        </div>
      </header>

      {/* Players Panel (Collapsible) */}
      {showPlayers && (
        <div className="bg-white border-b border-purple-punch/10 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <PlayerList
              players={players}
              currentPlayerId={playerId}
              pickerId={currentRound.picker_id}
              guesserId={currentRound.guesser_id}
              showRoles={true}
            />
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {renderPhase()}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-foreground/40">
        Priorities Game • Multiplayer
      </footer>
    </div>
  );
}
