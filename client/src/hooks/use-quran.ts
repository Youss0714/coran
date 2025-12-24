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
      const verseText = v.texte.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const sourateStr = v.sourate.toString();
      const versetStr = v.verset.toString();
      
      // Try to detect if query contains Arabic characters
      const isArabic = /[\u0600-\u06FF]/.test(normalizedQuery);
      
      return searchTerms.every(term => {
        const isNumeric = /^\d+$/.test(term);
        if (isNumeric) {
          return sourateStr === term || versetStr === term;
        }
        // If query is Arabic, match exactly without normalization
        if (isArabic) {
          return v.texte.includes(term);
        }
        return verseText.includes(term);
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
