export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-400/30 bg-[var(--secondary-purple)]/90 backdrop-blur-md shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <a href="/" className="flex-shrink-0">
          <img
            src="/logo.png"
            alt="MemeDrop Logo"
            className="h-10 hover:opacity-80 transition-opacity"
          />
        </a>

        <div className="flex items-center gap-4">
          <button className="hidden text-sm font-medium text-purple-100 hover:text-white md:block">
            Log in
          </button>
          <button className="rounded-full bg-[var(--primary-orange)] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[#ff9d5c] hover:scale-105 hover:shadow-lg hover:shadow-orange-500/40 active:scale-95 border-2 border-transparent hover:border-white/20">
            Upload Meme
          </button>
        </div>
      </div>
    </header>
  );
}
