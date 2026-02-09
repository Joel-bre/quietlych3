import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';

interface EntryDate {
  entryDate: string;
  moodRating: number | null;
}

export function useEntriesWithDates() {
  const { user } = useAuth();
  const [datesWithEntries, setDatesWithEntries] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const hasFetchedRef = useRef(false);

  const fetchDates = useCallback(async () => {
    if (!user) {
      setDatesWithEntries(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await api.get<EntryDate[]>('/api/entries/dates');
      const dates = new Set(data?.map((e) => e.entryDate) || []);
      setDatesWithEntries(dates);
      hasFetchedRef.current = true;
    } catch (error) {
      console.error('Error fetching dates:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  const hasEntry = useCallback(
    (date: string) => datesWithEntries.has(date),
    [datesWithEntries]
  );

  return {
    datesWithEntries,
    hasEntry,
    loading,
    refetch: fetchDates,
  };
}
