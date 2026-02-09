import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JournalFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  colorClass: string;
  icon: React.ReactNode;
  isRecording: boolean;
  isTranscribing: boolean;
  activeField: string | null;
  onStartRecording: (fieldId: string) => void;
  onStopRecording: () => Promise<string | null>;
  disabled?: boolean;
}

export function JournalField({
  id,
  label,
  placeholder,
  value,
  onChange,
  colorClass,
  icon,
  isRecording,
  isTranscribing,
  activeField,
  onStartRecording,
  onStopRecording,
  disabled,
}: JournalFieldProps) {
  const isActiveField = activeField === id;
  const isFieldRecording = isRecording && isActiveField;
  const isFieldTranscribing = isTranscribing && isActiveField;

  const handleMicClick = async () => {
    if (isFieldRecording) {
      const text = await onStopRecording();
      if (text) {
        onChange(value ? `${value}\n${text}` : text);
      }
    } else if (!isRecording && !isTranscribing) {
      onStartRecording(id);
    }
  };

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn('flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md', colorClass)}>
            {icon}
          </div>
          <label htmlFor={id} className="text-sm font-medium text-foreground truncate">
            {label}
          </label>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-10 w-10 sm:h-8 sm:w-8 flex-shrink-0 transition-colors',
            isFieldRecording && 'bg-destructive text-destructive-foreground animate-pulse-soft',
            isFieldTranscribing && 'bg-primary/20'
          )}
          onClick={handleMicClick}
          disabled={isTranscribing || (isRecording && !isActiveField)}
        >
          {isFieldTranscribing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isFieldRecording ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </div>
      <Textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isFieldRecording || isFieldTranscribing}
        className={cn(
          'min-h-[100px] resize-none border-2 transition-all',
          'focus-visible:ring-0 focus-visible:border-primary',
          isFieldRecording && 'border-destructive/50 bg-destructive/5',
          isFieldTranscribing && 'border-primary/50 bg-primary/5'
        )}
      />
    </div>
  );
}
