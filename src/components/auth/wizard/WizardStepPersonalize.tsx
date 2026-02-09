import { useState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WizardStepPersonalizeProps {
  onBack: () => void;
  onComplete: (interests: string[]) => void;
  isLoading?: boolean;
}

const INTERESTS = [
  { id: "reflection", label: "Daily reflection", emoji: "🪞" },
  { id: "gratitude", label: "Gratitude practice", emoji: "🙏" },
  { id: "mood", label: "Mood tracking", emoji: "📊" },
  { id: "growth", label: "Personal growth", emoji: "🌱" },
];

export function WizardStepPersonalize({ onBack, onComplete, isLoading }: WizardStepPersonalizeProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleComplete = () => {
    onComplete(selectedInterests);
  };

  const handleSkip = () => {
    onComplete([]);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] px-6 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0 -ml-2"
          disabled={isLoading}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {/* Progress dots */}
        <div className="flex gap-2 flex-1 justify-center pr-10">
          <div className="w-2 h-2 rounded-full bg-primary/30" />
          <div className="w-2 h-2 rounded-full bg-primary/30" />
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            What brings you here?
          </h2>
          <p className="text-muted-foreground">
            This helps us personalize your experience
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest.id);
            return (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                disabled={isLoading}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  "hover:border-primary/50 hover:bg-primary/5",
                  isSelected 
                    ? "border-primary bg-primary/10" 
                    : "border-border bg-card"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
                <span className="text-2xl">{interest.emoji}</span>
                <span className="text-sm font-medium text-foreground">
                  {interest.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        <div className="space-y-3">
          <Button 
            onClick={handleComplete}
            size="lg" 
            className="w-full h-14 text-lg font-medium rounded-xl shadow-lg shadow-primary/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up...
              </>
            ) : (
              "Start Journaling"
            )}
          </Button>
          
          <Button
            onClick={handleSkip}
            variant="ghost"
            size="lg"
            className="w-full h-12 text-muted-foreground"
            disabled={isLoading}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
