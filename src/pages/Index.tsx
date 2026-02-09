import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Flame, Trophy, FileText, Eye, Heart, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEntriesWithDates } from '@/hooks/useEntriesWithDates';
import { useJournalEntry } from '@/hooks/useJournalEntry';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { hasEntry, datesWithEntries, loading: entriesLoading } = useEntriesWithDates();
  const { entry } = useJournalEntry(selectedDate);
  const [stats, setStats] = useState({ currentStreak: 0, longestStreak: 0, totalEntries: 0 });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️';
    if (hour < 17) return '🌤️';
    return '🌙';
  };

  useEffect(() => {
    if (!user) return;

    const calculateStats = async () => {
      try {
        const entries = await api.get<{ entryDate: string }[]>('/api/entries/dates');
        
        const totalEntries = entries?.length || 0;

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        if (entries && entries.length > 0) {
          const dates = entries.map(e => e.entryDate).sort().reverse();
          const today = format(new Date(), 'yyyy-MM-dd');
          const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
          
          if (dates[0] === today || dates[0] === yesterday) {
            currentStreak = 1;
            for (let i = 1; i < dates.length; i++) {
              const prevDate = new Date(dates[i - 1]);
              const currDate = new Date(dates[i]);
              const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
              if (diffDays === 1) {
                currentStreak++;
              } else {
                break;
              }
            }
          }

          tempStreak = 1;
          for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
            if (diffDays === 1) {
              tempStreak++;
              longestStreak = Math.max(longestStreak, tempStreak);
            } else {
              tempStreak = 1;
            }
          }
          longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
        }

        setStats({
          currentStreak,
          longestStreak,
          totalEntries,
        });
      } catch (error) {
        console.error('Error calculating stats:', error);
      }
    };

    calculateStats();
  }, [user, datesWithEntries]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = monthStart.getDay();
  const paddingDays = Array.from({ length: startDay }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (startDay - i));
    return date;
  });

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const showLast2Weeks = () => {
    setCurrentMonth(new Date());
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getFilledFieldsCount = () => {
    if (!entry) return 0;
    const fields = ['howDoYouFeel', 'gratefulFor', 'achievements', 'challenges', 'learnings', 'somethingFunny', 'generalNotes'];
    return fields.filter(f => entry[f as keyof typeof entry]).length;
  };

  const filledFields = getFilledFieldsCount();

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-sm text-muted-foreground">{getGreeting()} {getGreetingEmoji()}</p>
          <h1 className="text-2xl font-bold">{format(new Date(), 'EEEE, MMMM d')}</h1>
        </div>
        <Button 
          size="icon" 
          variant="secondary" 
          className="rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
          onClick={() => navigate('/calendar')}
        >
          <FileText className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-2.5 sm:p-4 text-center">
            <div className="mx-auto mb-1.5 sm:mb-2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-orange-500/20">
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold">{stats.currentStreak}<span className="text-xs sm:text-sm font-normal text-muted-foreground">d</span></p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Streak</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-2.5 sm:p-4 text-center">
            <div className="mx-auto mb-1.5 sm:mb-2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-yellow-500/20">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold">{stats.longestStreak}<span className="text-xs sm:text-sm font-normal text-muted-foreground">d</span></p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Best</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-2.5 sm:p-4 text-center">
            <div className="mx-auto mb-1.5 sm:mb-2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/20">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <p className="text-xl sm:text-2xl font-bold">{stats.totalEntries}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Entries</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</span>
              {!isSameMonth(currentMonth, new Date()) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 rounded-full border-primary/30 px-3 text-xs"
                  onClick={showLast2Weeks}
                >
                  2 weeks
                </Button>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="py-1 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {paddingDays.map((date) => (
              <div key={`padding-${date.toISOString()}`} className="aspect-square p-0.5">
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground/30">
                  {format(date, 'd')}
                </div>
              </div>
            ))}

            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const hasJournalEntry = hasEntry(dateStr);
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const isFuture = day > new Date();

              return (
                <div key={dateStr} className="aspect-square p-0.5">
                <button
                    onClick={() => {
                      setSelectedDate(day);
                      navigate(`/calendar?date=${format(day, 'yyyy-MM-dd')}`);
                    }}
                    disabled={isFuture || entriesLoading}
                    className={cn(
                      'relative flex h-full w-full items-center justify-center rounded-full text-sm transition-all',
                      isSelected && 'bg-primary text-primary-foreground',
                      !isSelected && isTodayDate && 'text-primary font-semibold',
                      isFuture && 'cursor-not-allowed opacity-30',
                      !isSelected && !isFuture && 'hover:bg-muted'
                    )}
                  >
                    {format(day, 'd')}
                    {hasJournalEntry && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
              </h3>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-500/20 text-green-500">✓</span>
                {filledFields}/7 fields completed
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 rounded-full border-primary/30"
              onClick={() => navigate('/calendar')}
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
          </div>

          {entry?.howDoYouFeel && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/50 p-3">
              <Heart className="h-4 w-4 text-journal-feel mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Mood</p>
                <p className="text-sm line-clamp-2">{entry.howDoYouFeel}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center pt-2">
        <Button 
          size="lg" 
          className="gap-2 rounded-full px-8"
          onClick={() => navigate('/calendar')}
        >
          <Pencil className="h-4 w-4" />
          Today's Entry
        </Button>
      </div>
    </div>
  );
};

export default Index;
