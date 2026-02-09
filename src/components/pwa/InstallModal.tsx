import { useState } from 'react';
import { Download, Share, Plus, Smartphone, Wifi, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const SHOWN_KEY = 'pwa-signup-modal-shown';

interface InstallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallModal({ open, onOpenChange }: InstallModalProps) {
  const { isIOS, promptInstall } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    const accepted = await promptInstall();
    setInstalling(false);
    
    if (accepted) {
      onOpenChange(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  const benefits = [
    { icon: Smartphone, text: 'Quick launch from home screen' },
    { icon: Wifi, text: 'Works offline' },
    { icon: Zap, text: 'Faster and smoother experience' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Download className="h-8 w-8" />
          </div>
          <DialogTitle className="text-xl">Get the full experience</DialogTitle>
          <DialogDescription>
            Install Quietly on your device for the best journaling experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {benefits.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">{text}</span>
            </div>
          ))}
        </div>

        {isIOS ? (
          <div className="space-y-3 rounded-lg bg-muted p-4">
            <p className="text-sm font-medium text-foreground">To install on iOS:</p>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">1</span>
                <Share className="h-4 w-4" />
                <span>Tap the Share button</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">2</span>
                <Plus className="h-4 w-4" />
                <span>Select "Add to Home Screen"</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">3</span>
                <span>Tap "Add" to confirm</span>
              </li>
            </ol>
            <Button variant="outline" onClick={handleSkip} className="mt-2 w-full">
              Got it
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button onClick={handleInstall} disabled={installing} className="w-full">
              {installing ? 'Installing...' : 'Install Now'}
            </Button>
            <Button variant="ghost" onClick={handleSkip}>
              Skip for now
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Check if modal should be shown after signup
export function shouldShowInstallModal(): boolean {
  return localStorage.getItem(SHOWN_KEY) !== 'true';
}

// Mark modal as shown
export function markInstallModalShown() {
  localStorage.setItem(SHOWN_KEY, 'true');
}
