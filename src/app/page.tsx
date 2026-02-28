import { Suspense } from "react";
import Header from "@/components/Header";
import GameCard from "@/components/GameCard";
import LoadingGrid from "@/components/LoadingGrid";
import { Game } from "@/components/GameCard";

export const dynamic = 'force-dynamic';

async function getGames(category: string, limit: number): Promise<Game[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/games?category=${category}&limit=${limit}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error("Failed to fetch games");
    return res.json();
  } catch (error) {
    console.error(`Error fetching games for ${category}:`, error);
    return [];
  }
}

async function GameSection({ title, category, limit = 20, viewAllLink }: { title: string, category: string, limit?: number, viewAllLink?: string }) {
  const games = await getGames(category, limit);

  if (!games || games.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8 text-foreground pb-2 border-b border-border/50">
        <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">{title}</h2>
        {viewAllLink && (
          <a href={viewAllLink} className="text-sm font-semibold text-primary hover:text-primary-hover hover:underline flex items-center gap-1 transition-colors">
            View All
          </a>
        )}
      </div>

      <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {games.map((game, index) => (
          <div key={game.id} className="snap-start shrink-0 w-[160px] sm:w-[180px] md:w-[200px] xl:w-[220px]">
            <GameCard game={game} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-16 text-center pt-8">
          <h1 className="text-5xl md:text-7xl font-sans font-bold tracking-tighter mb-4 text-foreground">
            Discover <span className="text-primary animate-pulse-slow">Amazing</span> Games
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto font-mono">
            Your premium tracklist of the very best titles available right now.
          </p>
        </div>

        <Suspense fallback={<LoadingGrid />}>
          <GameSection title="Trending Now" category="trending" limit={20} viewAllLink="/search?category=trending" />
        </Suspense>

        <Suspense fallback={<LoadingGrid />}>
          <GameSection title="Highest Rated" category="top" limit={20} viewAllLink="/search?category=top" />
        </Suspense>

        <Suspense fallback={<LoadingGrid />}>
          <GameSection title="Top Role-Playing Games" category="rpg" limit={20} viewAllLink="/search?category=rpg" />
        </Suspense>

        <Suspense fallback={<LoadingGrid />}>
          <GameSection title="Top Shooters" category="shooter" limit={20} viewAllLink="/search?category=shooter" />
        </Suspense>

        <Suspense fallback={<LoadingGrid />}>
          <GameSection title="Indie Discoveries" category="indie" limit={20} viewAllLink="/search?category=indie" />
        </Suspense>
      </main>

      <footer className="bg-surface border-t border-border mt-auto py-8 text-center text-foreground/50 text-sm font-mono">
        <p>GameTrack © {new Date().getFullYear()}. Using IGDB API.</p>
      </footer>
    </>
  );
}
