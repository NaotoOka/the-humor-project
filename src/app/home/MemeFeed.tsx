"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

      {/* Action Buttons */}
      <div className="mt-12 flex flex-col md:flex-row gap-8 w-full max-w-2xl px-4">
        <Link
          href="/home/memefier"
          className="group flex-1 flex flex-col items-center justify-center bg-[var(--primary-orange)] p-8 rounded-3xl shadow-[0_20px_50px_rgba(255,140,66,0.3)] hover:shadow-[0_20px_60px_rgba(255,140,66,0.4)] transition-all duration-300 hover:-translate-y-2 border-2 border-white/10"
        >
          <span className="text-2xl font-black text-white mb-2 tracking-tight">Memefier</span>
          <p className="text-orange-100 text-sm text-center font-medium opacity-90 leading-tight">
            Turn your photos into AI-powered memes
          </p>
        </Link>

        <Link
          href="/home/mememeter"
          className="group flex-1 flex flex-col items-center justify-center bg-white p-8 rounded-3xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-2 border-2 border-transparent"
        >
          <span className="text-2xl font-black text-[var(--secondary-purple)] mb-2 tracking-tight">MemeMeter</span>
          <p className="text-purple-600/70 text-sm text-center font-bold leading-tight">
            Judge the AI humor 
          </p>
        </Link>
      </div>
    </div>
  );
}
