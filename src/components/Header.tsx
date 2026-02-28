import Link from 'next/link';
import { BookMarked } from 'lucide-react';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full glass">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                        GT
                    </div>
                    <span className="text-xl font-bold tracking-tight">GameTrack</span>
                </Link>
                <form action="/search" method="GET" className="hidden md:flex relative items-center flex-1 max-w-sm ml-8 mr-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        name="q"
                        placeholder="Search games..."
                        className="w-full bg-surface-hover border border-border rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-foreground/50"
                    />
                </form>

                <nav className="flex items-center gap-6">
                    <Link href="/" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium">
                        Home
                    </Link>
                    <Link href="/library" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium flex items-center gap-1.5 border border-border/50 bg-surface px-3 py-1.5 rounded-full hover:border-primary/50 shadow-sm">
                        <BookMarked className="w-4 h-4" /> Library
                    </Link>
                </nav>
            </div>
        </header>
    );
}
