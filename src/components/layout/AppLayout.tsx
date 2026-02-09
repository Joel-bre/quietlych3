import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';
import { InstallBanner } from '@/components/pwa/InstallBanner';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/insights', label: 'Insights', icon: Sparkles },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center">
            <img src={logo} alt="Quietly" className="h-10 w-auto dark:brightness-100 brightness-90 contrast-125" />
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container px-4 py-6 pb-24 md:pb-6">{children}</div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="sticky bottom-0 z-50 border-t bg-card/95 backdrop-blur-sm md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Side Navigation (Desktop) */}
      <nav className="fixed left-0 top-14 hidden h-[calc(100vh-3.5rem)] w-56 border-r bg-card p-4 md:block">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* PWA Install Banner */}
      <InstallBanner />

      {/* Desktop Content Offset */}
      <style>{`
        @media (min-width: 768px) {
          main > .container {
            margin-left: 14rem;
            max-width: calc(100% - 14rem);
          }
        }
      `}</style>
    </div>
  );
}
