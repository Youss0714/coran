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
    
    const lowerQuery = query.toLowerCase().trim();
    
    return allVersets.filter((verset) => 
      verset.texte.toLowerCase().includes(lowerQuery)
    );
  }, [allVersets, query]);

  return { 
    results, 
    count: results.length, 
    isLoading,
    totalVerses: allVersets?.length || 0
  };
}
