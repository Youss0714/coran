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

// Helper function to remove Arabic diacritics (tashkeel)
const removeTashkeel = (text: string) => {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u0652]/g, "") // Main diacritics (Fathah, Dammah, Kasrah, etc.)
    .replace(/[\u0654-\u0658]/g, "") // Hamza marks
    .replace(/[\u0670\u06D6-\u06ED]/g, "") // Alif Khanjariyah and Quranic signs
    .replace(/\u0640/g, "") // Kashida/Tatweel
    .replace(/\u0671/g, "\u0627") // Wasla to Alif
    .replace(/[\u0622\u0623\u0625]/g, "\u0627") // Alif Mad/Hamza to Alif
    .replace(/\u0629/g, "\u0647") // Ta Marbuta to Ha
    .replace(/\u0649/g, "\u064A") // Alif Maksura to Ya
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
};

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

      const queryRaw = query.trim();
      const queryLower = queryRaw.toLowerCase();
      const queryPlain = removeTashkeel(queryLower);
      const searchTerms = queryRaw.split(/\s+/).filter(Boolean);
      
      const sourateStr = v.sourate.toString();
      const versetStr = v.verset.toString();

      const arabicPlain = removeTashkeel(arabicText);
      const frenchLower = frenchText.toLowerCase();
      const frenchNormalized = frenchLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const surahLower = surahName.toLowerCase();
      const surahNormalized = surahLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // BASMALA SPECIAL CASE
      if (queryPlain === "بسم الله" || queryPlain === "بسم الله الرحمن الرحيم") {
        if (v.verset === 1) return true;
      }

      // PHRASE MATCH (Priority)
      if (queryRaw.includes(" ")) {
        const isPhraseMatch = 
          arabicText.includes(queryRaw) || 
          arabicPlain.includes(queryPlain) ||
          frenchLower.includes(queryLower) ||
          frenchNormalized.includes(queryLower.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        
        if (isPhraseMatch) return true;
      }
      
      // KEYWORD MATCH (Every word must be present)
      return searchTerms.every(term => {
        const isNumeric = /^\d+$/.test(term);
        if (isNumeric) {
          return sourateStr === term || versetStr === term;
        }

        const termLower = term.toLowerCase();
        const termPlain = removeTashkeel(termLower);
        const termNorm = termLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return arabicText.includes(term) || 
               arabicPlain.includes(termPlain) ||
               frenchLower.includes(termLower) ||
               frenchNormalized.includes(termNorm) ||
               surahLower.includes(termLower) ||
               surahNormalized.includes(termNorm);
      });
    });
  }, [allVersets, query]);

  // Count total occurrences in the filtered results
  const count = useMemo(() => {
    if (!results || results.length === 0 || !query.trim()) return 0;
    
    const queryLower = query.trim().toLowerCase();
    const queryPlain = removeTashkeel(queryLower);
    
    return results.reduce((total, v) => {
      const parts = v.texte.split('|').map(s => s.trim());
      const arabicText = parts[0] || "";
      const frenchText = parts[1] || "";
      
      const arabicPlain = removeTashkeel(arabicText);
      const frenchLower = frenchText.toLowerCase();
      
      // Count all matches in both Arabic and French text
      const arabicMatches = (arabicPlain.match(new RegExp(queryPlain, 'g')) || []).length;
      const frenchMatches = (frenchLower.match(new RegExp(queryLower, 'g')) || []).length;
      
      return total + arabicMatches + frenchMatches;
    }, 0);
  }, [results, query]);

  return { 
    results, 
    count, 
    isLoading,
    totalVerses: allVersets?.length || 0
  };
}
