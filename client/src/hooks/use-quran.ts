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

      const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const searchTerms = normalizedQuery.split(/\s+/).filter(Boolean);

      const sourateStr = v.sourate.toString();
      const versetStr = v.verset.toString();
      
      return searchTerms.every(term => {
        const termLower = term.toLowerCase();
        const termNormalized = termLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const isNumeric = /^\d+$/.test(term);
        
        if (isNumeric) {
          return sourateStr === term || versetStr === term;
        }

        // Search in Arabic text (original), French text (normalized), and Surah Name
        const arabicTextNormalized = arabicText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const frenchTextNormalized = frenchText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const surahNameNormalized = surahName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return arabicText.includes(term) || 
               arabicTextNormalized.includes(termNormalized) ||
               frenchTextNormalized.includes(termNormalized) ||
               surahNameNormalized.includes(termNormalized);
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
