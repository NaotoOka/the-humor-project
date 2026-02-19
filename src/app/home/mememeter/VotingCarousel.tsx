"use client";

import { useState, useEffect } from "react";
import VoteCard from "./VoteCard";
import type { CaptionForVoting } from "./queries";

interface VotingCarouselProps {
  captions: CaptionForVoting[];
  isLoggedIn: boolean;
}

export default function VotingCarousel({
  captions,
  isLoggedIn,
}: VotingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track if user has already gone back (can only go back once per forward movement)
  const [canGoBack, setCanGoBack] = useState(false);

  // Preload next image for fast display
  useEffect(() => {
    if (currentIndex < captions.length - 1) {
      const nextCaption = captions[currentIndex + 1];
      if (nextCaption?.imageUrl) {
        const img = new Image();
        img.src = nextCaption.imageUrl;
      }
    }
  }, [currentIndex, captions]);

  if (captions.length === 0) {
    return (
      <div className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm">
        <p className="text-purple-200">No captions available for voting yet.</p>
      </div>
    );
  }

  const caption = captions[currentIndex];

  const goToNext = () => {
    if (currentIndex < captions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCanGoBack(true); // Allow going back after moving forward
    }
  };

  const goToPrevious = () => {
    if (canGoBack && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCanGoBack(false); // Can't go back again until moving forward
    }
  };

  return (
    <div className="mx-auto flex items-start justify-center gap-4">
      {/* Previous button */}
      <button
        onClick={goToPrevious}
        disabled={!canGoBack || currentIndex === 0}
        className={`mt-40 flex items-center justify-center rounded-full p-3 transition-all ${!canGoBack || currentIndex === 0
            ? "text-purple-400 cursor-not-allowed"
            : "text-white hover:bg-white/10"
          }`}
        title="Previous"
      >
        <svg
          className="h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Main content */}
      <div className="w-full">
        <VoteCard
          key={caption.id}
          caption={caption}
          isLoggedIn={isLoggedIn}
          onVoteSuccess={goToNext}
        />

        {/* Counter */}
        <div className="mt-3 text-center">
          <span className="text-sm text-purple-200">
            {currentIndex + 1} / {captions.length}
          </span>
        </div>

        {/* Completion message */}
        {currentIndex === captions.length - 1 && (
          <div className="mt-4 rounded-xl bg-green-500/20 p-3 text-center backdrop-blur-sm border border-green-500/30">
            <p className="text-green-200 text-sm">
              You&apos;ve reached the last caption. Thanks for voting!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
