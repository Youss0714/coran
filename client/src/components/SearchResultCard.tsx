import { VersetJson } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface SearchResultCardProps {
  verset: VersetJson;
  index: number;
  highlight?: string;
}

function HighlightedText({ text, highlight, className }: { text: string, highlight?: string, className?: string }) {
  if (!highlight || !highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Split by multiple terms if necessary
  const terms = highlight.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/).filter(Boolean);
  if (terms.length === 0) return <span className={className}>{text}</span>;

  // Create a regex that matches any of the terms, case insensitive and accent insensitive is hard in pure regex
  // So we use a simpler approach: finding matches in normalized text but applying to original
  const parts: { text: string, isHighlighted: boolean }[] = [{ text, isHighlighted: false }];

  terms.forEach(term => {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].isHighlighted) continue;

      const currentText = parts[i].text;
      const normalizedCurrent = currentText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const index = normalizedCurrent.indexOf(term);

      if (index !== -1) {
        const before = currentText.substring(0, index);
        const match = currentText.substring(index, index + term.length);
        const after = currentText.substring(index + term.length);

        const newParts = [];
        if (before) newParts.push({ text: before, isHighlighted: false });
        newParts.push({ text: match, isHighlighted: true });
        if (after) newParts.push({ text: after, isHighlighted: false });

        parts.splice(i, 1, ...newParts);
        i += newParts.length - 1;
      }
    }
  });

  return (
    <span className={className}>
      {parts.map((part, i) => (
        part.isHighlighted ? (
          <mark key={i} className="bg-primary/20 text-primary-foreground font-bold px-0.5 rounded">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      ))}
    </span>
  );
}

export function SearchResultCard({ verset, index, highlight }: SearchResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white group">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
              <span className="p-1.5 rounded-full bg-primary/10 text-primary">
                <BookOpen className="w-3 h-3" />
              </span>
              Sourate {verset.sourate}, Verset {verset.verset}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {verset.texte.includes('|') ? (
            <div className="space-y-4">
              <div className="text-2xl leading-loose text-foreground font-arabic text-right dir-rtl" dir="rtl">
                <HighlightedText text={verset.texte.split('|')[0].trim()} highlight={highlight} />
              </div>
              <div className="h-px bg-border/50 w-full" />
              <div className="text-base leading-relaxed text-muted-foreground italic">
                <HighlightedText text={verset.texte.split('|')[1].trim()} highlight={highlight} />
              </div>
            </div>
          ) : (
            <div className="text-lg leading-relaxed text-foreground/90 font-medium">
              <HighlightedText text={verset.texte} highlight={highlight} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
