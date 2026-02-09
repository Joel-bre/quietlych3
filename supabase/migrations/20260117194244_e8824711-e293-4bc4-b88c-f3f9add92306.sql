-- Add mood rating column to journal entries
ALTER TABLE public.journal_entries 
ADD COLUMN mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5);