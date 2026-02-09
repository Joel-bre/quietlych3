import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface TimePickerSliderProps {
  value: string; // Format: "HH:MM:SS" or "HH:MM"
  onChange: (time: string) => void;
  disabled?: boolean;
}

export function TimePickerSlider({ value, onChange, disabled }: TimePickerSliderProps) {
  // Parse the initial time value
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return {
      hours: hours % 12 || 12, // Convert to 12-hour format
      minutes: Math.floor(minutes / 15) * 15, // Round to nearest 15
      isPM: hours >= 12,
    };
  };

  const initialTime = parseTime(value || '20:00:00');
  const [hours, setHours] = useState(initialTime.hours);
  const [minutes, setMinutes] = useState(initialTime.minutes);
  const [isPM, setIsPM] = useState(initialTime.isPM);

  // Convert slider value (0-47) to hours and minutes
  const sliderToTime = (sliderValue: number) => {
    const totalMinutes = sliderValue * 15;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return { hours: h === 0 ? 12 : h, minutes: m };
  };

  // Convert hours and minutes to slider value (0-47)
  const timeToSlider = (h: number, m: number) => {
    const adjustedHours = h === 12 ? 0 : h;
    return (adjustedHours * 60 + m) / 15;
  };

  // Format time for display
  const formatDisplayTime = () => {
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${hours}:${displayMinutes}`;
  };

  // Convert to 24-hour format for database
  const to24Hour = (h: number, m: number, pm: boolean): string => {
    let hour24 = h;
    if (pm && h !== 12) {
      hour24 = h + 12;
    } else if (!pm && h === 12) {
      hour24 = 0;
    }
    return `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
  };

  // Update parent when time changes
  useEffect(() => {
    const newTime = to24Hour(hours, minutes, isPM);
    if (newTime !== value) {
      onChange(newTime);
    }
  }, [hours, minutes, isPM]);

  // Update local state when value prop changes
  useEffect(() => {
    const parsed = parseTime(value || '20:00:00');
    setHours(parsed.hours);
    setMinutes(parsed.minutes);
    setIsPM(parsed.isPM);
  }, [value]);

  const handleSliderChange = (values: number[]) => {
    const time = sliderToTime(values[0]);
    setHours(time.hours);
    setMinutes(time.minutes);
  };

  const handlePeriodChange = (pm: boolean) => {
    setIsPM(pm);
  };

  const sliderValue = timeToSlider(hours, minutes);

  return (
    <div className={cn(
      "rounded-xl border bg-card p-5 space-y-5 transition-opacity",
      disabled && "opacity-50 pointer-events-none"
    )}>
      {/* Time Display */}
      <div className="text-center">
        <div className="text-4xl font-semibold tracking-tight text-foreground">
          {formatDisplayTime()}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {isPM ? 'PM' : 'AM'}
        </div>
      </div>

      {/* AM/PM Toggle */}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => handlePeriodChange(false)}
          disabled={disabled}
          className={cn(
            "px-5 py-2 rounded-lg text-sm font-medium transition-all",
            !isPM
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => handlePeriodChange(true)}
          disabled={disabled}
          className={cn(
            "px-5 py-2 rounded-lg text-sm font-medium transition-all",
            isPM
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          PM
        </button>
      </div>

      {/* Time Slider */}
      <div className="px-1 space-y-3">
        <Slider
          value={[sliderValue]}
          onValueChange={handleSliderChange}
          min={0}
          max={47}
          step={1}
          disabled={disabled}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>12:00</span>
          <span>3:00</span>
          <span>6:00</span>
          <span>9:00</span>
          <span>11:45</span>
        </div>
      </div>
    </div>
  );
}
