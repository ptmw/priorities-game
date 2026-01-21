"use client";

import { GameContainer } from "@/components/GameContainer";

export default function Home() {
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

      {/* Game Container */}
      <GameContainer />
    </div>
  );
}
