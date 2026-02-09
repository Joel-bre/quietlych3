import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

interface WizardStepWelcomeProps {
  onNext: () => void;
}

export function WizardStepWelcome({ onNext }: WizardStepWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 py-12 animate-fade-in">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm">
        {/* Logo */}
        <div className="relative px-4">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <img 
            src={logo} 
            alt="Quietly" 
            className="relative w-64 h-auto dark:brightness-100 brightness-90 contrast-125"
          />
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <p className="text-xl text-muted-foreground leading-relaxed">
            Your private space to reflect and grow
          </p>
        </div>

        {/* Features */}
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
          <Button 
            onClick={onNext} 
            size="lg" 
            className="w-full h-14 text-lg font-medium rounded-xl shadow-lg shadow-primary/20"
          >
            Get Started
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
