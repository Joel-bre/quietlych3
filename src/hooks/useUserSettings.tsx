import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface UserSettings {
  id?: number;
  userId?: number;
  theme: string;
  notificationEnabled: boolean;
  notificationTime: string | null;
  timezone: string | null;
}

const defaultSettings: UserSettings = {
  theme: 'light',
  notificationEnabled: false,
  notificationTime: '20:00:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export function useUserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await api.get<UserSettings>('/api/settings');
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      if (!user || !settings) return;

      setSaving(true);
      try {
        const updatedSettings = await api.patch<UserSettings>('/api/settings', updates);
        setSettings(updatedSettings);
        toast({
          title: 'Settings saved',
          description: 'Your settings have been updated.',
        });
      } catch (error) {
        console.error('Error saving settings:', error);
        toast({
          title: 'Error saving settings',
          description: 'Could not save your settings.',
          variant: 'destructive',
        });
      } finally {
        setSaving(false);
      }
    },
    [user, settings, toast]
  );

  return {
    settings,
    loading,
    saving,
    updateSettings,
    refetch: fetchSettings,
  };
}
