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
        if (!text) return "";
        return text
          .replace(/[\u064B-\u0652\u0670\u06D6-\u06ED]/g, "") // Diacritics
          .replace(/\u0671/g, "\u0627") // Wasla to Alif
          .replace(/[\u0622\u0623\u0625]/g, "\u0627") // Alif Mad/Hamza to Alif
          .replace(/\u0629/g, "\u0647") // Ta Marbuta to Ha
          .replace(/\u0649/g, "\u064A") // Alif Maksura to Ya
          .replace(/\u0640/g, ""); // Kashida
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
        const termLower = term.toLowerCase();
        const termNormalized = termLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const termArabicPlain = removeTashkeel(termLower);

        const arabicPlain = removeTashkeel(arabicText);
        const frenchNormalized = frenchText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const surahNormalized = surahName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return arabicText.includes(term) || 
               arabicPlain.includes(termArabicPlain) ||
               frenchText.toLowerCase().includes(termLower) ||
               frenchNormalized.includes(termNormalized) ||
               surahName.toLowerCase().includes(termLower) ||
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
