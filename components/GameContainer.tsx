"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/game-state";
import { RankedCard, WINNING_SCORE } from "@/types/game";
import { RankingArea } from "./game/RankingArea";
import { ResultsDisplay } from "./game/ResultsDisplay";
import { ScoreDisplay } from "./game/ScoreDisplay";
import { Button } from "./ui/Button";
import { RotateCcw, Play, Send, ArrowRight, HelpCircle, X, Trophy, Skull, Loader2 } from "lucide-react";

export function GameContainer() {
  const {
    phase,
    currentRound,
    playerScore,
    gameScore,
    playerRoundScore,
    gameRoundScore,
    selectedCards,
    results,
    correctCount,
    winner,
    isLoadingCards,
    allCards,
    loadCardsIfNeeded,
    startRound,
    submitRanking,
    submitGuess,
    nextRound,
    resetGame,
  } = useGameStore();

  // Local state for current ranking being built
  const [currentRanking, setCurrentRanking] = useState<RankedCard[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);

  // Load cards on mount
  useEffect(() => {
    loadCardsIfNeeded();
  }, [loadCardsIfNeeded]);

  // Reset current ranking when phase changes
  useEffect(() => {
    setCurrentRanking([]);
  }, [phase, currentRound]);

  // Check if ranking is ready to submit (all 5 cards placed)
  const isRankingComplete = currentRanking.length === 5;

  // Check if cards are ready
  const cardsReady = allCards.length > 0;

  // Handle submit ranking (picker phase)
  const handleSubmitRanking = () => {
    if (!isRankingComplete) return;
    submitRanking(currentRanking);
  };

  // Handle submit guess (guesser phase)
  const handleSubmitGuess = () => {
    if (!isRankingComplete) return;
    submitGuess(currentRanking);
  };

  // Render based on game phase
  const renderPhase = () => {
    // Loading state
    if (isLoadingCards || !cardsReady) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-purple-punch animate-spin" />
          <p className="text-foreground/60">Loading cards...</p>
        </div>
      );
    }

    // Game hasn't started yet
    if (currentRound === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Welcome to Priorities!
            </h2>
            <p className="text-lg text-foreground/70 max-w-md mx-auto">
              Rank 5 cards from ❤️ Love it to 😡 Hate it, then try to remember your ranking!
            </p>
            <p className="text-base text-foreground/60 max-w-md mx-auto">
              <span className="font-semibold text-correct">You</span> score for each correct guess.{" "}
              <span className="font-semibold text-incorrect">The Game</span> scores for each mistake.{" "}
              <span className="font-semibold">First to {WINNING_SCORE} wins!</span>
            </p>
          </div>
          <Button onClick={startRound} size="lg">
            <span className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Start Game
            </span>
          </Button>
        </div>
      );
    }

    switch (phase) {
      case "ranking":
        return (
          <div className="space-y-6">
            <RankingArea
              availableCards={selectedCards}
              rankedCards={currentRanking}
              onRankingChange={setCurrentRanking}
              title="🎯 Rank these items"
            />
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleSubmitRanking}
                disabled={!isRankingComplete}
                size="lg"
              >
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Submit Ranking
                </span>
              </Button>
            </div>
          </div>
        );

      case "guessing":
        return (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <p className="text-foreground/70 font-medium">
                Now recreate your ranking from memory!
              </p>
            </div>
            <RankingArea
              availableCards={selectedCards}
              rankedCards={currentRanking}
              onRankingChange={setCurrentRanking}
              title="🤔 Guess the ranking"
            />
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleSubmitGuess}
                disabled={!isRankingComplete}
                size="lg"
              >
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Submit Guess
                </span>
              </Button>
            </div>
          </div>
        );

      case "results":
        return (
          <div className="space-y-6">
            <ResultsDisplay 
              results={results} 
              correctCount={correctCount}
              playerRoundScore={playerRoundScore}
              gameRoundScore={gameRoundScore}
            />
            <div className="flex justify-center pt-4">
              <Button onClick={nextRound} size="lg">
                <span className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" />
                  Next Round
                </span>
              </Button>
            </div>
          </div>
        );

      case "gameOver":
        return (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-8">
            {/* Winner Announcement */}
            <div className={`
              text-center space-y-4 p-8 rounded-3xl
              ${winner === "players" 
                ? "bg-gradient-to-br from-correct/20 to-green-fresh/20" 
                : "bg-gradient-to-br from-incorrect/20 to-pink-pop/20"
              }
            `}>
              <div className="text-6xl sm:text-8xl animate-bounce-in">
                {winner === "players" ? (
                  <Trophy className="w-20 h-20 sm:w-28 sm:h-28 mx-auto text-yellow-sunny drop-shadow-lg" />
                ) : (
                  <Skull className="w-20 h-20 sm:w-28 sm:h-28 mx-auto text-incorrect drop-shadow-lg" />
                )}
              </div>
              
              <h2 className={`
                text-3xl sm:text-5xl font-extrabold
                ${winner === "players" ? "text-correct" : "text-incorrect"}
              `}>
                {winner === "players" ? "Players Win!" : "Game Wins!"}
              </h2>
              
              <p className="text-xl sm:text-2xl text-foreground/70">
                {winner === "players" ? "🎉 Amazing memory! You beat the game!" : "😈 Better luck next time!"}
              </p>

              {/* Final Score */}
              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-sm text-foreground/60">Players</div>
                  <div className="text-3xl font-bold text-correct">{playerScore}</div>
                </div>
                <div className="text-2xl text-foreground/40">—</div>
                <div className="text-center">
                  <div className="text-sm text-foreground/60">Game</div>
                  <div className="text-3xl font-bold text-incorrect">{gameScore}</div>
                </div>
              </div>

              <p className="text-sm text-foreground/50">
                Completed in {currentRound} rounds
              </p>
            </div>

            {/* Play Again Button */}
            <Button onClick={resetGame} size="lg" variant="primary">
              <span className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Play Again
              </span>
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-purple-punch/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <ScoreDisplay 
            playerScore={playerScore} 
            gameScore={gameScore} 
            round={currentRound} 
          />
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="p-2 rounded-full hover:bg-purple-punch/10 transition-colors"
              aria-label="How to play"
            >
              <HelpCircle className="w-6 h-6 text-purple-punch" />
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetGame}
              disabled={currentRound === 0 || !cardsReady}
            >
              <span className="flex items-center gap-1">
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Restart</span>
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Instructions Panel */}
      {showInstructions && (
        <div className="bg-purple-punch/5 border-b border-purple-punch/20 px-4 py-4">
          <div className="max-w-2xl mx-auto relative">
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-0 right-0 p-1 rounded-full hover:bg-purple-punch/10"
            >
              <X className="w-5 h-5 text-foreground/60" />
            </button>
            <h3 className="font-bold text-foreground mb-2">How to Play</h3>
            <ol className="text-sm text-foreground/70 space-y-1 list-decimal list-inside">
              <li>Cards start in random positions</li>
              <li>Tap two cards to swap them</li>
              <li>Arrange from ❤️ Love it to 😡 Hate it</li>
              <li>Submit, then recreate your ranking from memory</li>
              <li>
                <span className="text-correct font-semibold">You</span> score for correct positions,{" "}
                <span className="text-incorrect font-semibold">Game</span> scores for mistakes
              </li>
              <li>First to {WINNING_SCORE} wins!</li>
            </ol>
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
        Priorities Game • Phase 1 Prototype
      </footer>
    </div>
  );
}
