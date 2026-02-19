"use client";

import { useEffect, useState } from "react";
import MemeCard from "./MemeCard";
import { Meme } from "./meme-queries";

interface MemeFeedProps {
  memes: Meme[];
  isLoggedIn?: boolean;
}

export default function MemeFeed({ memes, isLoggedIn = false }: MemeFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (memes.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % memes.length);
    }, 4000); // Change meme every 4 seconds

    return () => clearInterval(interval);
  }, [memes.length]);

  // If no memes, show empty state
  if (memes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-purple-200 text-lg">No memes found yet!</p>
        <p className="text-purple-300 text-sm mt-2">
          Be the first to upload one.
        </p>
      </div>
    );
  }

  // Helper to get index with wrapping
  const getIndex = (offset: number) => {
    const rawIndex = currentIndex + offset;
    return (rawIndex + memes.length) % memes.length;
  };

  return (
    <div className="flex flex-col items-center justify-center overflow-hidden py-10">
      {/* Carousel Container */}
      <div className="relative w-full max-w-4xl h-[450px] flex items-center justify-center">
        {[-1, 0, 1].map((offset) => {
          const index = getIndex(offset);
          const meme = memes[index];
          const isActive = offset === 0;

          // Calculate styles based on position
          let xOffset = "0%";
          let scale = 1;
          let opacity = 1;
          let zIndex = 10;
          let rotate = "0deg";

          if (offset === -1) {
            xOffset = "-60%";
            scale = 0.85;
            opacity = 0.6;
            zIndex = 5;
            rotate = "-5deg";
          } else if (offset === 1) {
            xOffset = "60%";
            scale = 0.85;
            opacity = 0.6;
            zIndex = 5;
            rotate = "5deg";
          } else {
            scale = 1.05;
            zIndex = 20;
          }

          return (
            <div
              key={`${meme.id}-${offset}`}
              className="absolute transition-all duration-700 ease-in-out will-change-transform"
              style={{
                transform: `translateX(${xOffset}) scale(${scale}) rotate(${rotate})`,
                opacity,
                zIndex,
                width: "350px", // Fixed width for consistent layout
              }}
              onClick={() => {
                // Allow clicking side cards to navigate
                if (offset !== 0) setCurrentIndex(index);
              }}
            >
              <MemeCard meme={meme} isLoggedIn={isLoggedIn} />
            </div>
          );
        })}
      </div>

      {/* Progress Indicators */}
      <div className="mt-8 flex gap-2">
        {memes.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${idx === currentIndex
                ? "bg-[var(--primary-orange)] w-6"
                : "bg-purple-300/30"
              }`}
          />
        ))}
      </div>
    </div>
  );
}
