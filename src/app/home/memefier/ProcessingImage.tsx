"use client";

import Image from "next/image";

interface ProcessingImageProps {
  status: string;
  previewImage?: string | null;
  onCancel?: () => void;
}

export default function ProcessingImage({
  status,
  previewImage,
  onCancel,
}: ProcessingImageProps) {
  return (
    <div className="relative bg-white/5 rounded-2xl p-8 border border-purple-500/20">
      {/* Cancel button - top right */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-purple-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          title="Cancel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex flex-col items-center gap-4">
        {/* Blurred rectangular image with processing overlay */}
        <div className="relative w-full max-w-sm aspect-[4/3]">
          {/* Blurred preview image */}
          {previewImage && (
            <img
              src={previewImage}
              alt="Your image"
              className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-80 blur-[2px]"
            />
          )}
          {/* Dark overlay on image */}
          <div className="absolute inset-0 bg-[var(--secondary-purple)]/40 rounded-xl" />

          {/* Processing animation overlay - centered on image */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="relative">
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--primary-orange)] to-purple-500 blur-xl opacity-40 animate-pulse" />

              {/* Spinning ring */}
              <div className="relative w-36 h-36">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/30" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--primary-orange)] border-r-[var(--primary-orange)] animate-spin" />

                {/* Logo in center */}
                <div className="absolute inset-2 rounded-full flex items-center justify-center overflow-hidden">
                  <Image
                    src="/logo_nav.png"
                    alt="Processing"
                    width={80}
                    height={80}
                    className="animate-bounce-slow"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className="text-center space-y-2">
          <p className="text-lg font-bold text-[var(--primary-orange)]">
            {status}
          </p>
          <div className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
