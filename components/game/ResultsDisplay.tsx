"use client";

import { CardResult, RANK_LABELS } from "@/types/game";
import { CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react";

interface ResultsDisplayProps {
  results: CardResult[];
  correctCount: number;
  playerRoundScore: number;
  gameRoundScore: number;
}

export function ResultsDisplay({ 
  results, 
  correctCount,
  playerRoundScore,
  gameRoundScore,
}: ResultsDisplayProps) {
  // Sort results by actual position
  const sortedResults = [...results].sort(
    (a, b) => a.actualPosition - b.actualPosition
  );

  const playerWonRound = playerRoundScore > gameRoundScore;
  const gameWonRound = gameRoundScore > playerRoundScore;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Round Results
        </h2>
        
        {/* Round Score Summary */}
        <div className="flex items-center justify-center gap-4">
          {/* Players earned */}
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-xl
            ${playerWonRound ? "bg-correct/20 ring-2 ring-correct" : "bg-correct/10"}
            transition-all duration-300
          `}>
            <TrendingUp className={`w-5 h-5 ${playerWonRound ? "text-correct" : "text-correct/70"}`} />
            <div className="text-left">
              <div className="text-xs text-foreground/60">Players</div>
              <div className={`text-lg font-bold ${playerWonRound ? "text-correct" : "text-correct/70"}`}>
                +{playerRoundScore}
              </div>
            </div>
          </div>

          {/* Game earned */}
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-xl
            ${gameWonRound ? "bg-incorrect/20 ring-2 ring-incorrect" : "bg-incorrect/10"}
            transition-all duration-300
          `}>
            <TrendingDown className={`w-5 h-5 ${gameWonRound ? "text-incorrect" : "text-incorrect/70"}`} />
            <div className="text-left">
              <div className="text-xs text-foreground/60">Game</div>
              <div className={`text-lg font-bold ${gameWonRound ? "text-incorrect" : "text-incorrect/70"}`}>
                +{gameRoundScore}
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className={`
          inline-flex items-center gap-2 px-5 py-2 rounded-full shadow-md
          ${playerWonRound ? "bg-correct/20" : gameWonRound ? "bg-incorrect/20" : "bg-yellow-sunny/20"}
        `}>
          <span className="text-base sm:text-lg font-semibold">
            {correctCount === 5 ? (
              <>Perfect memory! 🧠✨</>
            ) : correctCount >= 3 ? (
              <>Nice! You remembered {correctCount} of 5! 👏</>
            ) : correctCount === 0 ? (
              <>Oops! The game takes this round 😈</>
            ) : (
              <>You got {correctCount} of 5 correct</>
            )}
          </span>
        </div>
      </div>

      {/* Side by Side Comparison */}
      <div className="grid grid-cols-1 gap-4">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 items-center px-2">
          <div className="text-sm font-semibold text-foreground/70 text-center">
            Actual Ranking
          </div>
          <div className="w-10" />
          <div className="text-sm font-semibold text-foreground/70 text-center">
            Your Guess
          </div>
        </div>

        {/* Results Rows */}
        {sortedResults.map((result, index) => {
          const actualRankInfo = RANK_LABELS[result.actualPosition];
          const guessRankInfo = RANK_LABELS[result.guessedPosition];

          return (
            <div
              key={result.card.id}
              className={`
                grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 items-center
                p-3 rounded-xl
                animate-reveal
                ${result.isCorrect ? "bg-correct/10" : "bg-incorrect/10"}
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Actual */}
              <div className="flex items-center gap-2 justify-end">
                <span className="text-sm sm:text-base font-medium truncate">
                  {result.card.text}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-lg">{actualRankInfo.emoji}</span>
                  <span className="text-xs text-foreground/60">
                    #{result.actualPosition}
                  </span>
                </div>
              </div>

              {/* Result Icon */}
              <div className="w-10 flex justify-center">
                {result.isCorrect ? (
                  <CheckCircle className="w-8 h-8 text-correct" />
                ) : (
                  <XCircle className="w-8 h-8 text-incorrect" />
                )}
              </div>

              {/* Guessed */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-foreground/60">
                    #{result.guessedPosition}
                  </span>
                  <span className="text-lg">{guessRankInfo?.emoji || "❓"}</span>
                </div>
                <span className="text-sm sm:text-base font-medium truncate">
                  {result.card.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
