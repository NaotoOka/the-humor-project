"use client";

import Image from "next/image";
import Link from "next/link";

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
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 overflow-hidden relative">
      {/* Twinkling stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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



      {/* Main text with glow effect */}
      <h1 className="text-[3.4375rem] md:text-[4.8125rem] font-bold text-white mb-6 text-center z-10 drop-shadow-lg">
        <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent animate-gradient">
          The Humor Project
        </span>
      </h1>



      {/* Links to existing works */}
      <div className="mt-4 z-10 text-center flex flex-col items-center">
        {/* Logo link to home */}
        <Link
          href="/home"
          className="relative z-20 mb-12 group cursor-pointer inline-block"
        >
          <div className="relative animate-float">
            <Image
              src="/logo.png"
              alt="Enter Site"
              width={385}
              height={385}
              className="drop-shadow-logo transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-logo-hover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-white/30 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-xl" />
          </div>
          <p className="text-center mt-6 text-indigo-300 text-2xl font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 uppercase tracking-widest drop-shadow-lg">
            Click to Enter
          </p>
        </Link>

        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <Link
            href="https://humor-ai-umber.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-9 py-3.5 bg-[#eb9854] text-white text-lg font-bold rounded-full hover:bg-[#d9cdc0] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(232,223,212,0.6)] backdrop-blur-sm shadow-lg"
          >
            Humor Flavors
          </Link>
          <Link
            href="https://humor-project-admin-three.vercel.app/login"
            target="_blank"
            rel="noopener noreferrer"
            className="px-9 py-3.5 bg-[#7f49d6] text-white text-lg font-bold rounded-full hover:bg-[#6a3bb8] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(127,73,214,0.6)] backdrop-blur-sm shadow-lg"
          >
            Admin Portal
          </Link>
        </div>
      </div>

      <style jsx>{`

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
        .drop-shadow-logo {
          filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.4)) drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3));
        }
        .drop-shadow-logo-hover {
          filter: drop-shadow(0 0 30px rgba(99, 102, 241, 0.7)) drop-shadow(0 0 60px rgba(168, 85, 247, 0.5)) drop-shadow(0 8px 30px rgba(0, 0, 0, 0.4));
        }
      `}</style>
    </div>
  );
}
