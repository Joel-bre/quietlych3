import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Bell, Palette, LogOut, Loader2, AlertCircle, Download, Smartphone, Share, Plus, Wifi, Zap, CheckCircle, Database, Shield, Server, Brain, Lock, Eye, FileDown, Trash2, MoreVertical } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { TimePickerSlider } from './TimePickerSlider';
import { DataExportImport } from './DataExportImport';

export function SettingsPanel() {
  const { settings, loading, saving, updateSettings } = useUserSettings();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { 
    isSupported, 
    isSubscribed, 
    isLoading: pushLoading, 
    error: pushError,
    permissionState,
    subscribe, 
    unsubscribe 
  } = usePushSubscription();
  const { canInstall, isIOS, isIOSSafari, isIOSNonSafari, isInstalled, isAndroidManualInstall, hasNativePrompt, isSamsungInternet, promptInstall } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/api/auth/account');
      queryClient.clear();
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
      setDeleting(false);
    }
  };

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const success = await promptInstall();
      if (success) {
        toast({
          title: "App Installed",
          description: "Quietly has been added to your home screen.",
        });
      }
    } finally {
      setInstalling(false);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      // Subscribe to push notifications
      const success = await subscribe();
      if (!success) {
        toast({
          title: "Notification Error",
          description: pushError || "Failed to enable notifications. Please check your browser settings.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Notifications Enabled",
        description: "You'll receive daily journal reminders.",
      });
    } else {
      // Unsubscribe from push notifications
      await unsubscribe();
      toast({
        title: "Notifications Disabled",
        description: "You won't receive daily reminders anymore.",
      });
    }
    // Save timezone along with notification setting to ensure proper UTC conversion
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await updateSettings({ notification_enabled: enabled, timezone });
  };

  const handleTimeChange = async (time: string) => {
    // Save timezone along with time to ensure proper UTC conversion on server
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await updateSettings({ notification_time: time, timezone });
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    await updateSettings({ theme: newTheme });
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure daily reminders to write in your journal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isSupported && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>Push notifications are not supported in this browser.</p>
            </div>
          )}
          
          {permissionState === 'denied' && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>Notifications are blocked. Please enable them in your browser settings.</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="notifications">Daily Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get a push notification to remind you to journal
              </p>
            </div>
            <Switch
              id="notifications"
              checked={isSubscribed && (settings?.notification_enabled || false)}
              onCheckedChange={handleNotificationToggle}
              disabled={saving || pushLoading || !isSupported || permissionState === 'denied'}
            />
          </div>

          {isSubscribed && settings?.notification_enabled && (
            <div className="space-y-3 animate-fade-in">
              <Label>Reminder Time</Label>
              <TimePickerSlider
                value={settings?.notification_time || '20:00:00'}
                onChange={handleTimeChange}
                disabled={saving}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how your journal looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('light')}
                className="flex-1"
                disabled={saving}
              >
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('dark')}
                className="flex-1"
                disabled={saving}
              >
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Install App */}
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Download className="h-7 w-7 text-primary" />
          </div>
          <CardTitle>Get the full experience</CardTitle>
          <CardDescription>
            Install Quietly for the best journaling experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isInstalled ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">App Installed</p>
                <p className="text-sm text-muted-foreground">You're using the installed version</p>
              </div>
            </div>
          ) : (
            <>
              {/* Benefits */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Smartphone className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">Quick launch from home screen</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Wifi className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">Works offline</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">Faster and smoother experience</span>
                </div>
              </div>

              {/* Install action - iOS always shows manual instructions, others get button if available */}
              {isIOSNonSafari ? (
                <div className="rounded-xl bg-amber-500/10 p-4 text-center">
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Open in Safari to install</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PWA installation is only available in Safari on iOS
                  </p>
                </div>
              ) : isIOS ? (
                <div className="space-y-3 rounded-xl bg-muted p-4">
                  <p className="text-sm font-medium text-center">Follow these steps in Safari:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        1
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Share className="h-4 w-4 text-muted-foreground" />
                        <span>Tap the Share button</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        2
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                        <span>Select "Add to Home Screen"</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        3
                      </div>
                      <span className="text-sm">Tap "Add" to confirm</span>
                    </div>
                  </div>
                </div>
              ) : hasNativePrompt ? (
                <Button onClick={handleInstall} className="w-full" size="lg" disabled={installing} data-testid="button-install-pwa">
                  {installing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Install Now
                    </>
                  )}
                </Button>
              ) : isAndroidManualInstall ? (
                <div className="space-y-3 rounded-xl bg-muted p-4">
                  <p className="text-sm font-medium text-center">
                    {isSamsungInternet ? 'In Samsung Internet:' : 'In your browser:'}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        1
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        <span>Tap the menu button (three dots)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        2
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                        <span>{isSamsungInternet ? 'Tap "Add page to"' : 'Tap "Add to Home screen"'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        3
                      </div>
                      <span className="text-sm">{isSamsungInternet ? 'Select "Home screen"' : 'Tap "Add" to confirm'}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {/* Your Data */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Your Data
          </CardTitle>
          <CardDescription>Export or import your journal entries</CardDescription>
        </CardHeader>
        <CardContent>
          <DataExportImport />
        </CardContent>
      </Card>

      {/* Security & Privacy */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
          <CardDescription>How we protect your most personal thoughts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                <Server className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Swiss Hosting</p>
                <p className="text-xs text-muted-foreground">Your data is stored on servers located in Zurich, Switzerland. Swiss privacy law is among the strongest in the world.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Swiss AI Processing</p>
                <p className="text-xs text-muted-foreground">AI insights are powered by Infomaniak, a Swiss provider. Your entries are processed on demand and are not used to train AI models.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Encrypted at Rest</p>
                <p className="text-xs text-muted-foreground">Your journal entries are encrypted in the database and all connections use TLS encryption in transit.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                <Eye className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">No Tracking or Selling</p>
                <p className="text-xs text-muted-foreground">We don't use third-party analytics, trackers, or advertising. Your data is never shared, sold, or monetized in any way.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">GDPR & Swiss nDSG Compliant</p>
                <p className="text-xs text-muted-foreground">We follow the principles of European GDPR and the Swiss Federal Act on Data Protection (nDSG). You have the right to access, export, or delete your data at any time.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                <FileDown className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Your Data, Your Choice</p>
                <p className="text-xs text-muted-foreground">Export all your journal entries anytime from the "Your Data" section above. Want to leave? You can download everything and request full deletion.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          <Separator />

          <Button variant="destructive" onClick={signOut} className="w-full" data-testid="button-signout">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>

          <Separator />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full text-destructive border-destructive/30" data-testid="button-delete-account">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account & Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account, all journal entries, settings, and notification subscriptions. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground"
                  data-testid="button-confirm-delete"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Yes, delete everything'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
