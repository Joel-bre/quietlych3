import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { InstallModal, shouldShowInstallModal, markInstallModalShown } from "@/components/pwa/InstallModal";
import { WizardStepWelcome } from "./wizard/WizardStepWelcome";
import { WizardStepCredentials } from "./wizard/WizardStepCredentials";
import { WizardStepPersonalize } from "./wizard/WizardStepPersonalize";

type WizardStep = "welcome" | "credentials" | "personalize";

export function MobileSignupWizard() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const { canInstall } = usePWAInstall();
  
  const [currentStep, setCurrentStep] = useState<WizardStep>("credentials");
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleCredentialsSubmit = async (email: string, password: string) => {
    setCredentials({ email, password });
    setCurrentStep("personalize");
  };

  const handleComplete = async (interests: string[]) => {
    if (!credentials) return;

    setLoading(true);

    const { error } = await signUp(credentials.email, credentials.password);

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      // Go back to credentials step on error
      setCurrentStep("credentials");
    } else {
      toast({
        title: "Account created!",
        description: "Welcome to your journal.",
      });

      // TODO: Save interests to user profile if needed
      console.log("User interests:", interests);

      // Show install modal if eligible
      if (canInstall && shouldShowInstallModal()) {
        markInstallModalShown();
        setShowInstallModal(true);
      } else {
        navigate("/");
      }
    }
  };

  const handleInstallModalClose = (open: boolean) => {
    setShowInstallModal(open);
    if (!open) {
      navigate("/");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <WizardStepWelcome 
            onNext={() => setCurrentStep("credentials")} 
          />
        );
      case "credentials":
        return (
          <WizardStepCredentials
            onBack={() => setCurrentStep("welcome")}
            onNext={handleCredentialsSubmit}
            isLoading={loading}
          />
        );
      case "personalize":
        return (
          <WizardStepPersonalize
            onBack={() => setCurrentStep("credentials")}
            onComplete={handleComplete}
            isLoading={loading}
          />
        );
    }
  };

  return (
    <>
      <InstallModal open={showInstallModal} onOpenChange={handleInstallModalClose} />
      <div className="fixed inset-0 bg-background overflow-hidden">
        {renderStep()}
      </div>
    </>
  );
}
