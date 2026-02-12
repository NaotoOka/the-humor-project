"use client";

import { useState, useEffect } from "react";

// Generate stars once at module level with fixed seed-like values
const generateStars = () =>
  [...Array(50)].map((_, i) => ({
    id: i,
    width: ((i * 7) % 30) / 10 + 1,
    height: ((i * 11) % 30) / 10 + 1,
    top: ((i * 37) % 100),
    left: ((i * 53) % 100),
    delay: ((i * 13) % 30) / 10,
    duration: ((i * 17) % 20) / 10 + 1,
  }));

const stars = generateStars();

export default function Home() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 overflow-hidden relative">
      {/* Twinkling stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: `${star.width}px`,
              height: `${star.height}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Rocket 1 - Main rocket */}
      <div className="absolute left-[15%] bottom-0 animate-rocket">
        <div className="relative">
          <div className="text-7xl transform -rotate-45">🚀</div>
          <div className="absolute -bottom-2 -left-2 animate-flame">
            <div className="text-4xl blur-[1px]">🔥</div>
          </div>
          <div className="absolute -bottom-6 -left-4 animate-flame-delayed">
            <div className="text-3xl blur-[2px] opacity-80">🔥</div>
          </div>
        </div>
      </div>

      {/* Smoke particles for rocket 1 */}
      <div className="absolute left-[15%] bottom-0 animate-smoke-1">
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl opacity-50 blur-[1px]">💨</div>
          <div className="text-2xl opacity-30 blur-[2px]">💨</div>
          <div className="text-xl opacity-20 blur-[3px]">💨</div>
        </div>
      </div>

      {/* Rocket 2 - Secondary rocket (delayed) */}
      <div className="absolute right-[20%] bottom-0 animate-rocket-2">
        <div className="relative">
          <div className="text-5xl transform -rotate-45">🚀</div>
          <div className="absolute -bottom-1 -left-1 animate-flame">
            <div className="text-2xl blur-[1px]">🔥</div>
          </div>
        </div>
      </div>

      {/* Smoke for rocket 2 */}
      <div className="absolute right-[20%] bottom-0 animate-smoke-2">
        <div className="flex flex-col items-center gap-1">
          <div className="text-2xl opacity-40 blur-[1px]">💨</div>
          <div className="text-xl opacity-20 blur-[2px]">💨</div>
        </div>
      </div>

      {/* Rocket 3 - Small background rocket */}
      <div className="absolute left-[60%] bottom-0 animate-rocket-3 opacity-40">
        <div className="relative">
          <div className="text-3xl transform -rotate-45">🚀</div>
          <div className="absolute -bottom-1 -left-1 animate-flame">
            <div className="text-xl blur-[2px]">🔥</div>
          </div>
        </div>
      </div>

      {/* Animated construction icon */}
      <div className="relative mb-8 z-10">
        <div className="text-8xl animate-bounce drop-shadow-glow">🚧</div>
        <div className="absolute -top-2 -right-2 text-4xl animate-spin-slow">
          ⚙️
        </div>
        <div className="absolute -top-2 -left-2 text-3xl animate-spin-reverse">
          🔧
        </div>
      </div>

      {/* Main text with glow effect */}
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-center z-10 drop-shadow-lg">
        <span className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-500 bg-clip-text text-transparent animate-gradient">
          Page Under Construction
        </span>
      </h1>

      {/* Animated subtitle */}
      <p className="text-xl md:text-2xl text-indigo-200 mb-8 z-10">
        We&apos;re building something amazing{dots}
      </p>

      {/* Animated progress bar with glow */}
      <div className="w-64 md:w-96 h-4 bg-slate-800/50 rounded-full overflow-hidden z-10 border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
        <div className="h-full bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 rounded-full animate-progress shadow-lg shadow-orange-500/50" />
      </div>

      {/* Progress percentage */}
      <p className="text-indigo-300 mt-3 text-sm z-10 animate-pulse">
        Launching soon...
      </p>

      {/* Links to existing works */}
      <div className="mt-10 z-10 text-center">
        <p className="text-indigo-200 mb-6 text-xl md:text-2xl">
          In the meantime, enjoy the latest works:
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/hello-world"
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-400 hover:to-purple-400 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
          >
            Hello World
          </a>
          <a
            href="/fan-page"
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-400 hover:to-purple-400 transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
          >
            Fan Page
          </a>
        </div>
      </div>

      {/* Construction tape stripes */}
      <div className="fixed top-0 left-0 w-full h-5 bg-repeating-stripe animate-slide shadow-md" />
      <div className="fixed bottom-0 left-0 w-full h-5 bg-repeating-stripe animate-slide-reverse shadow-md" />

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 5%;
          }
          50% {
            width: 75%;
          }
          100% {
            width: 5%;
          }
        }
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .animate-spin-reverse {
          animation: spin-reverse 4s linear infinite;
        }
        .bg-repeating-stripe {
          background: repeating-linear-gradient(
            45deg,
            #fbbf24,
            #fbbf24 10px,
            #0f172a 10px,
            #0f172a 20px
          );
        }
        @keyframes slide {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 40px 0;
          }
        }
        .animate-slide {
          animation: slide 0.8s linear infinite;
        }
        .animate-slide-reverse {
          animation: slide 0.8s linear infinite reverse;
        }
        @keyframes rocket {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translate(30vw, -120vh);
            opacity: 0;
          }
        }
        .animate-rocket {
          animation: rocket 5s ease-in infinite;
        }
        @keyframes rocket-2 {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translate(-20vw, -110vh);
            opacity: 0;
          }
        }
        .animate-rocket-2 {
          animation: rocket-2 6s ease-in infinite;
          animation-delay: 2s;
        }
        @keyframes rocket-3 {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% {
            opacity: 0.4;
          }
          70% {
            opacity: 0.4;
          }
          100% {
            transform: translate(10vw, -130vh);
            opacity: 0;
          }
        }
        .animate-rocket-3 {
          animation: rocket-3 8s ease-in infinite;
          animation-delay: 4s;
        }
        @keyframes flame {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.8;
          }
        }
        .animate-flame {
          animation: flame 0.15s ease-in-out infinite;
        }
        .animate-flame-delayed {
          animation: flame 0.2s ease-in-out infinite;
          animation-delay: 0.1s;
        }
        @keyframes smoke-1 {
          0% {
            opacity: 0.5;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-20px, -40vh) scale(2);
          }
        }
        .animate-smoke-1 {
          animation: smoke-1 5s ease-out infinite;
        }
        @keyframes smoke-2 {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(1);
          }
          10% {
            opacity: 0.4;
          }
          100% {
            opacity: 0;
            transform: translate(10px, -35vh) scale(1.5);
          }
        }
        .animate-smoke-2 {
          animation: smoke-2 6s ease-out infinite;
          animation-delay: 2s;
        }
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        @keyframes gradient {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.5));
        }
      `}</style>
    </div>
  );
}
