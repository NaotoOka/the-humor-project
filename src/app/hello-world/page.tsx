"use client";

import { useState, useEffect } from "react";

export default function HelloWorld() {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const [hue, setHue] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [time, setTime] = useState(0);
  const [trail, setTrail] = useState<{ x: number; y: number; hue: number }[]>([]);
  const [exploding, setExploding] = useState(false);
  const [particles, setParticles] = useState<{ x: number; y: number; vx: number; vy: number; hue: number }[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        let newX = prev.x + direction.x * 0.8;
        let newY = prev.y + direction.y * 0.8;
        let newDirX = direction.x;
        let newDirY = direction.y;
        let bounced = false;

        if (newX <= 10 || newX >= 90) {
          newDirX = -direction.x;
          newX = prev.x + newDirX * 0.8;
          bounced = true;
        }
        if (newY <= 10 || newY >= 90) {
          newDirY = -direction.y;
          newY = prev.y + newDirY * 0.8;
          bounced = true;
        }

        if (bounced) {
          setDirection({ x: newDirX, y: newDirY });
          setExploding(true);
          setParticles(
            Array.from({ length: 20 }, () => ({
              x: newX,
              y: newY,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              hue: Math.random() * 360,
            }))
          );
          setTimeout(() => setExploding(false), 300);
        }

        return { x: newX, y: newY };
      });

      setHue((prev) => (prev + 3) % 360);
      setRotation((prev) => (prev + 5) % 360);
      setTime((prev) => {
        setScale(1 + Math.sin(prev / 10) * 0.3);
        return prev + 1;
      });

      setTrail((prev) => {
        const newTrail = [...prev, { x: position.x, y: position.y, hue }];
        return newTrail.slice(-20);
      });

      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.1 }))
          .filter((p) => p.y < 100)
      );
    }, 20);

    return () => clearInterval(interval);
  }, [direction, position.x, position.y, hue, time]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Crazy background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at ${position.x}% ${position.y}%, hsl(${hue}, 100%, 50%) 0%, transparent 50%),
            radial-gradient(circle at ${100 - position.x}% ${100 - position.y}%, hsl(${(hue + 180) % 360}, 100%, 50%) 0%, transparent 50%)
          `,
        }}
      />

      {/* Trail */}
      {trail.map((t, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            width: `${i * 3}px`,
            height: `${i * 3}px`,
            transform: "translate(-50%, -50%)",
            background: `hsl(${t.hue}, 100%, 60%)`,
            opacity: i / trail.length,
            boxShadow: `0 0 ${i}px hsl(${t.hue}, 100%, 50%)`,
          }}
        />
      ))}

      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute h-3 w-3 rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `hsl(${p.hue}, 100%, 60%)`,
            boxShadow: `0 0 10px hsl(${p.hue}, 100%, 50%)`,
          }}
        />
      ))}

      {/* Main text */}
      <h1
        className="absolute text-5xl font-black md:text-8xl"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
          color: `hsl(${hue}, 100%, 60%)`,
          textShadow: `
            0 0 20px hsl(${hue}, 100%, 50%),
            0 0 40px hsl(${hue}, 100%, 40%),
            0 0 80px hsl(${hue}, 100%, 30%),
            0 0 120px hsl(${(hue + 60) % 360}, 100%, 50%)
          `,
          filter: exploding ? "blur(4px)" : "none",
          transition: "filter 0.1s",
        }}
      >
        {"Hello World!".split("").map((char, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: mounted ? `translateY(${Math.sin(time / 5 + i) * 10}px)` : "translateY(0)",
              color: mounted ? `hsl(${(hue + i * 30) % 360}, 100%, 60%)` : `hsl(0, 100%, 60%)`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>

      {/* Random floating emojis */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-4xl"
          style={{
            left: `${(position.x + i * 37) % 100}%`,
            top: `${(position.y + i * 23) % 100}%`,
            transform: `rotate(${rotation + i * 36}deg)`,
            opacity: 0.7,
          }}
        >
          {["🚀", "⭐", "🔥", "💥", "✨", "🌈", "💫", "🎉", "🎸", "👾"][i]}
        </div>
      ))}
    </div>
  );
}
