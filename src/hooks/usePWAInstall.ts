import { useState, useEffect, useCallback } from 'react';

const DISMISS_KEY = 'sibima_install_dismissed';
const COOLDOWN_DAYS = 7;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface UsePWAInstallReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  showPrompt: boolean;
  promptInstall: () => Promise<void>;
  dismissPrompt: () => void;
  setShowPrompt: (show: boolean) => void;
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // Check if app is running in standalone mode (already installed)
  const checkIfInstalled = useCallback(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    return Boolean(isStandalone);
  }, []);

  // Check if dismissed within cooldown period (7 days)
  const isDismissedRecently = useCallback(() => {
    try {
      const dismissedTimeStr = localStorage.getItem(DISMISS_KEY);
      if (!dismissedTimeStr) return false;
      const dismissedTime = parseInt(dismissedTimeStr, 10);
      if (isNaN(dismissedTime)) return false;
      return Date.now() - dismissedTime < COOLDOWN_MS;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // 1. Detect if installed
    const installed = checkIfInstalled();
    setIsInstalled(installed);
    if (installed) {
      setShowPrompt(false);
      return;
    }

    // 2. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafariBrowser = /safari/.test(userAgent) && !/chrome|crios|fxios|edge|edg/.test(userAgent);
    const isIosSafari = isIosDevice && isSafariBrowser && !installed;
    setIsIOS(isIosSafari);

    // 3. Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Only show prompt if not recently dismissed
      if (!isDismissedRecently()) {
        // Show after a 6-second delay to not interrupt initial page load
        const timer = setTimeout(() => {
          if (!checkIfInstalled()) {
            setShowPrompt(true);
          }
        }, 6000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. If iOS Safari and not dismissed, show prompt after delay
    if (isIosSafari && !isDismissedRecently()) {
      const iosTimer = setTimeout(() => {
        if (!checkIfInstalled()) {
          setShowPrompt(true);
        }
      }, 7000);
      return () => {
        clearTimeout(iosTimer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkIfInstalled, isDismissedRecently]);

  // Trigger native install prompt
  const promptInstall = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        // On iOS, keep prompt open to guide user
        return;
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowPrompt(false);
      } else {
        dismissPrompt();
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('PWA install error:', err);
      dismissPrompt();
    }
  };

  // Dismiss and save 7-day cooldown
  const dismissPrompt = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // ignore
    }
  };

  return {
    isInstallable: Boolean(deferredPrompt) || isIOS,
    isInstalled,
    isIOS,
    showPrompt,
    promptInstall,
    dismissPrompt,
    setShowPrompt,
  };
}
