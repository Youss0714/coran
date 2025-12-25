import { useState, useMemo } from "react";
import { useQuranSearch } from "@/hooks/use-quran";
import { SearchHeader } from "@/components/SearchHeader";
import { SearchResultCard } from "@/components/SearchResultCard";
import { Loader2, AlertCircle, BookOpenCheck, ListFilter } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  
  const { results, count, isLoading, totalVerses } = useQuranSearch(activeQuery);

  const surahStats = useMemo(() => {
    if (!results.length) return [];
    const stats: Record<number, number> = {};
    results.forEach(v => {
      stats[v.sourate] = (stats[v.sourate] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([id, count]) => ({ id: parseInt(id), count }))
      .sort((a, b) => a.id - b.id);
  }, [results]);

  const handleSearch = () => {
    setActiveQuery(searchInput);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SearchHeader 
        query={searchInput} 
        setQuery={setSearchInput} 
        onSearch={handleSearch}
        totalVerses={totalVerses}
      />

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p>Chargement du Coran...</p>
          </div>
        ) : !activeQuery ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-20 px-4"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <BookOpenCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Prêt à rechercher</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Le Coran complet (6236 versets) est chargé. Entrez un mot clé ci-dessus pour l'explorer instantanément, même hors ligne.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Résultats
              </h2>
              <span className="px-3 py-1 bg-white border border-border rounded-full text-xs font-medium text-muted-foreground shadow-sm">
                {count} {count === 1 ? 'occurrence trouvée' : 'occurrences trouvées'}
              </span>
            </div>

            {count > 0 && surahStats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ListFilter className="w-4 h-4" />
                  Répartition par sourate
                </div>
                <div className="flex flex-wrap gap-2">
                  {surahStats.map(stat => (
                    <Badge 
                      key={stat.id} 
                      variant="outline" 
                      className="bg-white border-blue-100 text-blue-700 hover:bg-blue-50 transition-colors py-1.5 px-3"
                    >
                      Sourate {stat.id} : <span className="font-bold ml-1">{stat.count}</span>
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {count === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-border">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3 text-destructive">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-foreground font-medium">Aucun résultat trouvé</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Essayez avec un autre terme ou vérifiez l'orthographe.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((verset, idx) => (
                  <SearchResultCard 
                    key={`${verset.sourate}-${verset.verset}`} 
                    verset={verset} 
                    index={idx} 
                    highlight={activeQuery}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
