export default function LoadingGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-surface rounded-2xl overflow-hidden border border-border animate-pulse"
                >
                    {/* Image placeholder */}
                    <div className="w-full aspect-[16/9] bg-border relative">
                        <div className="absolute top-3 right-3 w-16 h-6 bg-surface/50 rounded-md" />
                    </div>

                    {/* Content placeholder */}
                    <div className="p-5 flex flex-col gap-3">
                        <div className="w-3/4 h-6 bg-border rounded-md" />

                        <div className="space-y-2 mt-2">
                            <div className="w-full h-4 bg-border rounded-md" />
                            <div className="w-5/6 h-4 bg-border rounded-md" />
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                            <div className="w-24 h-3 bg-border rounded-md" />
                            <div className="w-12 h-3 bg-border rounded-md" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
