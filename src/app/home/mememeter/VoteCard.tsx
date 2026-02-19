"use client";

import { useState, useTransition, useEffect } from "react";
import { submitVote } from "./actions";
import type { CaptionForVoting } from "./queries";

interface VoteCardProps {
  caption: CaptionForVoting;
  isLoggedIn: boolean;
  onVoteSuccess?: () => void;
}

export default function VoteCard({ caption, isLoggedIn, onVoteSuccess }: VoteCardProps) {
  const [isPending, startTransition] = useTransition();
  const [currentVote, setCurrentVote] = useState<number | null>(
    caption.userVote
  );
  const [error, setError] = useState<string | null>(null);

  // Reset vote state when caption changes
  useEffect(() => {
    setCurrentVote(caption.userVote);
    setError(null);
  }, [caption.id, caption.userVote]);

  const handleVote = (voteValue: 1 | -1) => {
    if (!isLoggedIn) {
      setError("Please log in to vote");
      return;
    }

    setError(null);

    // Optimistic update
    const newVote = currentVote === voteValue ? null : voteValue;
    setCurrentVote(newVote);

    startTransition(async () => {
      const result = await submitVote(caption.id, voteValue);
      if (result.error) {
        // Revert on error
        setCurrentVote(caption.userVote);
        setError(result.error);
      } else if (onVoteSuccess) {
        setTimeout(() => {
          onVoteSuccess();
        }, 300);
      }
    });
  };

  return (
    <div>
      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white text-slate-800 border-2 border-purple-500/30 shadow-2xl shadow-purple-900/40 max-w-[600px] mx-auto">
        {/* Image */}
        <div className="relative w-full bg-slate-100 flex justify-center">
          <img
            src={caption.imageUrl}
            alt="Meme"
            className="h-[360px] object-contain"
          />
        </div>

        {/* Caption */}
        <div className="p-5 bg-white border-t-2 border-gray-200">
          <p className="text-2xl md:text-3xl font-extrabold text-black leading-tight">
            {caption.content}
          </p>
        </div>
      </div>

      {/* Voting buttons - outside the card */}
      <div className="mt-6 flex items-center justify-center gap-8">
        <button
          onClick={() => handleVote(-1)}
          disabled={isPending || !isLoggedIn}
          className={`flex h-16 w-16 items-center justify-center rounded-full transition-all cursor-pointer ${currentVote === -1
              ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110"
              : "bg-white/20 text-white hover:bg-red-500 hover:scale-105"
            } ${isPending || !isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}
          title={isLoggedIn ? "Not funny" : "Log in to vote"}
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
            />
          </svg>
        </button>

        <button
          onClick={() => handleVote(1)}
          disabled={isPending || !isLoggedIn}
          className={`flex h-16 w-16 items-center justify-center rounded-full transition-all cursor-pointer ${currentVote === 1
              ? "bg-green-500 text-white shadow-lg shadow-green-500/30 scale-110"
              : "bg-white/20 text-white hover:bg-green-500 hover:scale-105"
            } ${isPending || !isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}
          title={isLoggedIn ? "This is funny!" : "Log in to vote"}
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-3 text-center text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
