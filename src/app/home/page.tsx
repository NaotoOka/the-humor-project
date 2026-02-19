import MemeFeed from "./MemeFeed";
import { getTopRatedCaptions } from "./meme-queries";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const [memes, { data: { user } }] = await Promise.all([
    getTopRatedCaptions(),
    supabase.auth.getUser(),
  ]);
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-[var(--secondary-purple)] font-sans text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center text-white">
          <img
            src="/logo.png"
            alt="The Humor Project Logo"
            className="h-32 mx-auto mb-6"
          />
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl drop-shadow-lg">
            Your Daily Dose of{" "}
            <span className="text-[var(--primary-orange)] drop-shadow-md decoration-wavy underline decoration-[var(--primary-orange)]/30">
              Campus Humor
            </span>
          </h1>
          <p className="mx-auto mb-2 max-w-2xl text-lg text-purple-100 font-medium leading-relaxed">
            Generate memes that hit different 
          </p>

          <MemeFeed memes={memes} isLoggedIn={isLoggedIn} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
