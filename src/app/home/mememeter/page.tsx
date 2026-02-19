import Navbar from "../Navbar";
import Footer from "../Footer";
import VotingCarousel from "./VotingCarousel";
import { getCaptionsForVoting, getCurrentUser } from "./queries";
import Link from "next/link";

export default async function MemometerPage() {
  const [captions, user] = await Promise.all([
    getCaptionsForVoting(),
    getCurrentUser(),
  ]);

  // Debug: log captions to server console
  console.log("Captions count:", captions.length);
  if (captions.length > 0) {
    console.log("First caption:", JSON.stringify(captions[0], null, 2));
  }

  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-[var(--secondary-purple)] font-sans text-white flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-6 md:px-6 flex-1">
        <section className="text-white">
          <div className="text-center mb-6">
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight md:text-4xl drop-shadow-lg">
              <span className="text-[var(--primary-orange)] drop-shadow-md">
                The MemeMeter
              </span>
            </h1>
            <p className="mx-auto max-w-lg text-base text-purple-100 font-medium">
              Rate captions and help us measure what makes humor tick
            </p>

          </div>

          {/* Voting Carousel */}
          <div className="flex justify-center -ml-20">
            <VotingCarousel captions={captions} isLoggedIn={isLoggedIn} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
