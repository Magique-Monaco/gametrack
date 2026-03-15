'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { getUniquePlatformGroups } from '@/lib/platformIcons';
import { AGE_RATING_DESCRIPTIONS } from '@/lib/ratings';

export interface Game {
    id: number;
    title: string;
    thumbnail: string;
    short_description: string;
    game_url: string;
    genre: string;
    platform: string;
    publisher: string;
    developer: string;
    developer_id?: number;
    release_date: string;
    freetogame_profile_url: string;
    rating?: number | null;
    age_rating?: string | null;
}

interface GameCardProps {
    game: Game;
    index: number;
}

export default function GameCard({ game, index }: GameCardProps) {
    const platformStrings = game.platform.split(',').map(p => p.trim());
    const uniqueGroups = getUniquePlatformGroups(platformStrings);
    const displayGroups = uniqueGroups.slice(0, 3);
    const excess = uniqueGroups.length > 3 ? uniqueGroups.length - 3 : 0;

    return (
        <motion.a
            href={`/game/${game.id}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "50px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative flex flex-col bg-surface rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-colors shadow-lg min-w-[160px]"
        >
            <div className="relative w-full aspect-[3/4] overflow-hidden shrink-0">
                <Image
                    src={game.thumbnail}
                    alt={game.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    unoptimized={game.thumbnail.includes('nocover')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent opacity-90" />

                <div className="absolute top-3 right-3 flex gap-1.5 max-w-[70%] justify-end flex-wrap-reverse">
                    <span className="px-2 py-1 text-[10px] sm:text-xs font-semibold bg-primary text-white rounded-md shadow-sm truncate">
                        {game.genre}
                    </span>
                </div>
            </div>

            <div className="p-3 flex flex-col flex-grow z-10 -mt-8">
                <h3 className="font-bold text-base text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1 drop-shadow-md">
                    {game.title}
                </h3>

                <div className="flex items-center gap-1.5 mb-2 text-foreground/80">
                    {displayGroups.map((g, i) => (
                        <div key={i} title={g.platforms.join(', ')} className="bg-surface-hover p-1 rounded border border-border">
                            {g.icon}
                        </div>
                    ))}
                    {excess > 0 && (
                        <span className="text-[10px] text-foreground/50 ml-1">+{excess}</span>
                    )}
                </div>

                <p className="text-foreground/70 text-xs mb-3 line-clamp-2 flex-grow">
                    {game.short_description}
                </p>

                {(game.rating || game.age_rating) && (
                    <div className="flex items-center justify-between mb-3 w-full">
                        {game.rating ? (
                            <span className="text-[11px] font-bold text-yellow-500/90 flex items-center gap-0.5 drop-shadow-sm">
                                ⭐ {game.rating.toFixed(1)}
                            </span>
                        ) : <div />}
                        {game.age_rating && (
                            <span
                                title={AGE_RATING_DESCRIPTIONS[game.age_rating] || game.age_rating}
                                className="px-1.5 py-0.5 text-[9px] font-bold border border-foreground/20 rounded text-foreground/60 tracking-wider bg-surface-hover cursor-help"
                            >
                                {game.age_rating}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-foreground/50 border-t border-border pt-2.5 mt-auto uppercase tracking-wider font-semibold">
                    <span className="truncate max-w-[100px]">{game.developer}</span>
                    <span>{game.release_date !== 'TBD' ? new Date(game.release_date).getFullYear() : 'TBD'}</span>
                </div>
            </div>

            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/0 group-hover:ring-primary/20 transition-all duration-300 pointer-events-none" />
        </motion.a>
    );
}
