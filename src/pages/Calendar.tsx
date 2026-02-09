import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JournalEntryForm } from '@/components/journal/JournalEntryForm';

export default function CalendarPage() {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  
  const [selectedDate, setSelectedDate] = useState(() => {
    if (dateParam) {
      const parsed = new Date(dateParam);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  });

  // Update selected date when URL param changes
  useEffect(() => {
    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
      }
    }
  }, [dateParam]);

  return (
    <div className="mx-auto max-w-2xl">
      <JournalEntryForm date={selectedDate} onDateChange={setSelectedDate} />
    </div>
  );
}
