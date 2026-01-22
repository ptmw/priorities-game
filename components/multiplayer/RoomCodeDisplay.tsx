"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface RoomCodeDisplayProps {
  code: string;
  size?: "small" | "large";
}

export function RoomCodeDisplay({ code, size = "large" }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/room/${code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Priorities game!",
          text: `Join my game with code: ${code}`,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (size === "small") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-punch/10 border border-purple-punch/20">
        <span className="text-sm font-medium text-foreground/60">Room:</span>
        <span className="font-mono font-bold text-purple-punch tracking-wider">
          {code}
        </span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-purple-punch/10 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-fresh" />
          ) : (
            <Copy className="w-4 h-4 text-foreground/50" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground/60 mb-2">
          Share this code with friends
        </p>
        
        <div className="inline-flex items-center gap-1">
          {code.split("").map((char, i) => (
            <div
              key={i}
              className="w-14 h-16 sm:w-16 sm:h-20 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-punch to-pink-pop text-white text-3xl sm:text-4xl font-bold shadow-lg shadow-purple-punch/30"
            >
              {char}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors text-foreground/70"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-green-fresh" />
              <span className="text-green-fresh font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span>Copy Code</span>
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-punch/10 hover:bg-purple-punch/20 transition-colors text-purple-punch"
        >
          <Share2 className="w-5 h-5" />
          <span>Share Link</span>
        </button>
      </div>
    </div>
  );
}
