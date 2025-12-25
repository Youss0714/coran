import { useState, useMemo, useEffect, useRef } from "react";
import { useQuranSearch } from "@/hooks/use-quran";
import { SearchHeader } from "@/components/SearchHeader";
import { SearchResultCard } from "@/components/SearchResultCard";
import { Loader2, AlertCircle, BookOpenCheck, BookOpen, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ 
        top: scrollContainerRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const { results, count, isLoading, totalVerses } = useQuranSearch(activeQuery);

  const surahStats = useMemo(() => {
    if (!results || !results.length) return [];
    const stats: Record<number, number> = {};
    results.forEach(v => {
      stats[v.sourate] = (stats[v.sourate] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([id, count]) => ({ id: parseInt(id), count }))
      .sort((a, b) => a.id - b.id);
  }, [results]);

  const scrollToSurah = (surahId: number) => {
    const firstVerseOfSurah = results.find(v => v.sourate === surahId);
    if (firstVerseOfSurah) {
      const element = document.getElementById(`verset-${firstVerseOfSurah.sourate}-${firstVerseOfSurah.verset}`);
      if (element) {
        const headerOffset = 180;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  const handleSearch = () => {
    setActiveQuery(searchInput);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 0.2
              }}
              className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary shadow-lg shadow-primary/5"
            >
              <BookOpen className="w-12 h-12" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl font-bold text-foreground tracking-tight"
            >
              Al-Quran
            </motion.h1>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-muted-foreground mt-2 text-center"
            >
              Explorez la Sagesse Eternelle
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ delay: 0.8, duration: 1.2, ease: "easeInOut" }}
              className="h-1 bg-primary/20 rounded-full mt-8 overflow-hidden"
            >
              <motion.div 
                animate={{ x: [-120, 120] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="h-full w-full bg-primary"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm flex flex-col h-[600px] relative group">
                <div className="grid grid-cols-[80px_100px_40px_1fr_80px] bg-muted/50 border-b border-border text-[10px] uppercase tracking-wider font-bold text-muted-foreground sticky top-0 z-20">
                  <div className="p-3 border-r border-border text-center">Num</div>
                  <div className="p-3 border-r border-border text-center">Sourat</div>
                  <div className="p-3 border-r border-border text-center">Verset</div>
                  <div className="p-3 border-r border-border text-center">Texte</div>
                  <div className="p-3 text-center">Nombre mot</div>
                </div>
                
                {/* Scroll Navigation Buttons */}
                <div className="absolute right-6 bottom-6 flex flex-col gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    onClick={scrollToTop}
                    className="rounded-full shadow-lg border border-border bg-white/80 backdrop-blur-sm hover:bg-white"
                    title="Aller au début"
                    data-testid="button-scroll-top"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    onClick={scrollToBottom}
                    className="rounded-full shadow-lg border border-border bg-white/80 backdrop-blur-sm hover:bg-white"
                    title="Aller à la fin"
                    data-testid="button-scroll-bottom"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </div>

                <div 
                  ref={scrollContainerRef}
                  className="overflow-y-auto flex-1 divide-y divide-border scroll-smooth"
                >
                  {results.map((verset, idx) => (
                    <SearchResultCard 
                      key={`${verset.sourate}-${verset.verset}`} 
                      verset={verset} 
                      index={idx} 
                      highlight={activeQuery}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
