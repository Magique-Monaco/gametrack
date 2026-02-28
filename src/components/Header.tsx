import Link from 'next/link';
import { BookMarked } from 'lucide-react';
import SearchBar from '@/components/SearchBar';

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
                <SearchBar />

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
