import { Suspense } from 'react';
import Header from '@/components/Header';
import GameCard, { Game } from '@/components/GameCard';
import LoadingGrid from '@/components/LoadingGrid';
import { Search } from 'lucide-react';
import SearchFilters from '@/components/SearchFilters';

export const dynamic = 'force-dynamic';

async function searchGames(query: string, category: string | null): Promise<Game[]> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    try {
        // If we have a query string -> use /api/search
        // If we have a category -> use /api/games?category={category}
        let endpoint = `${baseUrl}/api/games`;

        if (query) {
            endpoint = `${baseUrl}/api/search?q=${encodeURIComponent(query)}`;
        } else if (category) {
            endpoint = `${baseUrl}/api/games?category=${category}&limit=48`;
        }

        const res = await fetch(endpoint, {
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error("Failed to fetch search results");
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching games in search page:", error);
        return [];
    }
}

async function SearchResults({ query, category }: { query: string, category: string | null }) {
    const games = await searchGames(query, category);

    if (!games || games.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-surface border border-border rounded-2xl shadow-sm">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-6">
                    <Search className="w-8 h-8 text-foreground/30" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Games Found</h2>
                <p className="text-foreground/70 max-w-sm mx-auto">
                    We couldn&apos;t find any games matching your search criteria. Try using different keywords.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-6">
            {games.map((game, index) => (
                <GameCard key={game.id} game={game} index={index} />
            ))}
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function SearchPage({ searchParams }: { searchParams: Promise<any> }) {
    const resolvedParams = await searchParams;
    const q = resolvedParams.q || '';
    const category = resolvedParams.category || null;

    return (
        <>
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
                <div className="mb-6 pt-4">
                    <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight mb-6 flex items-center gap-4">
                        {q ? (
                            <>Search Results for <span className="text-primary italic">&quot;{q}&quot;</span></>
                        ) : category ? (
                            <>Browsing: <span className="text-primary capitalize">{category.replace('-', ' ')}</span></>
                        ) : (
                            <>All Games</>
                        )}
                    </h1>

                    <Suspense fallback={<div className="h-10 w-full animate-pulse bg-surface rounded-full" />}>
                        <SearchFilters />
                    </Suspense>
                </div>

                <Suspense fallback={<LoadingGrid />}>
                    <SearchResults query={q} category={category} />
                </Suspense>
            </main>

            <footer className="bg-surface border-t border-border mt-auto py-8 text-center text-foreground/50 text-sm font-mono">
                <p>GameTrack © {new Date().getFullYear()}. Using IGDB API.</p>
            </footer>
        </>
    );
}
