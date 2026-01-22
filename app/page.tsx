"use client";

import { useState } from "react";
import { GameContainer } from "@/components/GameContainer";
import { JoinOrCreate } from "@/components/multiplayer/JoinOrCreate";
import { Users, User } from "lucide-react";

type GameMode = "select" | "single" | "multiplayer";

export default function Home() {
  const [mode, setMode] = useState<GameMode>("select");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Gradient blobs */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-pink-pop/20 rounded-full blur-3xl" />
        <div className="absolute top-20 -right-40 w-96 h-96 bg-purple-punch/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-bright/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-yellow-sunny/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-fresh/10 rounded-full blur-3xl" />
      </div>

      {/* Header Title */}
      <div className="text-center pt-6 pb-2 px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold">
          <span className="bg-gradient-to-r from-purple-punch via-pink-pop to-coral-warm bg-clip-text text-transparent">
            Priorities
          </span>
        </h1>
        <p className="text-foreground/60 mt-1 text-sm sm:text-base">
          Rank it, guess it, win it!
        </p>
      </div>

      {/* Mode Selection or Game */}
      {mode === "select" && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
          <div className="max-w-md w-full space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground">
              Choose Your Mode
            </h2>

            <div className="grid gap-4">
              {/* Single Player */}
              <button
                onClick={() => setMode("single")}
                className="group relative overflow-hidden p-6 rounded-2xl border-2 border-purple-punch/30 bg-white/80 backdrop-blur-sm hover:border-purple-punch transition-all duration-300 hover:shadow-xl hover:shadow-purple-punch/20 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-punch/10 text-purple-punch group-hover:bg-purple-punch group-hover:text-white transition-colors">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">Solo Practice</h3>
                    <p className="text-foreground/60 mt-1">
                      Practice ranking and guessing on your own. Beat the game!
                    </p>
                  </div>
                </div>
              </button>

              {/* Multiplayer */}
              <button
                onClick={() => setMode("multiplayer")}
                className="group relative overflow-hidden p-6 rounded-2xl border-2 border-pink-pop/30 bg-white/80 backdrop-blur-sm hover:border-pink-pop transition-all duration-300 hover:shadow-xl hover:shadow-pink-pop/20 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-pink-pop/10 text-pink-pop group-hover:bg-pink-pop group-hover:text-white transition-colors">
                    <Users className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">Play with Friends</h3>
                    <p className="text-foreground/60 mt-1">
                      Create a room and invite friends. One ranks, others guess!
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold bg-pink-pop/10 text-pink-pop rounded-full">
                      2-10 players
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === "single" && (
        <>
          {/* Back button */}
          <div className="px-4 pb-2">
            <button
              onClick={() => setMode("select")}
              className="text-sm text-foreground/60 hover:text-purple-punch transition-colors"
            >
              ← Back to mode selection
            </button>
          </div>
          <GameContainer />
        </>
      )}

      {mode === "multiplayer" && (
        <JoinOrCreate onBack={() => setMode("select")} />
      )}
    </div>
  );
}
