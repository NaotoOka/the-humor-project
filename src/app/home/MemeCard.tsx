"use client";

import { useState } from "react";
import { Meme } from "./meme-queries";

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

interface MemeCardProps {
  meme: Meme;
  isLoggedIn?: boolean;
}

export default function MemeCard({ meme, isLoggedIn = false }: MemeCardProps) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 2000);
      return;
    }
    // TODO: Implement actual like functionality
  };
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white text-slate-800 border border-purple-500/20 shadow-xl shadow-purple-900/20 cursor-pointer">
      {/* Image Header with user info overlay */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {meme.image ? (
          <img
            src={meme.image}
            alt={meme.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-orange-100">
            <span className="text-4xl">🎭</span>
          </div>
        )}
        <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm border border-white/10">
          {formatTimeAgo(meme.createdAt)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-4 text-xl font-bold text-slate-900 leading-tight">
          {meme.title}
        </h3>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 relative">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors group/like ${isLoggedIn
                  ? "text-slate-500 hover:text-[var(--primary-orange)]"
                  : "text-slate-400 cursor-pointer"
                }`}
              title={isLoggedIn ? "Like this meme" : "Log in to like"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isLoggedIn ? "group-hover/like:fill-[var(--primary-orange)] group-hover/like:stroke-[var(--primary-orange)] transition-colors" : ""}
              >
                <path d="M7 10v12" />
                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
              </svg>
              {meme.score}
            </button>
          </div>

          {/* Login prompt tooltip */}
          {showLoginPrompt && (
            <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
              <a href="/home/login" className="text-[var(--primary-orange)] hover:underline">
                Log in
              </a>{" "}
              to like memes
              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800" />
            </div>
          )}

          <button className="rounded-full p-2 text-slate-400 hover:bg-[var(--secondary-purple)] hover:text-white transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" x2="12" y1="2" y2="15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
