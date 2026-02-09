import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export interface JournalEntry {
  id?: number;
  userId?: number;
  entryDate: string;
  howDoYouFeel: string;
  achievements: string;
  learnings: string;
  gratefulFor: string;
  challenges: string;
  somethingFunny: string;
  generalNotes: string;
  moodRating: number | null;
  createdAt?: string;
  updatedAt?: string;
}

const emptyEntry = (date: string): JournalEntry => ({
  entryDate: date,
  howDoYouFeel: '',
  achievements: '',
  learnings: '',
  gratefulFor: '',
  challenges: '',
  somethingFunny: '',
  generalNotes: '',
  moodRating: null,
});

export function useJournalEntry(date: Date) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  const entryRef = useRef<JournalEntry | null>(null);

  useEffect(() => {
    entryRef.current = entry;
  }, [entry]);

  const dateStr = format(date, 'yyyy-MM-dd');

  const fetchEntry = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    isInitialLoadRef.current = true;
    try {
      const data = await api.get<JournalEntry | null>(`/api/entries/${dateStr}`);
      setEntry(data || emptyEntry(dateStr));
    } catch (error) {
      console.error('Error fetching entry:', error);
      toast({
        title: 'Error loading entry',
        description: 'Could not load your journal entry.',
        variant: 'destructive',
      });
      setEntry(emptyEntry(dateStr));
    } finally {
      setLoading(false);
      setIsDirty(false);
    }
  }, [user, dateStr, toast]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  const updateField = useCallback(
    (field: keyof JournalEntry, value: string | number | null) => {
      setEntry((prev) => (prev ? { ...prev, [field]: value } : null));
      if (!isInitialLoadRef.current) {
        setIsDirty(true);
      }
    },
    []
  );

  useEffect(() => {
    if (entry && isInitialLoadRef.current) {
      const timer = setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [entry]);

  const saveEntry = useCallback(async () => {
    const currentEntry = entryRef.current;
    if (!user || !currentEntry) return;

    setSaving(true);
    try {
      const entryData = {
        entryDate: dateStr,
        howDoYouFeel: currentEntry.howDoYouFeel,
        achievements: currentEntry.achievements,
        learnings: currentEntry.learnings,
        gratefulFor: currentEntry.gratefulFor,
        challenges: currentEntry.challenges,
        somethingFunny: currentEntry.somethingFunny,
        generalNotes: currentEntry.generalNotes,
        moodRating: currentEntry.moodRating,
      };

      const savedEntry = await api.post<JournalEntry>('/api/entries', entryData);
      setEntry(savedEntry);
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: 'Error saving',
        description: 'Could not save your journal entry.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [user, dateStr, toast]);

  useEffect(() => {
    if (!isDirty || !user || loading) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveEntry();
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isDirty, user, loading, saveEntry]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    entry,
    loading,
    saving,
    isDirty,
    updateField,
    saveEntry,
    refetch: fetchEntry,
  };
}
