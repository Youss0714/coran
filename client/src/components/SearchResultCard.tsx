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
  const removeTashkeel = (t: string) => {
    return t
      .replace(/[\u064B-\u0652]/g, "") // Main diacritics
      .replace(/[\u0654-\u0658]/g, "") // Hamza marks
      .replace(/[\u0670\u06D6-\u06ED]/g, "") // Alif Khanjariyah and Quranic signs
      .replace(/\u0640/g, "") // Kashida/Tatweel
      .replace(/\u0671/g, "\u0627") // Wasla to Alif
      .replace(/[\u0622\u0623\u0625]/g, "\u0627") // Alif Mad/Hamza to Alif
      .replace(/\u0629/g, "\u0647") // Ta Marbuta to Ha
      .replace(/\u0649/g, "\u064A"); // Alif Maksura to Ya
  };

  const terms = highlight.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return <span className={className}>{text}</span>;

  // PHRASE MATCH PRIORITY: If the query has spaces, try highlighting the whole phrase first
  const queryPlain = removeTashkeel(highlight.toLowerCase());
  const textPlain = removeTashkeel(text.toLowerCase());
  
  const parts: { text: string, isHighlighted: boolean }[] = [{ text, isHighlighted: false }];

  // 1. Try exact phrase match if spaces exist
  if (highlight.trim().includes(" ")) {
    const fullIndex = textPlain.indexOf(queryPlain);
    if (fullIndex !== -1) {
      const match = text.substring(fullIndex, fullIndex + highlight.trim().length);
      // Simple replace for the first part
      const before = text.substring(0, fullIndex);
      const after = text.substring(fullIndex + highlight.trim().length);
      const phraseParts = [];
      if (before) phraseParts.push({ text: before, isHighlighted: false });
      phraseParts.push({ text: match, isHighlighted: true });
      if (after) phraseParts.push({ text: after, isHighlighted: false });
      parts.splice(0, 1, ...phraseParts);
      // If we matched the phrase, we don't necessarily need to match individual words inside it
      return (
        <span className={className}>
          {parts.map((part, i) => (
            part.isHighlighted ? (
              <mark key={i} className="bg-blue-100 text-blue-700 font-bold px-0.5 rounded dark:bg-blue-900/30 dark:text-blue-300">
                {part.text}
              </mark>
            ) : (
              <span key={i}>{part.text}</span>
            )
          ))}
        </span>
      );
    }
  }

  // 2. Individual word matching (existing logic)
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
          <mark key={i} className="bg-blue-100 text-blue-700 font-bold px-0.5 rounded dark:bg-blue-900/30 dark:text-blue-300">
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
  const parts = verset.texte.split('|').map(s => s.trim());
  const ar = parts[0] || "";
  const fr = parts[1] || "";
  const surahName = parts[2] || `سورة ${verset.sourate}`;

  return (
    <motion.div
      id={`verset-${verset.sourate}-${verset.verset}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <div className="grid grid-cols-[80px_100px_40px_1fr_80px] border-b border-border hover:bg-muted/50 transition-colors items-stretch text-sm min-h-[60px]">
        <div className="p-3 border-r border-border flex items-center justify-center font-medium">
          {verset.sourate}
        </div>
        <div className="p-3 border-r border-border flex items-center justify-center text-center font-arabic text-lg" dir="rtl">
          {surahName}
        </div>
        <div className="p-3 border-r border-border flex items-center justify-center font-medium">
          {verset.verset}
        </div>
        <div className="p-3 border-r border-border flex flex-col justify-center gap-2">
          <div className="font-arabic text-lg text-right leading-relaxed" dir="rtl">
            <HighlightedText text={ar} highlight={highlight} />
          </div>
          {fr && (
            <div className="text-muted-foreground italic text-xs leading-normal">
              <HighlightedText text={fr} highlight={highlight} />
            </div>
          )}
        </div>
        <div className="p-3 flex items-center justify-center font-bold text-blue-600">
          1
        </div>
      </div>
    </motion.div>
  );
}
