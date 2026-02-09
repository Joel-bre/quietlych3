import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISS_STORAGE_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION_DAYS = 7;

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  // Detect Android
  const isAndroid = /Android/.test(navigator.userAgent);
  
  // Detect Safari browser (both iOS and macOS)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  // Detect Samsung Internet browser
  const isSamsungInternet = /SamsungBrowser/i.test(navigator.userAgent);
  
  // Detect Chrome on Android
  const isAndroidChrome = isAndroid && /Chrome/i.test(navigator.userAgent) && !isSamsungInternet;
  
  // Detect Firefox on Android
  const isFirefoxAndroid = isAndroid && /Firefox/i.test(navigator.userAgent);
  
  // Detect if on iOS Safari specifically (only Safari can install PWAs on iOS)
  const isIOSSafari = isIOS && isSafari;
  
  // Detect if using a non-Safari browser on iOS (can't install PWAs)
  const isIOSNonSafari = isIOS && !isSafari;
  
  // Detect if running as standalone (installed)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
    || (navigator as any).standalone === true;

  useEffect(() => {
    // Check if already installed
    setIsInstalled(isStandalone);

    // Check if user dismissed the prompt recently
    const dismissedAt = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (dismissedAt) {
      const dismissedDate = new Date(parseInt(dismissedAt, 10));
      const daysSinceDismiss = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < DISMISS_DURATION_DAYS) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem(DISMISS_STORAGE_KEY);
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error prompting install:', error);
      return false;
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
    setIsDismissed(true);
  }, []);

  const resetDismiss = useCallback(() => {
    localStorage.removeItem(DISMISS_STORAGE_KEY);
    setIsDismissed(false);
  }, []);

  const hasNativePrompt = !!deferredPrompt;
  const isAndroidManualInstall = isAndroid && !deferredPrompt && !isInstalled;

  // Can show install UI if:
  // - Not already installed
  // - Either has deferred prompt (Chrome/Edge), is iOS, or is Android (manual instructions)
  // - User hasn't dismissed recently
  const canInstall = !isInstalled && (hasNativePrompt || isIOS || isAndroid);
  const canShowPrompt = canInstall && !isDismissed;

  return {
    canInstall,
    canShowPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    isSafari,
    isSamsungInternet,
    isAndroidChrome,
    isFirefoxAndroid,
    isIOSSafari,
    isIOSNonSafari,
    isAndroidManualInstall,
    hasNativePrompt,
    isDismissed,
    promptInstall,
    dismissPrompt,
    resetDismiss,
  };
}
