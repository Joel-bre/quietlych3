import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link to="/">
            <img src={logo} alt="Quietly" className="h-10 w-auto dark:brightness-100 brightness-90 contrast-125" />
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg">
            <strong className="text-foreground">Last updated:</strong> January 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Your Privacy Matters</h2>
            <p>
              Quietly is built with privacy at its core. Your journal entries are personal, and we treat them that way. 
              This policy explains how we collect, use, and protect your information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Account Information:</strong> Email address and password (encrypted) when you create an account.
              </li>
              <li>
                <strong className="text-foreground">Journal Entries:</strong> The content you write, including mood ratings, gratitude entries, and reflections.
              </li>
              <li>
                <strong className="text-foreground">Usage Data:</strong> Basic analytics like when you use the app and which features you access.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and improve the Quietly journaling experience</li>
              <li>To generate personalized AI insights based on your entries</li>
              <li>To send you reminders (only if you opt in)</li>
              <li>To analyze aggregate, anonymized trends to improve our service</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Data Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption. Journal entries are associated with your account 
              and protected by row-level security policies, meaning only you can access your own entries.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">AI Processing</h2>
            <p>
              When you use our AI insights feature, your journal entries are processed to generate personalized analysis. 
              This processing happens securely and your data is not used to train AI models or shared with third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Access:</strong> You can view all your data within the app at any time.
              </li>
              <li>
                <strong className="text-foreground">Deletion:</strong> You can delete individual entries or request complete account deletion.
              </li>
              <li>
                <strong className="text-foreground">Export:</strong> You can request an export of all your data.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Third-Party Services</h2>
            <p>
              We use trusted third-party services for infrastructure and analytics. These providers are bound by strict 
              data protection agreements and only process data as necessary to provide their services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
            <p>
              If you have questions about this privacy policy or your data, please reach out to us at{' '}
              <a href="mailto:privacy@quietly.app" className="text-primary hover:underline">
                privacy@quietly.app
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <img src={logo} alt="Quietly" className="h-8 w-auto dark:brightness-100 brightness-90 contrast-125" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Quietly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
