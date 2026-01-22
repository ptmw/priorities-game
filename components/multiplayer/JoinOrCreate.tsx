"use client";

import { useState } from "react";
import { CreateRoom } from "./CreateRoom";
import { JoinRoom } from "./JoinRoom";
import { Plus, LogIn, ArrowLeft } from "lucide-react";

interface JoinOrCreateProps {
  onBack: () => void;
}

type View = "select" | "create" | "join";

export function JoinOrCreate({ onBack }: JoinOrCreateProps) {
  const [view, setView] = useState<View>("select");

  if (view === "create") {
    return <CreateRoom onBack={() => setView("select")} />;
  }

  if (view === "join") {
    return <JoinRoom onBack={() => setView("select")} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-foreground/60 hover:text-purple-punch transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to mode selection
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Play with Friends
          </h2>
          <p className="text-foreground/60">
            Create a room or join an existing one
          </p>
        </div>

        <div className="grid gap-4">
          {/* Create Room */}
          <button
            onClick={() => setView("create")}
            className="group relative overflow-hidden p-6 rounded-2xl border-2 border-green-fresh/30 bg-white/80 backdrop-blur-sm hover:border-green-fresh transition-all duration-300 hover:shadow-xl hover:shadow-green-fresh/20 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-fresh/10 text-green-fresh group-hover:bg-green-fresh group-hover:text-white transition-colors">
                <Plus className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">Create Room</h3>
                <p className="text-foreground/60 mt-1">
                  Start a new game and invite friends
                </p>
              </div>
            </div>
          </button>

          {/* Join Room */}
          <button
            onClick={() => setView("join")}
            className="group relative overflow-hidden p-6 rounded-2xl border-2 border-blue-bright/30 bg-white/80 backdrop-blur-sm hover:border-blue-bright transition-all duration-300 hover:shadow-xl hover:shadow-blue-bright/20 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-bright/10 text-blue-bright group-hover:bg-blue-bright group-hover:text-white transition-colors">
                <LogIn className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">Join Room</h3>
                <p className="text-foreground/60 mt-1">
                  Enter a room code to join friends
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
