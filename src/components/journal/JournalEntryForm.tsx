import { format, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ChevronLeft, ChevronRight, Mic, MicOff, Check } from 'lucide-react';
import { Heart, Trophy, Lightbulb, Star, Mountain, Laugh, FileText } from 'lucide-react';
import { JournalField } from './JournalField';
import { MoodSelector } from './MoodSelector';
import { useJournalEntry, JournalEntry } from '@/hooks/useJournalEntry';
import { useVoiceDictation } from '@/hooks/useVoiceDictation';
import { cn } from '@/lib/utils';

interface JournalEntryFormProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

const fields = [
  {
    id: 'gratefulFor',
    label: 'Grateful for',
    placeholder: 'What are you thankful for today?',
    colorClass: 'bg-journal-grateful/20 text-journal-grateful',
    icon: <Star className="h-3.5 w-3.5" />,
  },
  {
    id: 'achievements',
    label: 'Achievements',
    placeholder: 'What did you accomplish today?',
    colorClass: 'bg-journal-achieve/20 text-journal-achieve',
    icon: <Trophy className="h-3.5 w-3.5" />,
  },
  {
    id: 'challenges',
    label: 'Challenges',
    placeholder: 'What was difficult today?',
    colorClass: 'bg-journal-challenge/20 text-journal-challenge',
    icon: <Mountain className="h-3.5 w-3.5" />,
  },
  {
    id: 'learnings',
    label: 'Learnings',
    placeholder: 'What went well? What did you learn?',
    colorClass: 'bg-journal-learn/20 text-journal-learn',
    icon: <Lightbulb className="h-3.5 w-3.5" />,
  },
  {
    id: 'somethingFunny',
    label: 'Something funny',
    placeholder: 'Any humor or joy from today?',
    colorClass: 'bg-journal-funny/20 text-journal-funny',
    icon: <Laugh className="h-3.5 w-3.5" />,
  },
  {
    id: 'generalNotes',
    label: 'General notes',
    placeholder: 'Anything else on your mind...',
    colorClass: 'bg-journal-notes/20 text-journal-notes',
    icon: <FileText className="h-3.5 w-3.5" />,
  },
];

export function JournalEntryForm({ date, onDateChange }: JournalEntryFormProps) {
  const { entry, loading, saving, isDirty, updateField } = useJournalEntry(date);
  const {
    isRecording,
    isTranscribing,
    activeField,
    startRecording,
    stopRecording,
  } = useVoiceDictation();

  const goToPreviousDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isFeelFieldRecording = isRecording && activeField === 'howDoYouFeel';
  const isFeelFieldTranscribing = isTranscribing && activeField === 'howDoYouFeel';

  const handleFeelMicClick = async () => {
    if (isFeelFieldRecording) {
      const text = await stopRecording();
      if (text) {
        const currentValue = entry?.howDoYouFeel || '';
        updateField('howDoYouFeel', currentValue ? `${currentValue}\n${text}` : text);
      }
    } else if (!isRecording && !isTranscribing) {
      startRecording('howDoYouFeel');
    }
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Date Navigation */}
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousDay}
              className="h-10 w-10 sm:h-8 sm:w-8"
            >
              <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            <div className="text-center min-w-0">
              <h2 className="text-base sm:text-lg font-semibold truncate">
                {isToday(date) ? "Today's Reflection" : format(date, 'EEEE')}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {format(date, 'MMM d, yyyy')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextDay}
              className="h-10 w-10 sm:h-8 sm:w-8"
              disabled={isToday(date)}
            >
              <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>
          
          {/* Action Buttons & Status */}
          <div className="flex items-center justify-center gap-2">
            {!isToday(date) && (
              <Button variant="outline" size="sm" onClick={goToToday} className="h-10 sm:h-9">
                Today
              </Button>
            )}
            {/* Auto-save status indicator */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-[80px] justify-end">
              {saving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : isDirty ? (
                <span className="text-muted-foreground/70">Unsaved</span>
              ) : (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Saved</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* How are you feeling - Special field with mood selector */}
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-journal-feel/20 text-journal-feel">
                <Heart className="h-3.5 w-3.5" />
              </div>
              <label htmlFor="how_do_you_feel" className="text-sm font-medium text-foreground">
                How are you feeling?
              </label>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 transition-colors',
                isFeelFieldRecording && 'bg-destructive text-destructive-foreground animate-pulse-soft',
                isFeelFieldTranscribing && 'bg-primary/20'
              )}
              onClick={handleFeelMicClick}
              disabled={isTranscribing || (isRecording && activeField !== 'howDoYouFeel')}
            >
              {isFeelFieldTranscribing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isFeelFieldRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Mood Selector */}
          <MoodSelector
            value={entry?.moodRating ?? null}
            onChange={(value) => updateField('moodRating', value)}
          />
          
          {/* Text field */}
          <Textarea
            id="how_do_you_feel"
            placeholder="Describe your emotional state today..."
            value={entry?.howDoYouFeel || ''}
            onChange={(e) => updateField('howDoYouFeel', e.target.value)}
            disabled={isFeelFieldRecording || isFeelFieldTranscribing}
            className={cn(
              'min-h-[100px] resize-none border-2 transition-all',
              'focus-visible:ring-0 focus-visible:border-primary',
              isFeelFieldRecording && 'border-destructive/50 bg-destructive/5',
              isFeelFieldTranscribing && 'border-primary/50 bg-primary/5'
            )}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(entry?.howDoYouFeel?.length || 0)}/500
          </p>
        </div>

        {/* Other fields */}
        {fields.map((field) => (
          <JournalField
            key={field.id}
            id={field.id}
            label={field.label}
            placeholder={field.placeholder}
            value={entry?.[field.id as keyof JournalEntry] as string || ''}
            onChange={(value) => updateField(field.id as keyof JournalEntry, value)}
            colorClass={field.colorClass}
            icon={field.icon}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            activeField={activeField}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            
          />
        ))}
      </CardContent>
    </Card>
  );
}
