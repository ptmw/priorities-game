"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMultiplayerStore } from "@/lib/multiplayer-state";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

interface CreateRoomProps {
  onBack: () => void;
}

export function CreateRoom({ onBack }: CreateRoomProps) {
  const router = useRouter();
  const { createRoom, connectionStatus } = useMultiplayerStore();
  
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const name = displayName.trim();
    if (!name) {
      setError("Please enter your name");
      return;
    }
    
    if (name.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    setError(null);
    setIsCreating(true);

    const result = await createRoom(name);

    if (result.success) {
      // Navigate to the room
      const roomCode = useMultiplayerStore.getState().roomCode;
      if (roomCode) {
        router.push(`/room/${roomCode}`);
      }
    } else {
      setError(result.error || "Failed to create room");
      setIsCreating(false);
    }
  };

  const isLoading = isCreating || connectionStatus === "connecting";

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Back button */}
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm text-foreground/60 hover:text-purple-punch transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-fresh to-blue-bright text-white mb-2">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Create a Room
          </h2>
          <p className="text-foreground/60">
            Enter your name to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-foreground/70 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={20}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border-2 border-foreground/20 bg-white focus:border-green-fresh focus:ring-2 focus:ring-green-fresh/20 outline-none transition-all text-lg disabled:opacity-50"
              autoFocus
            />
            <p className="mt-1 text-xs text-foreground/50">
              {displayName.length}/20 characters
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !displayName.trim()}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-green-fresh to-blue-bright text-white font-bold text-lg shadow-lg shadow-green-fresh/30 hover:shadow-xl hover:shadow-green-fresh/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Room...
              </>
            ) : (
              "Create Room"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/50">
          You&apos;ll get a room code to share with friends
        </p>
      </div>
    </div>
  );
}
