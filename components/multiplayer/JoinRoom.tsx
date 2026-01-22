"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMultiplayerStore } from "@/lib/multiplayer-state";
import { ArrowLeft, Loader2, Users } from "lucide-react";

interface JoinRoomProps {
  onBack?: () => void;
  prefillCode?: string;
}

export function JoinRoom({ onBack, prefillCode }: JoinRoomProps) {
  const router = useRouter();
  const { joinRoom, connectionStatus } = useMultiplayerStore();
  
  const [code, setCode] = useState(prefillCode || "");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split code into 4 characters for display
  const codeChars = code.padEnd(4, " ").split("").slice(0, 4);

  // Focus first empty input on mount
  useEffect(() => {
    if (!prefillCode) {
      codeInputRefs.current[0]?.focus();
    }
  }, [prefillCode]);

  const handleCodeChange = (index: number, value: string) => {
    const char = value.toUpperCase().replace(/[^A-Z]/g, "");
    
    if (char) {
      const newCode = code.split("");
      newCode[index] = char;
      setCode(newCode.join("").slice(0, 4));
      
      // Move to next input
      if (index < 3) {
        codeInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (codeChars[index] !== " ") {
        // Clear current character
        const newCode = code.split("");
        newCode[index] = "";
        setCode(newCode.join(""));
      } else if (index > 0) {
        // Move to previous input
        codeInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
    setCode(pasted);
    
    // Focus last filled input or after last character
    const focusIndex = Math.min(pasted.length, 3);
    codeInputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = displayName.trim();
    
    if (trimmedCode.length !== 4) {
      setError("Please enter a 4-letter room code");
      return;
    }
    
    if (!trimmedName) {
      setError("Please enter your name");
      return;
    }
    
    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    setError(null);
    setIsJoining(true);

    const result = await joinRoom(trimmedCode, trimmedName);

    if (result.success) {
      // Navigate to the room
      router.push(`/room/${trimmedCode}`);
    } else {
      setError(result.error || "Failed to join room");
      setIsJoining(false);
    }
  };

  const isLoading = isJoining || connectionStatus === "connecting";

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm text-foreground/60 hover:text-purple-punch transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-bright to-purple-punch text-white mb-2">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Join a Room
          </h2>
          <p className="text-foreground/60">
            Enter the room code and your name
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Code Input */}
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-2">
              Room Code
            </label>
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => { codeInputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={codeChars[index] === " " ? "" : codeChars[index]}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  className="w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 border-foreground/20 bg-white focus:border-blue-bright focus:ring-2 focus:ring-blue-bright/20 outline-none transition-all uppercase disabled:opacity-50"
                />
              ))}
            </div>
          </div>

          {/* Display Name Input */}
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
              className="w-full px-4 py-3 rounded-xl border-2 border-foreground/20 bg-white focus:border-blue-bright focus:ring-2 focus:ring-blue-bright/20 outline-none transition-all text-lg disabled:opacity-50"
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
            disabled={isLoading || code.length !== 4 || !displayName.trim()}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-bright to-purple-punch text-white font-bold text-lg shadow-lg shadow-blue-bright/30 hover:shadow-xl hover:shadow-blue-bright/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Room"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
