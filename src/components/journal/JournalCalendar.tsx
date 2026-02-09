import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntriesWithDates } from '@/hooks/useEntriesWithDates';
import { cn } from '@/lib/utils';

interface JournalCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function JournalCalendar({ selectedDate, onSelectDate }: JournalCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { hasEntry, loading } = useEntriesWithDates();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate padding days for start of month
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

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            {!isSameMonth(currentMonth, new Date()) && (
              <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
                Today
              </Button>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Padding days from previous month */}
          {paddingDays.map((date) => (
            <div
              key={`padding-${date.toISOString()}`}
              className="aspect-square p-1"
            >
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground/40">
                {format(date, 'd')}
              </div>
            </div>
          ))}

          {/* Current month days */}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const hasJournalEntry = hasEntry(dateStr);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const isFuture = day > new Date();

            return (
              <div key={dateStr} className="aspect-square p-1">
                <button
                  onClick={() => onSelectDate(day)}
                  disabled={isFuture || loading}
                  className={cn(
                    'relative flex h-full w-full items-center justify-center rounded-lg text-sm transition-all',
                    'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    !isSelected && isTodayDate && 'ring-2 ring-primary',
                    isFuture && 'cursor-not-allowed opacity-40',
                    !isSelected && !isFuture && 'hover:bg-accent'
                  )}
                >
                  {format(day, 'd')}
                  {hasJournalEntry && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                  {hasJournalEntry && isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary-foreground" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>Has entry</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-4 w-4 rounded-md ring-2 ring-primary" />
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
