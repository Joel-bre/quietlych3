import { Sparkles, Mic, Calendar, Heart } from 'lucide-react';
import logo from '@/assets/logo.png';

interface MarketingPanelProps {
  variant?: 'login' | 'signup';
  compact?: boolean;
}

export function MarketingPanel({ variant = 'login', compact = false }: MarketingPanelProps) {
  if (compact) {
    return (
      <div className="w-full space-y-4 animate-fade-in">
        {/* Logo and Tagline Card */}
        <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-4 text-center">
          <img
            src={logo}
            alt="Quietly Logo"
            className="h-10 w-auto mx-auto mb-2 dark:brightness-100 brightness-90 contrast-125"
          />
          <p className="text-sm text-muted-foreground">
            Your private space to reflect, grow, and understand yourself better.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="space-y-3">
          <div 
            className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-4 animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">AI-Powered Insights</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Get personalized analysis and patterns from your journal entries to understand yourself better.
                </p>
              </div>
            </div>
          </div>

          <div 
            className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-4 animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">Voice Dictation</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Speak your thoughts naturally and let AI transcribe them into your journal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 w-full">
      {/* Logo and Brand */}
      <div className="animate-fade-in mb-12">
        <div className="mb-6">
          <img src={logo} alt="Quietly" className="h-16 w-auto drop-shadow-lg dark:brightness-100 brightness-90 contrast-125" />
        </div>
        <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
          Your private space for daily reflection and personal growth, enhanced by AI insights.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="space-y-4 mb-12">
        <FeatureCard
          icon={Sparkles}
          title="AI-Powered Insights"
          description="Get personalized summaries and ask questions about your journal entries to discover patterns in your thoughts."
          delay={100}
        />
        <FeatureCard
          icon={Mic}
          title="Voice Dictation"
          description="Speak your thoughts naturally — no typing required. Perfect for capturing reflections on the go."
          delay={200}
        />
      </div>

      {/* App Mockup Preview */}
      <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
        <AppMockup />
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay?: number;
}

function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <div 
      className="flex gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 animate-fade-in hover:bg-card/70 transition-colors"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function AppMockup() {
  return (
    <div className="relative max-w-sm">
      {/* Phone frame */}
      <div className="bg-card rounded-2xl border border-border shadow-2xl p-4 transform rotate-1 hover:rotate-0 transition-transform duration-500">
        {/* Status bar mockup */}
        <div className="flex justify-between items-center mb-4 px-2 text-xs text-muted-foreground">
          <span>9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-2 bg-muted rounded-sm" />
            <div className="w-4 h-2 bg-muted rounded-sm" />
            <div className="w-6 h-3 bg-primary/50 rounded-sm" />
          </div>
        </div>
        
        {/* App header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Today's Entry</div>
            <div className="text-xs text-muted-foreground">January 17, 2026</div>
          </div>
        </div>

        {/* Journal fields mockup */}
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-[hsl(var(--journal-feel)/0.1)] border border-[hsl(var(--journal-feel)/0.2)]">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-3.5 w-3.5 text-[hsl(var(--journal-feel))]" />
              <span className="text-xs font-medium text-[hsl(var(--journal-feel))]">How do you feel?</span>
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              Feeling grateful for the small moments today. Had a great conversation with...
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-[hsl(var(--journal-grateful)/0.1)] border border-[hsl(var(--journal-grateful)/0.2)]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--journal-grateful))]" />
              <span className="text-xs font-medium text-[hsl(var(--journal-grateful))]">Grateful for</span>
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              My morning coffee ritual, the sunshine through my window, and...
            </div>
          </div>

          {/* Voice recording indicator */}
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
            <div className="relative">
              <Mic className="h-4 w-4 text-primary" />
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xs text-primary font-medium">Recording...</span>
          </div>
        </div>
      </div>

      {/* Decorative shadow/glow */}
      <div className="absolute -inset-4 bg-primary/5 rounded-3xl -z-10 blur-xl" />
    </div>
  );
}

// Exported mobile version of the mockup with specific styling
export function MobileAppMockup() {
  return (
    <div className="relative animate-fade-in" style={{ animationDelay: '400ms' }}>
      {/* Glow effect behind */}
      <div className="absolute -inset-4 bg-gradient-to-t from-primary/10 via-primary/5 to-transparent rounded-3xl blur-2xl -z-10" />
      
      {/* Scaled phone frame */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-xl p-3 mx-auto max-w-[280px]">
        {/* Status bar mockup */}
        <div className="flex justify-between items-center mb-3 px-1.5 text-[10px] text-muted-foreground">
          <span>9:41</span>
          <div className="flex gap-1">
            <div className="w-3 h-1.5 bg-muted rounded-sm" />
            <div className="w-3 h-1.5 bg-muted rounded-sm" />
            <div className="w-5 h-2 bg-primary/50 rounded-sm" />
          </div>
        </div>
        
        {/* App header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Calendar className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <div className="text-xs font-medium text-foreground">Today's Entry</div>
            <div className="text-[10px] text-muted-foreground">January 17, 2026</div>
          </div>
        </div>

        {/* Journal fields mockup */}
        <div className="space-y-2">
          <div className="p-2.5 rounded-lg bg-[hsl(var(--journal-feel)/0.1)] border border-[hsl(var(--journal-feel)/0.2)]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Heart className="h-3 w-3 text-[hsl(var(--journal-feel))]" />
              <span className="text-[10px] font-medium text-[hsl(var(--journal-feel))]">How do you feel?</span>
            </div>
            <div className="text-[10px] text-muted-foreground line-clamp-1">
              Feeling grateful for the small moments today...
            </div>
          </div>
          
          <div className="p-2.5 rounded-lg bg-[hsl(var(--journal-grateful)/0.1)] border border-[hsl(var(--journal-grateful)/0.2)]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3 w-3 text-[hsl(var(--journal-grateful))]" />
              <span className="text-[10px] font-medium text-[hsl(var(--journal-grateful))]">Grateful for</span>
            </div>
            <div className="text-[10px] text-muted-foreground line-clamp-1">
              My morning coffee ritual, the sunshine...
            </div>
          </div>

          {/* Voice recording indicator */}
          <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <div className="relative">
              <Mic className="h-3 w-3 text-primary" />
              <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
            </div>
            <span className="text-[10px] text-primary font-medium">Recording...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
