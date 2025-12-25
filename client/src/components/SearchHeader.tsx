import { Search, X } from "lucide-react";

interface SearchHeaderProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: () => void;
  totalVerses?: number;
}

export function SearchHeader({ query, setQuery, onSearch, totalVerses }: SearchHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/40 pb-4 pt-6 px-4 md:px-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Al-Quran
          </h1>
          <p className="text-sm text-muted-foreground">
            Recherchez dans {totalVerses ? totalVerses.toLocaleString() : "..."} versets
          </p>
        </div>

        <div className="relative group flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 bg-white border border-input rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              placeholder="Rechercher un mot, une phrase..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Effacer la recherche"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            onClick={onSearch}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-medium hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-primary/20 whitespace-nowrap"
          >
            Rechercher
          </button>
        </div>
      </div>
    </div>
  );
}
