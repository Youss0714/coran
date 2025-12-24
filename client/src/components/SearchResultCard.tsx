import { VersetJson } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface SearchResultCardProps {
  verset: VersetJson;
  index: number;
}

export function SearchResultCard({ verset, index }: SearchResultCardProps) {
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
          <p className="text-lg leading-relaxed text-foreground/90 font-medium">
            {verset.texte}
          </p>
          {/* Optional: If we had Arabic text, we would display it here with font-arabic class */}
        </CardContent>
      </Card>
    </motion.div>
  );
}
