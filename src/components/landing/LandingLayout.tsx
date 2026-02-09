import { ReactNode } from 'react';
import { MarketingPanel, MobileAppMockup } from './MarketingPanel';

interface LandingLayoutProps {
  children: ReactNode;
  variant?: 'login' | 'signup';
}

export function LandingLayout({ children, variant = 'login' }: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Marketing Content */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/30">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="landing-orb landing-orb-1" />
          <div className="landing-orb landing-orb-2" />
          <div className="landing-orb landing-orb-3" />
        </div>
        
        <MarketingPanel variant={variant} />
      </div>

      {/* Mobile Marketing Header with animated orbs */}
      <div className="lg:hidden relative overflow-hidden">
        {/* Mobile animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="landing-orb-mobile landing-orb-mobile-1" />
          <div className="landing-orb-mobile landing-orb-mobile-2" />
        </div>
        
        <div className="relative z-10 px-6 pt-8 pb-6 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent">
          <MarketingPanel variant={variant} compact />
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {children}
        </div>
        
        {/* Mobile App Mockup - Below form */}
        <div className="lg:hidden w-full max-w-sm mt-8 mb-4 relative">
          {/* Decorative divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs text-muted-foreground font-medium">See what you can create</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          
          <MobileAppMockup />
        </div>
      </div>
    </div>
  );
}
