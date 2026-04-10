"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/home";
  };

  return (
    <header className="w-full border-b border-purple-400/30 bg-[var(--secondary-purple)] shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <a href="/home" className="flex-shrink-0">
          <img
            src="/logo_nav.png"
            alt="Memify Logo"
            className="h-12 hover:opacity-80 transition-opacity"
          />
        </a>

        <div className="flex items-center gap-2">
          <a
            href="/home/memefier"
            className="rounded-lg px-4 py-2 text-m font-bold text-white transition-all hover:bg-white/10 hover:text-white active:scale-95"
          >
            Memefier
          </a>
          <a
            href="/home/mememeter"
            className="rounded-lg px-4 py-2 text-m font-bold text-white transition-all hover:bg-white/10 hover:text-white active:scale-95"
          >
            MemeMeter
          </a>
          {!loading && (
            user ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-purple-200 truncate max-w-[200px]">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-[var(--primary-orange)] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#ff9d5c] hover:scale-105 hover:shadow-lg hover:shadow-orange-500/40 active:scale-95"
                >
                  Log out
                </button>
              </div>
            ) : (
              <a
                href="/home/login"
                className="hidden rounded-md bg-[var(--primary-orange)] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#ff9d5c] hover:scale-105 hover:shadow-lg hover:shadow-orange-500/40 active:scale-95 md:block"
              >
                Log in
              </a>
            )
          )}
        </div>
      </div>
    </header>
  );
}
