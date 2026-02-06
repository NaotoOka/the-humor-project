"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { USER_IDS } from "@/lib/userIds";

type FilterType = "timeline";

interface CaptionWithImage {
  id: string;
  content: string;
  imageUrl: string;
  votedAt?: string;
  michaelVote?: number;
}

interface TasteStats {
  totalLikes: number;
  totalDislikes: number;
  mostActiveDay: string;
  topWords: { word: string; count: number }[];
}

interface DayGroup {
  date: string;
  displayDate: string;
  items: CaptionWithImage[];
}



const MICHAEL_IDS = Object.values(USER_IDS);
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Caption card component
function CaptionCard({
  caption,
  filter,
}: {
  caption: CaptionWithImage;
  filter: FilterType;
}) {
  return (
    <div className="scrapbook-card relative p-2 pb-8 bg-white" style={{ zIndex: Math.floor(Math.random() * 10) }}>
      <div className="tape"></div>
      <div className="relative overflow-hidden group">
        <img
          src={caption.imageUrl}
          alt="Subject observation"
          className="w-full h-56 object-cover filter sepia-[0.3] contrast-110 group-hover:scale-150 transition-transform duration-[2s] ease-in-out cursor-none"
        />
        <div className="absolute inset-0 bg-pink-900/10 mix-blend-multiply pointer-events-none"></div>
      </div>

      <div className="mt-4 px-2 font-handwriting">
        <p className="text-gray-800 font-serif text-sm italic border-b border-pink-100 pb-2 mb-2">
          "{caption.content}"
        </p>

        {filter === "timeline" && caption.votedAt && (
          <div className="flex justify-between items-center text-xs text-pink-400 font-mono">
            <span>{new Date(caption.votedAt).toLocaleDateString('en-US', {
              timeZone: 'America/New_York',
              dateStyle: 'medium'
            })} at {new Date(caption.votedAt).toLocaleTimeString('en-US', {
              timeZone: 'America/New_York',
              hour: 'numeric',
              minute: '2-digit'
            })}</span>
            <span>
              {caption.michaelVote === 1 ? (
                <span className="text-pink-600 animate-pulse">❤️ LOVE</span>
              ) : (
                <span className="text-red-700 font-bold line-through">REJECTED</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Day Section Component
function DaySection({
  group,
  isExpanded,
  onToggle,
  filter
}: {
  group: DayGroup;
  isExpanded: boolean;
  onToggle: () => void;
  filter: FilterType;
}) {
  const likes = group.items.filter(i => i.michaelVote === 1).length;
  const dislikes = group.items.filter(i => i.michaelVote === -1).length;

  return (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className={`w-full text-left p-4 rounded-xl border-4 transition-all flex justify-between items-center ${isExpanded
          ? "bg-white border-pink-400 shadow-lg scale-[1.02]"
          : "bg-pink-50/50 border-pink-100 hover:border-pink-200"
          }`}
      >
        <div className="flex items-center gap-4">
          <div className={`text-2xl ${isExpanded ? "rotate-360" : ""} transition-transform`}>
            {isExpanded ? "📖" : "📓"}
          </div>
          <div>
            <h3 className="font-serif font-bold text-gray-800 text-lg">{group.displayDate}</h3>
            <p className="text-xs font-mono text-pink-400 uppercase tracking-tighter">
              {group.items.length} observations documented
            </p>
          </div>
        </div>
        <div className="flex gap-4 font-mono text-xs">
          <span className="text-pink-600">❤️ {likes}</span>
          <span className="text-red-700">🚫 {dislikes}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 mt-8 animate-fade-in">
          {group.items.map((item) => (
            <div key={item.id} className="mb-8">
              <CaptionCard caption={item} filter={filter} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}





export default function MichaelRogerFanPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("timeline");
  const [stats, setStats] = useState<TasteStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [groupedCaptions, setGroupedCaptions] = useState<DayGroup[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);




  // Fetch taste analysis stats
  useEffect(() => {
    async function fetchStats() {
      setStatsLoading(true);
      try {
        // Parallel queries for efficiency
        const [likesCount, dislikesCount, likedContentQuery, allVotesQuery] = await Promise.all([
          // 1. Get exact count of likes (HEAD request, very fast)
          supabase
            .from("caption_votes")
            .select("*", { count: "exact", head: true })
            .in("profile_id", MICHAEL_IDS)
            .eq("vote_value", 1),

          // 2. Get exact count of dislikes
          supabase
            .from("caption_votes")
            .select("*", { count: "exact", head: true })
            .in("profile_id", MICHAEL_IDS)
            .eq("vote_value", -1),

          // 3. Fetch ONLY liked content for word analysis (excludes dislikes)
          supabase
            .from("caption_votes")
            .select(`
              caption:captions!caption_id (
                content
              )
            `)
            .in("profile_id", MICHAEL_IDS)
            .eq("vote_value", 1)
            .not("caption", "is", null),

          // 4. Fetch timestamps for activity analysis
          supabase
            .from("caption_votes")
            .select("created_datetime_utc")
            .in("profile_id", MICHAEL_IDS)
        ]);

        if (likesCount.error) throw likesCount.error;
        if (dislikesCount.error) throw dislikesCount.error;
        if (likedContentQuery.error) throw likedContentQuery.error;
        if (allVotesQuery.error) throw allVotesQuery.error;





        // Calculate most active day
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];

        (allVotesQuery.data || []).forEach((v) => {
          const date = new Date(v.created_datetime_utc);
          // Get day of week in NYC
          const nycDayStr = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            weekday: 'long'
          }).format(date);

          const dayIndex = DAYS.indexOf(nycDayStr);
          if (dayIndex !== -1) dayCounts[dayIndex]++;
        });

        const maxDayCount = Math.max(...dayCounts);
        const mostActiveDay = maxDayCount > 0 ? DAYS[dayCounts.indexOf(maxDayCount)] : "N/A";

        // Helper to extract top words
        const getTopWords = (data: any[]) => {
          const counts: Record<string, number> = {};
          data.forEach((v) => {
            const caption = v.caption as unknown as { content: string } | null;
            if (caption?.content) {
              const words = caption.content.toLowerCase().split(/\s+/);
              words.forEach((word) => {
                const clean = word.replace(/[^a-z]/g, "");
                if (clean.length > 3 && !['this', 'that', 'with', 'from', 'have', 'what'].includes(clean)) {
                  counts[clean] = (counts[clean] || 0) + 1;
                }
              });
            }
          });
          return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15) // Get top 15
            .map(([word, count]) => ({ word, count }));
        };

        const topWords = getTopWords(likedContentQuery.data || []);
        setStats({
          totalLikes: likesCount.count || 0,
          totalDislikes: dislikesCount.count || 0,
          mostActiveDay,
          topWords: topWords.slice(0, 5), // Keep top 5 for the small card
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err instanceof Error ? err.message : JSON.stringify(err));
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Fetch data based on filter
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (filter === "timeline") {
        // Activity timeline - recent votes with timestamps
        const { data, error } = await supabase
          .from("caption_votes")
          .select(`
            vote_value,
            created_datetime_utc,
            caption:captions!caption_id (
              id,
              content,
              image:images!image_id (
                url
              )
            )
          `)
          .in("profile_id", MICHAEL_IDS)
          .order("created_datetime_utc", { ascending: false })
          .limit(200); // Fetch more for grouping

        if (error) throw error;

        const seen = new Set<string>();
        const items = (data || [])
          .map((vote): CaptionWithImage | null => {
            const caption = vote.caption as unknown as {
              id: string;
              content: string;
              image: { url: string } | null;
            } | null;
            if (!caption || seen.has(caption.id)) return null;
            seen.add(caption.id);
            return {
              id: caption.id,
              content: caption.content || "",
              imageUrl: caption.image?.url || "",
              votedAt: vote.created_datetime_utc,
              michaelVote: vote.vote_value,
            };
          })
          .filter((c): c is CaptionWithImage => c !== null && c.imageUrl !== "");

        // Group by day - Using NYC timezone
        const groups: Record<string, CaptionWithImage[]> = {};
        items.forEach(item => {
          if (!item.votedAt) return;
          const date = new Date(item.votedAt);
          // Get YYYY-MM-DD in NYC timezone
          const dateStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).format(date);

          if (!groups[dateStr]) groups[dateStr] = [];
          groups[dateStr].push(item);
        });

        const sortedGroups: DayGroup[] = Object.entries(groups)
          .map(([dateStr, items]) => {
            // Parse the date components to avoid UTC offset issues when creating a new Date
            const [year, month, day] = dateStr.split('-').map(Number);
            const displayDate = new Date(year, month - 1, day).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return {
              date: dateStr,
              displayDate,
              items
            };
          })
          .sort((a, b) => b.date.localeCompare(a.date));

        setGroupedCaptions(sortedGroups);
        if (sortedGroups.length > 0 && !expandedDay) {
          setExpandedDay(sortedGroups[0].date);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen pattern-bg p-6 overflow-x-hidden relative">

      {/* Safety Report Button */}
      <a
        href="https://www.health.columbia.edu/content/stalking"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-4 left-4 z-[100] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg border-2 border-white transition-all hover:scale-105 active:scale-95 text-xs uppercase tracking-widest"
      >
        🚨 Report Page!
      </a>

      {/* Obsessive Header */}
      <header className="relative py-12 text-center mb-16">
        <h1 className="text-5xl md:text-7xl blood-text mb-4 animate-scale">
          Michael Roger Fan Page <span className="animate-heartbeat inline-block">💖</span>
        </h1>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-32 border-4 border-pink-300 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none"></div>
        <p className="text-pink-600 font-serif italic text-xl animate-bounce">
          We're always watching you... always...
        </p>

      </header>

      {/* Love Shrine (Stats) */}
      {!statsLoading && stats && (
        <section className="max-w-4xl mx-auto mb-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

          {/* Love Meter */}
          <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-pink-200 transform -rotate-1">
            <h2 className="text-2xl font-bold text-pink-500 mb-4 text-center">💖 Love Collection</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-pink-400 mb-1">
                  <span>Likes</span>
                  <span>{stats.totalLikes}</span>
                </div>
                <div className="h-4 bg-pink-100 rounded-full overflow-hidden border border-pink-200">
                  <div
                    className="h-full bg-pink-500 animate-pulse"
                    style={{ width: `${Math.min(100, (stats.totalLikes / (stats.totalLikes + stats.totalDislikes)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-red-400 mb-1">
                  <span>Hates</span>
                  <span>{stats.totalDislikes}</span>
                </div>
                <div className="h-4 bg-red-50 rounded-full overflow-hidden border border-red-200">
                  <div
                    className="h-full bg-red-400"
                    style={{ width: `${Math.min(100, (stats.totalDislikes / (stats.totalLikes + stats.totalDislikes)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Obsession Notes */}
          <div className="bg-yellow-50 p-6 rounded-sm shadow-md border border-yellow-200 transform rotate-2 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-pink-200/50 -rotate-2"></div>
            <h3 className="font-handwriting text-xl text-gray-600 mb-4 underline decoration-wavy decoration-pink-300">
              Observations
            </h3>
            <ul className="space-y-2 font-handwriting text-gray-700">
              <li>• He is most active on <strong className="text-pink-600">{stats.mostActiveDay}s</strong>... I'll remember that.</li>
              <li>• He seems to like words like:</li>
              <li className="flex flex-wrap gap-2 mt-2">
                {stats.topWords.map((w) => (
                  <span key={w.word} className="bg-white border border-pink-200 px-2 py-1 rounded text-xs text-pink-500 transform hover:scale-110 transition-transform cursor-help">
                    {w.word}
                  </span>
                ))}
              </li>
              <li className="text-xs text-gray-400 mt-4 text-right">Updated: just now</li>
            </ul>
          </div>
        </section>
      )}



      {/* Case File Tab / Header Replacement */}
      <div className="max-w-6xl mx-auto mb-12 flex justify-start items-end px-4">
        <div className="relative group">
          {/* The Tab */}
          <div className="bg-pink-600 text-white font-serif px-8 py-3 rounded-t-2xl shadow-lg border-x-2 border-t-2 border-pink-400 transform -rotate-1 origin-bottom-left hover:rotate-0 transition-transform cursor-default z-20 relative">
            <span className="tracking-widest uppercase text-sm font-bold flex items-center gap-2">
              <span className="text-xl">📔</span> Michael's Logbook
            </span>
          </div>
          {/* Subtle paper backing effect */}
          <div className="absolute top-[2px] left-[2px] w-full h-full bg-pink-800/20 rounded-t-2xl -z-10 transform translate-x-1 translate-y-1"></div>
        </div>
        <div className="flex-grow border-b-2 border-pink-300 ml-[-5px] mb-[1px] opacity-40"></div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto min-h-[400px]">
        {/* VIEW 1: Timeline (Existing) */}
        {filter === "timeline" && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-6xl animate-bounce mb-4">👀</div>
                <div className="text-pink-400 animate-pulse tracking-widest uppercase">Locating Subject...</div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 bg-red-50 p-8 rounded-xl border border-red-200">
                <h3 className="text-xl font-bold mb-2">SIGNAL LOST</h3>
                <p>{error}</p>
              </div>
            ) : groupedCaptions.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-2xl text-pink-300 font-serif italic">He is hiding from me...</p>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto">
                {groupedCaptions.map((group) => (
                  <DaySection
                    key={group.date}
                    group={group}
                    isExpanded={expandedDay === group.date}
                    onToggle={() => setExpandedDay(expandedDay === group.date ? null : group.date)}
                    filter={filter}
                  />
                ))}
              </div>
            )}
          </>
        )}



      </main>

      <footer className="mt-24 text-center pb-12">
        <p className="text-pink-200/50 text-xs font-mono">
          SYSTEM_ID: YANDERE_V1.0 // DO NOT DISCONNECT
        </p>
      </footer>
    </div>
  );
}
