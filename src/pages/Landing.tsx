import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Sparkles, Mic, ChevronRight, Lock, Server, Brain, FileDown, Eye } from 'lucide-react';
import logo from '@/assets/logo.png';

const features = [
  {
    icon: Shield,
    title: 'Private & Secure',
    description: 'Your thoughts stay yours. We prioritize your privacy with secure, encrypted journaling.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Insights',
    description: 'Understand yourself better with intelligent analysis of your mood patterns and reflections.',
  },
  {
    icon: Mic,
    title: 'Voice Dictation',
    description: 'Speak your thoughts naturally. Our voice-to-text makes journaling effortless.',
  },
];

const steps = [
  { number: '01', title: 'Create your account', description: 'Sign up in seconds with just your email' },
  { number: '02', title: 'Write or speak', description: 'Capture your daily reflections your way' },
  { number: '03', title: 'Grow & understand', description: 'Get AI insights and track your journey' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between px-4">
          <img src={logo} alt="Quietly" className="h-10 w-auto dark:brightness-100 brightness-90 contrast-125" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[calc(100vh-56px)] flex items-center justify-center">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="landing-orb landing-orb-1" />
          <div className="landing-orb landing-orb-2" />
          <div className="landing-orb landing-orb-3" />
        </div>

        <div className="container relative z-10 px-4 py-12">
          <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
            {/* Logo with glow effect */}
            <div className="relative px-4">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <img 
                src={logo} 
                alt="Quietly" 
                className="relative w-64 md:w-80 h-auto dark:brightness-100 brightness-90 contrast-125" 
              />
            </div>

            {/* Tagline */}
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your private space to reflect and grow
            </p>

            {/* Feature bullets */}
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Daily reflection prompts</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>AI-powered insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Private & secure</span>
              </div>
            </div>

            {/* CTA */}
            <div className="w-full space-y-4 pt-4">
              <Button size="lg" className="w-full sm:w-auto h-14 text-lg font-medium rounded-xl shadow-lg shadow-primary/20" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Journaling made simple
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to build a meaningful journaling habit, nothing you don't.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/50"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              See it in action
            </h2>
            <p className="mt-4 text-muted-foreground">
              A glimpse into your future journaling experience
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="group flex flex-col items-center">
              <div className="overflow-hidden rounded-2xl border bg-card shadow-lg transition-transform hover:scale-[1.02]">
                <img 
                  src="/screenshots/journal-entry.png" 
                  alt="Daily Journal Entry" 
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">Daily Reflections</p>
            </div>
            <div className="group flex flex-col items-center">
              <div className="overflow-hidden rounded-2xl border bg-card shadow-lg transition-transform hover:scale-[1.02]">
                <img 
                  src="/screenshots/mood-drivers.png" 
                  alt="Mood Drivers Analysis" 
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">Mood Patterns</p>
            </div>
            <div className="group flex flex-col items-center">
              <div className="overflow-hidden rounded-2xl border bg-card shadow-lg transition-transform hover:scale-[1.02]">
                <img 
                  src="/screenshots/ai-insights.png" 
                  alt="AI Insights" 
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">AI Insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start your journaling journey in three simple steps
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-border" />
                )}
                <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Swiss Privacy Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your privacy, Swiss-made
            </h2>
            <p className="mt-4 text-muted-foreground">
              Quietly is built with privacy at its core. Your most personal thoughts deserve the strongest protection -- and that's exactly what Swiss data sovereignty provides.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Server className="h-5 w-5" />
              </div>
              <h3 className="font-semibold" data-testid="text-privacy-hosted">Hosted in Switzerland</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Your data is stored on servers located in Zurich, Switzerland -- protected by Swiss privacy law.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-semibold" data-testid="text-privacy-ai">Swiss AI Processing</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                AI analysis is powered by Infomaniak, a Swiss provider. Your entries are processed on demand and are not used to train AI models.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold" data-testid="text-privacy-compliance">GDPR & nDSG Principles</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Built following the principles of European GDPR and the Swiss Federal Act on Data Protection (nDSG).
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="font-semibold" data-testid="text-privacy-notracking">No Tracking, No Selling</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                We never sell, share, or monetize your data. No third-party trackers. No profiling. Ever.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-semibold" data-testid="text-privacy-encrypted">Encrypted & Secure</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Your journal entries are encrypted at rest and transmitted over secure connections.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileDown className="h-5 w-5" />
              </div>
              <h3 className="font-semibold" data-testid="text-privacy-export">Export Anytime</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Your data belongs to you. Download or delete everything whenever you want -- no questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="landing-orb landing-orb-2" style={{ opacity: 0.3 }} />
        </div>

        <div className="container relative z-10 px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Start your journey today
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join our growing community of mindful journalers.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/signup">
                  Get Started Free
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free to use · No credit card required
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <img src={logo} alt="Quietly" className="h-8 w-auto dark:brightness-100 brightness-90 contrast-125" />
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <a href="mailto:hello@quietly.app" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Quietly
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
