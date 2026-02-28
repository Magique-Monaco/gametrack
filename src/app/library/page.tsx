'use client';

import { useState, useEffect, useRef } from 'react';
import { useLibraryStore, TrackedGame, GameStatus } from '@/store/useLibraryStore';
import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import { Download, Upload, Trash2, Search, Filter } from 'lucide-react';

export default function LibraryPage() {
    const [mounted, setMounted] = useState(false);
    const { games, removeGame, updateStatus, updatePlaytime, importLibrary } = useLibraryStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<GameStatus | 'All'>('All');

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleExportCSV = () => {
        // CSV Header
        const headers = ['id', 'title', 'thumbnail', 'status', 'playtime', 'addedAt'];
        // CSV Rows
        const rows = games.map(g => [
            g.id,
            `"${g.title.replace(/"/g, '""')}"`, // escape quotes for CSV
            g.thumbnail,
            g.status,
            g.playtime,
            g.addedAt
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `gametrack_library_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const csvData = event.target?.result as string;
            if (!csvData) return;

            const lines = csvData.split('\n');
            if (lines.length < 2) return; // Need at least header + 1 row

            const importedGames: TrackedGame[] = [];
            const headers = lines[0].split(',');

            // Simple CSV parser (doesn't handle commas within quotes perfectly in all cases, but works for our simple export format)
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                // This regex handles parsing CSV lines containing values wrapped in quotes
                const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                if (!match || match.length < 6) continue;

                const cleanValues = match.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));

                importedGames.push({
                    id: parseInt(cleanValues[0]),
                    title: cleanValues[1],
                    thumbnail: cleanValues[2],
                    status: cleanValues[3] as GameStatus,
                    playtime: parseFloat(cleanValues[4]),
                    addedAt: parseInt(cleanValues[5])
                });
            }

            if (importedGames.length > 0) {
                // Confirm before overwriting
                if (confirm(`Import ${importedGames.length} games? This will overwrite your current library.`)) {
                    importLibrary(importedGames);
                }
            }

            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';
        };

        reader.readAsText(file);
    };

    if (!mounted) {
        return (
            <>
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 w-64 bg-surface rounded-xl border border-border"></div>
                        <div className="h-20 w-full bg-surface rounded-xl border border-border"></div>
                    </div>
                </main>
            </>
        );
    }

    const filteredGames = games
        .filter(g => statusFilter === 'All' || g.status === statusFilter)
        .filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const STATUS_COLORS: Record<GameStatus, string> = {
        'Playing': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Completed': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Plan to Play': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'On Hold': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'Dropped': 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    return (
        <>
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">

                {/* Page Header */}
                <div className="flex z-10 flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold font-sans tracking-tight mb-2">My Library</h1>
                        <p className="text-foreground/60 font-mono text-sm">
                            Tracking {games.length} games total. ({filteredGames.length} showing)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportCSV}
                            className="px-4 py-2 border border-border bg-surface hover:bg-surface-hover rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm"
                            disabled={games.length === 0}
                        >
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImportCSV}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 border border-border bg-surface hover:bg-primary hover:border-primary text-foreground hover:text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm"
                        >
                            <Upload className="w-4 h-4" /> Import CSV
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-surface border border-border rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                        <input
                            type="text"
                            placeholder="Search library..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="relative w-full sm:w-48 shrink-0">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as GameStatus | 'All')}
                            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
                        >
                            <option value="All">All Statuses</option>
                            {Object.keys(STATUS_COLORS).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Data Grid / Table */}
                {filteredGames.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-surface border border-border rounded-2xl text-center shadow-sm">
                        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-6">
                            <Search className="w-8 h-8 text-foreground/30" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">No Games Found</h2>
                        <p className="text-foreground/60 max-w-sm">
                            {games.length === 0 ? "You haven't added any games to your library yet. Go find some!" : "No games match your current filters."}
                        </p>
                        {games.length > 0 && (
                            <button
                                onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
                                className="mt-6 text-primary hover:underline font-semibold"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGames.map(game => (
                            <div key={game.id} className="bg-surface rounded-xl border border-border overflow-hidden flex shadow-sm hover:border-primary/50 transition-colors group">
                                <Link href={`/game/${game.id}`} className="w-1/3 shrink-0 relative overflow-hidden bg-background">
                                    <Image
                                        src={game.thumbnail}
                                        alt={game.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                        unoptimized={game.thumbnail.includes('nocover')}
                                    />
                                </Link>
                                <div className="p-4 flex flex-col flex-1 w-2/3">
                                    <Link href={`/game/${game.id}`} className="font-bold text-lg mb-1 truncate hover:text-primary transition-colors">
                                        {game.title}
                                    </Link>
                                    <div className="text-xs text-foreground/60 font-mono mb-4">
                                        Added {new Date(game.addedAt).toLocaleDateString()}
                                    </div>

                                    <div className="mt-auto space-y-3">
                                        <div className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wider text-foreground/50">
                                            Status
                                            <select
                                                value={game.status}
                                                onChange={(e) => updateStatus(game.id, e.target.value as GameStatus)}
                                                className={`text-sm py-1 px-2 rounded-md border appearance-none normal-case tracking-normal cursor-pointer focus:outline-none ${STATUS_COLORS[game.status]}`}
                                            >
                                                {Object.keys(STATUS_COLORS).map(s => (
                                                    <option key={s} value={s} className="bg-background text-foreground">{s}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-border pt-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-foreground/60">Playtime</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={game.playtime || ''}
                                                    onChange={(e) => updatePlaytime(game.id, Number(e.target.value))}
                                                    placeholder="0"
                                                    className="bg-background border border-border rounded-md px-2 py-1 w-16 text-sm focus:outline-none focus:border-primary"
                                                /> <span className="text-xs text-foreground/60">hrs</span>
                                            </div>

                                            <button
                                                onClick={() => removeGame(game.id)}
                                                className="text-foreground/30 hover:text-red-500 transition-colors bg-background p-1.5 rounded border border-transparent hover:border-red-500/30"
                                                title="Remove from library"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
