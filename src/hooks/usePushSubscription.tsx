import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  permissionState: NotificationPermission | null;
}

let cachedVapidKey: string | null = null;

async function getVapidPublicKey(): Promise<string | null> {
  if (cachedVapidKey) return cachedVapidKey;
  
  try {
    const data = await api.get<{ publicKey: string }>('/api/vapid-key');
    cachedVapidKey = data?.publicKey || null;
    return cachedVapidKey;
  } catch (error) {
    console.error('Failed to get VAPID key:', error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    error: null,
    permissionState: null,
  });

  const checkSupport = useCallback(() => {
    const isSupported = 
      'serviceWorker' in navigator && 
      'PushManager' in window && 
      'Notification' in window;
    
    return isSupported;
  }, []);

  const checkSubscription = useCallback(async () => {
    if (!checkSupport() || !user) {
      setState(prev => ({ ...prev, isLoading: false, isSupported: checkSupport() }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const permission = Notification.permission;
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState({
        isSupported: true,
        isSubscribed: !!subscription,
        isLoading: false,
        error: null,
        permissionState: permission,
      });
    } catch (error) {
      console.error('Error checking push subscription:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to check subscription status',
      }));
    }
  }, [user, checkSupport]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    const vapidPublicKey = await getVapidPublicKey();
    
    if (!user || !vapidPublicKey) {
      setState(prev => ({ ...prev, error: 'Missing configuration' }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          permissionState: permission,
          error: permission === 'denied' 
            ? 'Notification permission denied. Please enable in browser settings.'
            : 'Notification permission not granted',
        }));
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      const subscriptionJson = subscription.toJSON();
      
      if (!subscriptionJson.endpoint || !subscriptionJson.keys?.p256dh || !subscriptionJson.keys?.auth) {
        throw new Error('Invalid subscription data');
      }

      await api.post('/api/push-subscription', {
        endpoint: subscriptionJson.endpoint,
        p256dh: subscriptionJson.keys.p256dh,
        auth: subscriptionJson.keys.auth,
      });

      setState({
        isSupported: true,
        isSubscribed: true,
        isLoading: false,
        error: null,
        permissionState: 'granted',
      });
      
      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe',
      }));
      return false;
    }
  }, [user]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await api.delete('/api/push-subscription', { endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
        error: null,
      }));
      
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to unsubscribe',
      }));
      return false;
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    checkSubscription,
  };
}
