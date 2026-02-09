import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import logo from '@/assets/logo.png';

export function MobileLoginForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      // Invalidate all queries to force fresh data fetch
      queryClient.invalidateQueries();
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-60 h-60 bg-secondary/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-20 right-1/4 w-40 h-40 bg-accent/20 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 relative z-10">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <img src={logo} alt="Quietly" className="w-48 h-auto mx-auto dark:brightness-100 brightness-90 contrast-125" />
          </div>
          <p className="text-muted-foreground text-lg">Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-14 text-base rounded-xl border-border/60 bg-card/50 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-medium">
              Password
            </Label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="rounded-xl border-border/60 bg-card/50 backdrop-blur-sm"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        {/* Links */}
        <div className="mt-8 flex flex-col gap-4 text-center">
          <Link
            to="/forgot-password"
            className="text-muted-foreground hover:text-primary transition-colors text-base"
          >
            Forgot your password?
          </Link>
          <p className="text-muted-foreground text-base">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
