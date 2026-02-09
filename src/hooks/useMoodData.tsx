import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { startOfDay, subDays, format, eachDayOfInterval } from 'date-fns';

export interface MoodDataPoint {
  date: string;
  mood: number;
  emoji: string;
}

export interface MoodDistribution {
  mood: number;
  count: number;
  emoji: string;
  label: string;
}

export interface MoodStats {
  average: number;
  averageEmoji: string;
  totalDays: number;
  currentStreak: number;
  bestStreak: number;
}

interface JournalEntry {
  entryDate: string;
  moodRating: number | null;
}

const MOOD_EMOJIS = ['😢', '😔', '😐', '🙂', '😊'];
const MOOD_LABELS = ['Very Low', 'Low', 'Neutral', 'Good', 'Great'];

function getMoodEmoji(mood: number): string {
  return MOOD_EMOJIS[Math.min(Math.max(mood - 1, 0), 4)];
}

function getMoodLabel(mood: number): string {
  return MOOD_LABELS[Math.min(Math.max(mood - 1, 0), 4)];
}

export function useMoodData(startDate: Date, endDate: Date) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['mood-data', user?.id, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');
      
      const data = await api.get<JournalEntry[]>(`/api/entries?startDate=${startStr}&endDate=${endStr}`);

      const entriesWithMood = (data || []).filter(e => e.moodRating !== null);

      const timeline: MoodDataPoint[] = entriesWithMood.map(entry => ({
        date: entry.entryDate,
        mood: entry.moodRating!,
        emoji: getMoodEmoji(entry.moodRating!),
      }));

      const distributionMap = new Map<number, number>();
      for (let i = 1; i <= 5; i++) {
        distributionMap.set(i, 0);
      }
      timeline.forEach(point => {
        distributionMap.set(point.mood, (distributionMap.get(point.mood) || 0) + 1);
      });

      const distribution: MoodDistribution[] = Array.from(distributionMap.entries()).map(
        ([mood, count]) => ({
          mood,
          count,
          emoji: getMoodEmoji(mood),
          label: getMoodLabel(mood),
        })
      );

      const totalDays = timeline.length;
      const average = totalDays > 0
        ? timeline.reduce((sum, p) => sum + p.mood, 0) / totalDays
        : 0;

      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      
      const today = startOfDay(new Date());
      const sortedDates = timeline.map(t => t.date).sort().reverse();
      
      for (let i = 0; i < 365; i++) {
        const checkDate = format(subDays(today, i), 'yyyy-MM-dd');
        if (sortedDates.includes(checkDate)) {
          currentStreak++;
        } else if (i > 0) {
          break;
        }
      }

      const allDates = new Set(timeline.map(t => t.date));
      if (timeline.length > 0) {
        const interval = eachDayOfInterval({ start: startDate, end: endDate });
        interval.forEach(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          if (allDates.has(dateStr)) {
            tempStreak++;
            bestStreak = Math.max(bestStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        });
      }

      const stats: MoodStats = {
        average: Math.round(average * 10) / 10,
        averageEmoji: getMoodEmoji(Math.round(average)),
        totalDays,
        currentStreak,
        bestStreak,
      };

      return { timeline, distribution, stats };
    },
    enabled: !!user,
  });
}
