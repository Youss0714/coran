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

  // Normalized diacritics removal to match use-quran.ts
  const removeTashkeel = (t: string) => {
    return t
      .replace(/[\u064B-\u0658]/g, "") // All diacritics including Maddah
      .replace(/[\u0670\u06D6-\u06ED]/g, "") // Alif Khanjariyah and Quranic signs
      .replace(/\u0640/g, "") // Kashida/Tatweel
      .replace(/\u0671/g, "\u0627") // Wasla to Alif
      .replace(/[\u0622\u0623\u0625]/g, "\u0627") // Alif Mad/Hamza to Alif
      .replace(/\u0629/g, "\u0647") // Ta Marbuta to Ha
      .replace(/\u0649/g, "\u064A") // Alif Maksura to Ya
      .replace(/\s+/g, " ")
      .trim();
  };

  const queryRaw = highlight.trim();
  const queryLower = queryRaw.toLowerCase();
  const queryPlain = removeTashkeel(queryLower);
  const terms = queryRaw.split(/\s+/).filter(Boolean);
  
  if (terms.length === 0) return <span className={className}>{text}</span>;

  const textPlain = removeTashkeel(text.toLowerCase());
  const parts: { text: string, isHighlighted: boolean, originalIndex: number }[] = [];
  let lastIndex = 0;

  // PHRASE MATCH PRIORITY: If the query has spaces, try highlighting the whole phrase first
  if (queryRaw.includes(" ")) {
    let searchIndex = 0;
    const regex = new RegExp(queryPlain.split(/\s+/).join("[\\s]*"), "g");
    let match;
    
    while ((match = regex.exec(textPlain)) !== null) {
      const matchStart = match.index;
      const matchLength = match[0].length;
      
      if (lastIndex < matchStart) {
        parts.push({ text: text.substring(lastIndex, matchStart), isHighlighted: false, originalIndex: lastIndex });
      }
      parts.push({ text: text.substring(matchStart, matchStart + matchLength), isHighlighted: true, originalIndex: matchStart });
      lastIndex = matchStart + matchLength;
    }
    
    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex), isHighlighted: false, originalIndex: lastIndex });
    }
    
    if (parts.length > 1) {
      return (
        <span className={className}>
          {parts.map((part, i) => (
            part.isHighlighted ? (
              <mark key={i} className="bg-yellow-200 text-yellow-900 font-bold px-1 rounded dark:bg-yellow-900/50 dark:text-yellow-200">
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

  // 2. Individual word matching for Arabic text
  const finalParts: { text: string, isHighlighted: boolean }[] = [{ text, isHighlighted: false }];
  
  terms.forEach(term => {
    const termPlain = removeTashkeel(term.toLowerCase());
    
    for (let i = 0; i < finalParts.length; i++) {
      if (finalParts[i].isHighlighted) continue;

      const currentText = finalParts[i].text;
      const currentPlain = removeTashkeel(currentText.toLowerCase());
      
      // Find all occurrences of the term in this part
      const regex = new RegExp(termPlain, "g");
      let match;
      const subParts: { text: string, isHighlighted: boolean }[] = [];
      let lastPos = 0;

      while ((match = regex.exec(currentPlain)) !== null) {
        const matchStart = match.index;
        const matchLength = match[0].length;
        
        if (lastPos < matchStart) {
          subParts.push({ text: currentText.substring(lastPos, matchStart), isHighlighted: false });
        }
        subParts.push({ text: currentText.substring(matchStart, matchStart + matchLength), isHighlighted: true });
        lastPos = matchStart + matchLength;
      }
      
      if (lastPos < currentText.length) {
        subParts.push({ text: currentText.substring(lastPos), isHighlighted: false });
      }

      if (subParts.length > 1) {
        finalParts.splice(i, 1, ...subParts);
        i += subParts.length - 1;
      }
    }
  });

  return (
    <span className={className}>
      {finalParts.map((part, i) => (
        part.isHighlighted ? (
          <mark key={i} className="bg-yellow-200 text-yellow-900 font-bold px-1 rounded dark:bg-yellow-900/50 dark:text-yellow-200">
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
