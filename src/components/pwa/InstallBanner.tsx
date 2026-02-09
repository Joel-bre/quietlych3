import { useState, useEffect } from 'react';
import { X, Download, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { cn } from '@/lib/utils';

const ENGAGEMENT_KEY = 'pwa-engagement-met';

export function InstallBanner() {
  const { canShowPrompt, isIOS, promptInstall, dismissPrompt } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has met engagement threshold
    const hasEngagement = localStorage.getItem(ENGAGEMENT_KEY) === 'true';
    
    if (canShowPrompt && hasEngagement) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [canShowPrompt]);

  // Track engagement (called from outside when user completes first entry)
  useEffect(() => {
    const checkEngagement = () => {
      const visitCount = parseInt(localStorage.getItem('visit-count') || '0', 10);
      localStorage.setItem('visit-count', (visitCount + 1).toString());
      
      if (visitCount >= 2) {
        localStorage.setItem(ENGAGEMENT_KEY, 'true');
      }
    };
    
    checkEngagement();
  }, []);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      dismissPrompt();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-16 left-4 right-4 z-40 md:bottom-4 md:left-auto md:right-4 md:max-w-sm',
        'rounded-xl border bg-card p-4 shadow-lg',
        'transition-all duration-300 ease-out',
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
      <button
        onClick={handleClose}
        className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 pr-4">
          <h3 className="font-semibold text-foreground">Install Quietly</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add to your home screen for quick access and offline support.
          </p>
        </div>
      </div>

      {isIOS ? (
        <div className="mt-4 space-y-2 rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium text-foreground">To install:</p>
          <ol className="space-y-1.5 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Share className="h-4 w-4 flex-shrink-0" />
              <span>Tap the Share button</span>
            </li>
            <li className="flex items-center gap-2">
              <Plus className="h-4 w-4 flex-shrink-0" />
              <span>Select "Add to Home Screen"</span>
            </li>
          </ol>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <Button onClick={handleInstall} className="flex-1">
            Install App
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Later
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper to mark engagement when user completes first journal entry
export function markEngagement() {
  localStorage.setItem(ENGAGEMENT_KEY, 'true');
}
