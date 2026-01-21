"use client";

import { Swords } from "lucide-react";
import { WINNING_SCORE } from "@/types/game";

interface ScoreDisplayProps {
  playerScore: number;
  gameScore: number;
  round: number;
}

export function ScoreDisplay({ playerScore, gameScore, round }: ScoreDisplayProps) {
  const playerLeading = playerScore > gameScore;
  const gameLeading = gameScore > playerScore;
  const tied = playerScore === gameScore;

  return (
    <div className="flex items-center gap-3 sm:gap-5">
      {/* Round Counter */}
      <div className="text-center">
        <div className="text-[10px] sm:text-xs font-medium text-foreground/60 uppercase tracking-wide">
          Round
        </div>
        <div className="text-xl sm:text-2xl font-bold text-purple-punch">
          {round}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-foreground/20" />

      {/* Competitive Score Display */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Players Score */}
        <div className={`text-center transition-all duration-300 ${playerLeading ? "scale-110" : ""}`}>
          <div className="text-[10px] sm:text-xs font-medium text-foreground/60 uppercase tracking-wide">
            Players
          </div>
          <div className={`
            text-xl sm:text-2xl font-bold
            ${playerLeading ? "text-correct" : tied ? "text-purple-punch" : "text-foreground/70"}
          `}>
            {playerScore}
          </div>
          {/* Progress bar */}
          <div className="w-12 sm:w-16 h-1 bg-foreground/10 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-correct rounded-full transition-all duration-500"
              style={{ width: `${(playerScore / WINNING_SCORE) * 100}%` }}
            />
          </div>
        </div>

        {/* VS Icon */}
        <div className="flex flex-col items-center">
          <Swords className={`
            w-5 h-5 sm:w-6 sm:h-6
            ${tied ? "text-yellow-sunny" : playerLeading ? "text-correct" : "text-incorrect"}
            transition-colors duration-300
          `} />
          <span className="text-[8px] sm:text-[10px] font-bold text-foreground/40 uppercase">
            vs
          </span>
        </div>

        {/* Game Score */}
        <div className={`text-center transition-all duration-300 ${gameLeading ? "scale-110" : ""}`}>
          <div className="text-[10px] sm:text-xs font-medium text-foreground/60 uppercase tracking-wide">
            Game
          </div>
          <div className={`
            text-xl sm:text-2xl font-bold
            ${gameLeading ? "text-incorrect" : tied ? "text-purple-punch" : "text-foreground/70"}
          `}>
            {gameScore}
          </div>
          {/* Progress bar */}
          <div className="w-12 sm:w-16 h-1 bg-foreground/10 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-incorrect rounded-full transition-all duration-500"
              style={{ width: `${(gameScore / WINNING_SCORE) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
