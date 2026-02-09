import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function Terms() {
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
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg">
            <strong className="text-foreground">Last updated:</strong> January 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Welcome to Quietly</h2>
            <p>
              By using Quietly, you agree to these terms. Please read them carefully. 
              Quietly is a personal journaling application designed to help you reflect, grow, and understand yourself better.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Using Quietly</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 13 years old to use Quietly.</li>
              <li>You are responsible for maintaining the security of your account.</li>
              <li>You agree to provide accurate information when creating your account.</li>
              <li>You may not use Quietly for any illegal or unauthorized purpose.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Your Content</h2>
            <p>
              Your journal entries belong to you. By using Quietly, you grant us a limited license to store, 
              process, and display your content back to you. We will never sell your content or use it for 
              advertising purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">AI Features</h2>
            <p>
              Quietly uses AI to provide insights and analysis of your journal entries. These insights are 
              generated automatically and are meant to be helpful suggestions, not professional advice. 
              The AI analysis is for personal reflection purposes only.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Attempt to access other users' accounts or data</li>
              <li>Use automated systems to access Quietly without permission</li>
              <li>Interfere with or disrupt the service</li>
              <li>Use Quietly to store or transmit harmful content</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Service Availability</h2>
            <p>
              We strive to keep Quietly available 24/7, but we cannot guarantee uninterrupted access. 
              We may occasionally need to perform maintenance or updates that temporarily affect availability.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Termination</h2>
            <p>
              You may delete your account at any time. We may also suspend or terminate your account if you 
              violate these terms. Upon termination, your data will be deleted according to our data retention policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Disclaimer</h2>
            <p>
              Quietly is provided "as is" without warranties of any kind. We are not responsible for any 
              decisions you make based on AI-generated insights. Quietly is not a substitute for professional 
              mental health care.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Changes to Terms</h2>
            <p>
              We may update these terms from time to time. We will notify you of significant changes via 
              email or through the app. Continued use of Quietly after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Contact</h2>
            <p>
              Questions about these terms? Contact us at{' '}
              <a href="mailto:hello@quietly.app" className="text-primary hover:underline">
                hello@quietly.app
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
