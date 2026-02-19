export default function Footer() {
    return (
        <footer className="mt-20 border-t border-purple-400/30 bg-black/10 py-10 backdrop-blur-sm">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="flex items-center gap-2">
                        <img src="../logo_nav.png" alt="Memify Logo" className="h-10  transition-opacity" />
                    </div>
                    <p className="text-sm text-purple-200">
                        © {new Date().getFullYear()} The Humor Project. Bringing smiles since today.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                            Privacy
                        </a>
                        <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                            Terms
                        </a>
                        <a href="#" className="text-sm text-purple-200 hover:text-white transition-colors">
                            Guidelines
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
