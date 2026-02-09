import { useState } from "react";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

interface WizardStepCredentialsProps {
  onBack: () => void;
  onNext: (email: string, password: string) => void;
  isLoading?: boolean;
}

export function WizardStepCredentials({ onBack, onNext, isLoading }: WizardStepCredentialsProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext(email, password);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] px-6 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0 -ml-2"
          disabled={isLoading}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {/* Progress dots */}
        <div className="flex gap-2 flex-1 justify-center pr-10">
          <div className="w-2 h-2 rounded-full bg-primary/30" />
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-primary/30" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Create your account
          </h2>
          <p className="text-muted-foreground">
            Enter your email and choose a secure password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                className="pl-10 h-12"
                disabled={isLoading}
                autoComplete="email"
                autoFocus
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">Password</Label>
            <PasswordInput
              id="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              }}
              showStrength
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Use at least 6 characters with a mix of letters and numbers
            </p>
          </div>

          <div className="flex-1" />

          <Button 
            type="submit" 
            size="lg" 
            className="w-full h-14 text-lg font-medium rounded-xl shadow-lg shadow-primary/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
