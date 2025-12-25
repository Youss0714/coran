import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { type VersetJson, versetJsonSchema } from '@shared/schema';

// Schema for the entire JSON file array
const quranSchema = z.array(versetJsonSchema);

export function useQuran() {
  const { data: allVersets, isLoading, error } = useQuery({
    queryKey: ['quran-data'],
    queryFn: async () => {
      // Simulate fetching from assets (public folder)
      const res = await fetch('/quran.json');
      if (!res.ok) {
        throw new Error('Impossible de charger le fichier Coran.');
      }
      const jsonData = await res.json();
      return quranSchema.parse(jsonData);
    },
    staleTime: Infinity, // Data is static, never refetch
  });

  return { allVersets, isLoading, error };
}

export function useQuranSearch(query: string) {
  const { allVersets, isLoading } = useQuran();

  const results = useMemo(() => {
    if (!allVersets || !query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const searchTerms = normalizedQuery.split(/\s+/).filter(Boolean);

    if (searchTerms.length === 0) return [];

    return allVersets.filter((v) => {
      // Split text into Arabic, French, and Surah Name
      const parts = v.texte.split('|').map(s => s.trim());
      const arabicText = parts[0] || "";
      const frenchText = parts[1] || "";
      const surahName = parts[2] || "";

      // Function to remove Arabic diacritics (tashkeel)
      const removeTashkeel = (text: string) => {
        return text.replace(/[\u064B-\u0652\u0670\u06D6-\u06ED]/g, "");
      };

      const searchTerms = query.trim().split(/\s+/).filter(Boolean);
      const sourateStr = v.sourate.toString();
      const versetStr = v.verset.toString();
      
      return searchTerms.every(term => {
        const isNumeric = /^\d+$/.test(term);
        if (isNumeric) {
          return sourateStr === term || versetStr === term;
        }

        // Normalize term and texts for comparison
        const termNormalized = term.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const termArabicPlain = removeTashkeel(term).replace(/آ|إ|أ/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");

        const arabicPlain = removeTashkeel(arabicText).replace(/آ|إ|أ/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
        const frenchNormalized = frenchText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const surahNormalized = surahName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return arabicText.includes(term) || 
               arabicPlain.includes(termArabicPlain) ||
               frenchNormalized.includes(termNormalized) ||
               surahNormalized.includes(termNormalized);
      });
    });
  }, [allVersets, query]);

  return { 
    results, 
    count: results.length, 
    isLoading,
    totalVerses: allVersets?.length || 0
  };
}
