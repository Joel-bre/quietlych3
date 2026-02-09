import { cn } from '@/lib/utils';

interface MoodSelectorProps {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}

const moods = [
  { value: 1, emoji: '😢', label: 'Terrible' },
  { value: 2, emoji: '😔', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Amazing' },
];

export function MoodSelector({ value, onChange, disabled }: MoodSelectorProps) {
  const handleSelect = (moodValue: number) => {
    // Toggle off if clicking the same mood
    if (value === moodValue) {
      onChange(null);
    } else {
      onChange(moodValue);
    }
  };

  return (
    <div className="flex items-center justify-between gap-1 w-full">
      {/* N/A option */}
      <button
        type="button"
        onClick={() => onChange(null)}
        disabled={disabled}
        className={cn(
          'flex flex-col items-center gap-0.5 rounded-lg border-2 p-1.5 sm:p-2 transition-all flex-1 min-w-0',
          'hover:bg-muted/50 active:scale-95',
          value === null
            ? 'border-muted-foreground/50 bg-muted/50'
            : 'border-transparent',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md bg-muted text-[9px] sm:text-[10px] font-medium text-muted-foreground">
          N/A
        </div>
        <span className="text-[8px] sm:text-[9px] text-muted-foreground hidden xs:block">Skip</span>
      </button>

      {/* Mood options */}
      {moods.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => handleSelect(mood.value)}
          disabled={disabled}
          className={cn(
            'flex flex-col items-center gap-0.5 rounded-lg border-2 p-1.5 sm:p-2 transition-all flex-1 min-w-0',
            'hover:bg-muted/50 active:scale-95',
            value === mood.value
              ? 'border-primary bg-primary/10'
              : 'border-transparent',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className="text-lg sm:text-xl">{mood.emoji}</span>
          <span className="text-[8px] sm:text-[9px] text-muted-foreground truncate max-w-full">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}
